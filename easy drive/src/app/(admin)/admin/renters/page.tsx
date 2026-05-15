import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminRentersQueuePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin')

  const { data: applications } = await supabase
    .from('renter_applications')
    .select(`
      id, status, submitted_at, rejection_reason,
      renter:profiles!renter_id (
        id, full_name, phone, email, ontario_licence_number,
        licence_class, at_fault_accidents, gig_platform,
        id_document_url, driver_abstract_url, gig_account_screenshot_url
      )
    `)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true }) as { data: any[] | null }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Renter applications</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {applications?.length ?? 0} application(s) pending
        </p>
      </div>

      {!applications || applications.length === 0 ? (
        <div className="card p-10 text-center text-sm text-gray-500">
          No pending renter applications.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{app.renter?.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {app.renter?.email} · {app.renter?.phone}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Licence: {app.renter?.ontario_licence_number} ({app.renter?.licence_class}) ·
                    At-fault: {app.renter?.at_fault_accidents} ·
                    Platform: {app.renter?.gig_platform}
                  </p>
                  <p className="text-xs text-gray-400">
                    Submitted: {new Date(app.submitted_at).toLocaleDateString('en-CA')}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <ApproveButton applicationId={app.id} renterId={app.renter?.id} />
                  <RejectButton applicationId={app.id} renterId={app.renter?.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// These are client action buttons — extracted to keep the page a Server Component
function ApproveButton({ applicationId, renterId }: { applicationId: string; renterId: string }) {
  return (
    <form action={`/api/admin/renters/${renterId}/approve`} method="POST">
      <input type="hidden" name="application_id" value={applicationId} />
      <button type="submit" className="btn-primary text-xs px-3" style={{ minWidth: 'auto', minHeight: 32 }}>
        Approve
      </button>
    </form>
  )
}

function RejectButton({ applicationId, renterId }: { applicationId: string; renterId: string }) {
  return (
    <form action={`/api/admin/renters/${renterId}/reject`} method="POST">
      <input type="hidden" name="application_id" value={applicationId} />
      <button type="submit" className="btn-secondary text-xs px-3 text-red-600 border-red-200"
        style={{ minWidth: 'auto', minHeight: 32 }}>
        Reject
      </button>
    </form>
  )
}
