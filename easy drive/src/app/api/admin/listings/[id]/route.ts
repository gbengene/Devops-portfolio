import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession, createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/listings/[id]
 * Fetch full listing detail for the admin review page.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminSession()
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select(`
      id, make, model, year, plate_number, vin, colour, city,
      weekly_rate_cad, transmission, fuel_type, seats,
      bouncie_device_id, passtime_device_id,
      insurance_cert_url, insurance_cert_expires, insurance_covers_delivery,
      listing_status,
      host:profiles!host_id (
        full_name, email, phone, stripe_connect_status
      )
    `)
    .eq('id', params.id)
    .single()

  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

  const { data: photos } = await supabase
    .from('listing_photos')
    .select('id, storage_path, is_primary')
    .eq('vehicle_id', params.id)
    .order('sort_order')

  return NextResponse.json({ ...vehicle, photos: photos ?? [] })
}
