import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdminSession } from '@/lib/supabase/server'
import { notify } from '@/lib/notifications'
import { z } from 'zod'

const ReviewSchema = z.discriminatedUnion('action', [
  z.object({
    action:    z.literal('approve'),
    vehicleId: z.string().uuid(),
    weeklyRateCad: z.number().int().min(300).max(500),
  }),
  z.object({
    action:          z.literal('reject'),
    rejectionReason: z.string().min(10),
  }),
])

/**
 * POST /api/applications/[id]/review
 * Admin only — approve or reject a pending application.
 *
 * On approval:
 *  1. Update application status → approved
 *  2. Update vehicle status → rented
 *  3. Create rental record (status: pending_payment)
 *  4. Generate PandaDoc agreement + send signing link to renter
 *  5. Notify renter via SMS + email
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await requireAdminSession()

  const body = await req.json()
  const parsed = ReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Fetch application + applicant profile
  const { data: application } = await supabase
    .from('applications')
    .select('id, status, applicant_id, profiles!applicant_id(full_name, phone, email)')
    .eq('id', params.id)
    .single() as { data: any }

  if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  if (application.status !== 'pending') {
    return NextResponse.json({ error: 'Application is not in pending status' }, { status: 409 })
  }

  const adminProfile = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .single()

  // ── REJECT ────────────────────────────────────────────────────────────────
  if (parsed.data.action === 'reject') {
    await supabase
      .from('applications')
      .update({
        status:           'rejected',
        rejection_reason: parsed.data.rejectionReason,
        reviewed_by:      adminProfile.data?.id,
        reviewed_at:      new Date().toISOString(),
      })
      .eq('id', params.id)

    await notify.rentalRejected({
      renterPhone: application.profiles.phone,
      renterEmail: application.profiles.email,
      renterName:  application.profiles.full_name,
      reason:      parsed.data.rejectionReason,
    }).catch(console.error)

    return NextResponse.json({ status: 'rejected' })
  }

  // ── APPROVE ───────────────────────────────────────────────────────────────
  const { vehicleId, weeklyRateCad } = parsed.data

  // Verify vehicle is available
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, plate_number, make, model, year')
    .eq('id', vehicleId)
    .eq('status', 'available')
    .single()

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle is not available' }, { status: 409 })
  }

  // Update application
  await supabase
    .from('applications')
    .update({
      status:      'approved',
      reviewed_by: adminProfile.data?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  // Reserve vehicle
  await supabase
    .from('vehicles')
    .update({ status: 'rented' })
    .eq('id', vehicleId)

  // Create rental
  const { data: rental } = await supabase
    .from('rentals')
    .insert({
      renter_id:      application.applicant_id,
      vehicle_id:     vehicleId,
      application_id: application.id,
      status:         'pending_payment',
      weekly_rate_cad: weeklyRateCad,
      deposit_cad:    500,
    })
    .select('id')
    .single()

  if (!rental) {
    return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 })
  }

  // Generate PandaDoc agreement
  let signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/apply/sign`  // fallback if PandaDoc fails
  try {
    const pandadocRes = await fetch('https://api.pandadoc.com/public/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `API-Key ${process.env.PANDADOC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Easy Drive Rental Agreement — ${application.profiles.full_name}`,
        template_uuid: process.env.PANDADOC_TEMPLATE_ID,
        recipients: [{
          email: application.profiles.email,
          first_name: application.profiles.full_name.split(' ')[0],
          last_name:  application.profiles.full_name.split(' ').slice(1).join(' '),
          role:       'Renter',
        }],
        tokens: [
          { name: 'renter.name',        value: application.profiles.full_name },
          { name: 'renter.phone',       value: application.profiles.phone },
          { name: 'vehicle.plate',      value: vehicle.plate_number },
          { name: 'vehicle.make_model', value: `${vehicle.year} ${vehicle.make} ${vehicle.model}` },
          { name: 'rental.weekly_rate', value: `$${weeklyRateCad}` },
          { name: 'rental.deposit',     value: '$500' },
          { name: 'rental.id',          value: rental.id },
        ],
      }),
    })
    const doc = await pandadocRes.json()
    signingUrl = doc.recipients?.[0]?.shared_link ?? signingUrl

    await supabase
      .from('rentals')
      .update({ pandadoc_document_id: doc.id, pandadoc_status: 'sent' })
      .eq('id', rental.id)
  } catch (err) {
    console.error('PandaDoc error — sending fallback signing URL', err)
  }

  await notify.rentalApproved({
    renterPhone: application.profiles.phone,
    renterEmail: application.profiles.email,
    renterName:  application.profiles.full_name,
    signingUrl,
  }).catch(console.error)

  return NextResponse.json({ status: 'approved', rentalId: rental.id }, { status: 200 })
}
