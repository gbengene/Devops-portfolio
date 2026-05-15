import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const DeleteSchema = z.object({
  photo_id: z.string().uuid(),
})

/**
 * POST /api/host/listings/[id]/photos
 * Upload a photo for a vehicle listing.
 * Expects multipart/form-data with a 'file' field.
 * Stores in Supabase Storage bucket 'listing-photos'.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let profile: Awaited<ReturnType<typeof requireApprovedHost>>['profile']

  try {
    const result = await requireApprovedHost()
    profile = result.profile
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Ownership check
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', params.id)
    .eq('host_id', profile.id)
    .single()

  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found or access denied' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG and PNG files are accepted.' }, { status: 415 })
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024  // 10 MB
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit.' }, { status: 413 })
  }

  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const storagePath = `${profile.id}/${params.id}/${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('listing-photos')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('Photo upload error:', uploadError)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  // Count existing photos to determine sort_order and is_primary
  const { count: existingCount } = await supabase
    .from('listing_photos')
    .select('id', { count: 'exact', head: true })
    .eq('vehicle_id', params.id)

  const { data: photo, error: insertError } = await supabase
    .from('listing_photos')
    .insert({
      vehicle_id:   params.id,
      storage_path: storagePath,
      sort_order:   existingCount ?? 0,
      is_primary:   (existingCount ?? 0) === 0,  // first photo is primary
    })
    .select('id, storage_path, sort_order, is_primary')
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Failed to record photo' }, { status: 500 })
  }

  return NextResponse.json(photo, { status: 201 })
}

/**
 * DELETE /api/host/listings/[id]/photos
 * Remove a photo by photo ID.
 * Body: { photo_id: string }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let profile: Awaited<ReturnType<typeof requireApprovedHost>>['profile']

  try {
    const result = await requireApprovedHost()
    profile = result.profile
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = DeleteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'photo_id is required' }, { status: 400 })

  const supabase = createAdminClient()

  // Fetch photo + verify ownership via vehicle
  const { data: photo } = await supabase
    .from('listing_photos')
    .select('id, storage_path, vehicle_id')
    .eq('id', parsed.data.photo_id)
    .eq('vehicle_id', params.id)
    .single()

  if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

  // Verify vehicle belongs to this host
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', photo.vehicle_id)
    .eq('host_id', profile.id)
    .single()

  if (!vehicle) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  // Delete from storage and DB
  await supabase.storage.from('listing-photos').remove([photo.storage_path])
  await supabase.from('listing_photos').delete().eq('id', photo.id)

  return NextResponse.json({ success: true })
}
