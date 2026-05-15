import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminListingsQueuePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin')

  // Fetch vehicles awaiting review
  const { data: listings } = await supabase
    .from('vehicles')
    .select(`
      id, make, model, year, plate_number, city, weekly_rate_cad,
      insurance_cert_url, bouncie_device_id, listing_status,
      host:profiles!host_id (full_name, email, phone)
    `)
    .eq('listing_status', 'pending_review')
    .order('created_at', { ascending: true }) as { data: any[] | null }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Listing review queue</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {listings?.length ?? 0} vehicle(s) awaiting review
        </p>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="card p-10 text-center text-sm text-gray-500">
          No listings pending review. Check back later.
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(v => (
            <Link
              key={v.id}
              href={`/admin/listings/${v.id}`}
              className="card p-4 flex items-center justify-between hover:border-primary transition-colors block"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {v.year} {v.make} {v.model} — {v.plate_number}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Host: {v.host?.full_name} · {v.host?.email}
                  {v.city && ` · ${v.city}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {v.weekly_rate_cad && (
                  <span className="text-sm font-medium text-gray-900">${v.weekly_rate_cad}/wk</span>
                )}
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Pending
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
