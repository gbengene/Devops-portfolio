import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient, createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateListingSchema = z.object({
  make:               z.string().min(1),
  model:              z.string().min(1),
  year:               z.number().int().min(2010).max(new Date().getFullYear() + 1),
  vin:                z.string().length(17),
  plate_number:       z.string().min(4),
  colour:             z.string().optional(),
  transmission:       z.enum(['automatic', 'manual']),
  fuel_type:          z.enum(['gasoline', 'hybrid', 'electric']),
  seats:              z.number().int().min(2).max(9),
  city:               z.string().min(1),
  pickup_postal_code: z.string().min(6),
})

/**
 * POST /api/host/listings
 * Create a new vehicle listing draft.
 * The vehicle starts in 'draft' status and must pass through the 5-step wizard
 * before being submitted for admin review.
 */
export async function POST(req: NextRequest) {
  let profile: Awaited<ReturnType<typeof requireApprovedHost>>['profile']

  try {
    const result = await requireApprovedHost()
    profile = result.profile
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = CreateListingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Check for duplicate VIN
  const { data: existing } = await supabase
    .from('vehicles')
    .select('id')
    .eq('vin', parsed.data.vin)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'A vehicle with this VIN already exists.' }, { status: 409 })
  }

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .insert({
      host_id:            profile.id,
      make:               parsed.data.make,
      model:              parsed.data.model,
      year:               parsed.data.year,
      vin:                parsed.data.vin,
      plate_number:       parsed.data.plate_number,
      colour:             parsed.data.colour ?? null,
      transmission:       parsed.data.transmission,
      fuel_type:          parsed.data.fuel_type,
      seats:              parsed.data.seats,
      city:               parsed.data.city,
      pickup_postal_code: parsed.data.pickup_postal_code,
      listing_status:     'draft',
      odometer_km:        0,
    } as any)
    .select('id')
    .single()

  if (error || !vehicle) {
    console.error('Vehicle insert error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }

  return NextResponse.json({ vehicleId: vehicle.id }, { status: 201 })
}

/**
 * GET /api/host/listings
 * List all vehicles belonging to the current host.
 */
export async function GET(req: NextRequest) {
  let profile: Awaited<ReturnType<typeof requireApprovedHost>>['profile']

  try {
    const result = await requireApprovedHost()
    profile = result.profile
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, make, model, year, plate_number, listing_status, weekly_rate_cad, city, avg_rating, created_at')
    .eq('host_id', profile.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(vehicles ?? [])
}
