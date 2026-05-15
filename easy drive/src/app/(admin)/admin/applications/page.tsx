import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Clock, CheckCircle, XCircle, User, Car, Phone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ApplicationsQueue() {
  const supabase = createClient()

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id, status, submitted_at,
      applicant:profiles!applicant_id (
        full_name, phone, email,
        licence_class, at_fault_accidents, licence_suspended,
        gig_platform,
        id_document_url, driver_abstract_url, gig_account_screenshot_url
      )
    `)
    .order('submitted_at', { ascending: false }) as { data: any[] | null }

  const pending   = (applications ?? []).filter(a => a.status === 'pending')
  const reviewed  = (applications ?? []).filter(a => a.status !== 'pending')

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pending.length} pending · {reviewed.length} reviewed
        </p>
      </div>

      {/* Pending */}
      {pending.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="font-medium text-gray-700">All caught up</p>
          <p className="text-sm text-gray-400 mt-1">No pending applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Pending Review ({pending.length})
          </h2>
          {pending.map(app => (
            <ApplicationRow key={app.id} application={app} />
          ))}
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-6">
            Reviewed
          </h2>
          {reviewed.map(app => (
            <ApplicationRow key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  )
}

function ApplicationRow({ application: app }: { application: any }) {
  const renter = app.applicant
  const isPending = app.status === 'pending'
  const autoChecks = {
    noSuspension: !renter.licence_suspended,
    lowAccidents: renter.at_fault_accidents < 3,
    hasGig:       !!renter.gig_platform,
    hasDocs:      !!(renter.id_document_url && renter.driver_abstract_url),
  }
  const checksPass = Object.values(autoChecks).every(Boolean)

  return (
    <Link href={`/admin/applications/${app.id}`}>
      <div className={`card-hover flex items-center gap-4 ${isPending ? 'border-l-4 border-l-amber-400' : ''}`}>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-400" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm">{renter.full_name}</p>
            <StatusBadge status={app.status} />
            {isPending && checksPass && (
              <span className="badge-available text-[10px]">Auto-checks pass</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />{renter.phone}
            </span>
            <span className="flex items-center gap-1">
              <Car className="w-3 h-3" />Licence {renter.licence_class}
            </span>
            <span>{platformLabel(renter.gig_platform)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(app.submitted_at)}
            </span>
          </div>
        </div>

        {/* Quick check indicators */}
        <div className="hidden sm:flex items-center gap-1">
          {Object.entries(autoChecks).map(([key, pass]) => (
            <div key={key} title={checkLabel(key)}
              className={`w-2 h-2 rounded-full ${pass ? 'bg-green-400' : 'bg-red-400'}`}
            />
          ))}
        </div>

        <span className="text-gray-300 text-lg">›</span>
      </div>
    </Link>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:   'badge-pending',
    approved:  'badge-active',
    rejected:  'badge-rejected',
    cancelled: 'badge-terminated',
  }
  return <span className={map[status] ?? 'badge'}>{status}</span>
}

function platformLabel(p: string) {
  const map: Record<string, string> = {
    uber_eats: 'Uber Eats', doordash: 'DoorDash',
    skip: 'SkipTheDishes', instacart: 'Instacart',
  }
  return map[p] ?? p
}

function checkLabel(key: string) {
  const map: Record<string, string> = {
    noSuspension: 'No licence suspension',
    lowAccidents: 'Fewer than 3 at-fault accidents',
    hasGig:       'Gig platform verified',
    hasDocs:      'Documents uploaded',
  }
  return map[key] ?? key
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
