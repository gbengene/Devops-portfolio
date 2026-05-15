import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient, requireSession } from '@/lib/supabase/server'
import { notify } from '@/lib/notifications'
import { z } from 'zod'

const ApplicationSchema = z.object({
  full_name:              z.string().min(2),
  phone:                  z.string().regex(/^\+1\d{10}$/, 'Phone must be a valid Canadian number in format +1XXXXXXXXXX'),
  ontario_licence_number: z.string().min(5),
  licence_class:          z.enum(['G', 'G2']),
  at_fault_accidents:     z.number().int().min(0).max(10),
  licence_suspended:      z.boolean(),
  gig_platform:           z.enum(['uber_eats', 'doordash', 'skip', 'instacart']),
})

/**
 * POST /api/applications
 * Submit a new renter application.
 * Authenticated renters only — one active application at a time.
 */
export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ApplicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createClient()
  const adminClient = createAdminClient()

  // Upsert profile with application data
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .upsert({
      auth_user_id:            session.user.id,
      email:                   session.user.email!,
      full_name:               parsed.data.full_name,
      phone:                   parsed.data.phone,
      ontario_licence_number:  parsed.data.ontario_licence_number,
      licence_class:           parsed.data.licence_class,
      at_fault_accidents:      parsed.data.at_fault_accidents,
      licence_suspended:       parsed.data.licence_suspended,
      gig_platform:            parsed.data.gig_platform,
      role:                    'renter',
    }, { onConflict: 'auth_user_id' })
    .select('id')
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }

  // Block if there is already a pending or approved application
  const { data: existing } = await adminClient
    .from('applications')
    .select('id, status')
    .eq('applicant_id', profile.id)
    .in('status', ['pending', 'approved'])
    .single()

  if (existing) {
    return NextResponse.json(
      { error: `You already have a ${existing.status} application.` },
      { status: 409 }
    )
  }

  // Auto-reject: no suspended licences or 3+ at-fault accidents
  if (parsed.data.licence_suspended) {
    return NextResponse.json(
      { error: 'Applications with a suspended licence cannot be accepted.' },
      { status: 422 }
    )
  }
  if (parsed.data.at_fault_accidents >= 3) {
    return NextResponse.json(
      { error: 'Applications with 3 or more at-fault accidents cannot be accepted.' },
      { status: 422 }
    )
  }

  const { data: application, error: appError } = await adminClient
    .from('applications')
    .insert({ applicant_id: profile.id, status: 'pending' })
    .select('id')
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }

  // Notify admin
  await notify.newApplication({
    applicantName:  parsed.data.full_name,
    applicationId:  application.id,
  }).catch(console.error)   // non-blocking — don't fail the request if SMS fails

  return NextResponse.json({ applicationId: application.id }, { status: 201 })
}

/**
 * GET /api/applications
 * Admin: list all pending applications.
 * Renter: get their own application(s).
 */
export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('auth_user_id', session.user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (profile.role === 'admin') {
    const { data } = await supabase
      .from('applications')
      .select(`
        id, status, submitted_at, rejection_reason,
        applicant:profiles!applicant_id (
          full_name, phone, email, licence_class,
          at_fault_accidents, gig_platform,
          id_document_url, driver_abstract_url, gig_account_screenshot_url
        )
      `)
      .order('submitted_at', { ascending: false })
    return NextResponse.json(data)
  }

  // Renter: own applications only
  const { data } = await supabase
    .from('applications')
    .select('id, status, submitted_at, rejection_reason')
    .eq('applicant_id', profile.id)
    .order('submitted_at', { ascending: false })

  return NextResponse.json(data)
}
