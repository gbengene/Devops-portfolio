import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Phone, Mail, Car } from 'lucide-react'
import { ApplicationReviewForm } from './ReviewForm'

export const dynamic = 'force-dynamic'

export default async function ApplicationReview({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: app } = await supabase
    .from('applications')
    .select(`
      id, status, submitted_at, rejection_reason,
      applicant:profiles!applicant_id (
        id, full_name, phone, email,
        licence_class, at_fault_accidents, licence_suspended,
        gig_platform,
        id_document_url, driver_abstract_url, gig_account_screenshot_url
      )
    `)
    .eq('id', params.id)
    .single() as { data: any }

  if (!app) notFound()

  // Available vehicles (for approval form)
  const { data: availableVehicles } = await supabase
    .from('vehicles')
    .select('id, make, model, year, plate_number, colour')
    .eq('status', 'available')

  const renter = app.applicant
  const checks = [
    { label: 'No licence suspension',        pass: !renter.licence_suspended },
    { label: 'Fewer than 3 at-fault accidents', pass: renter.at_fault_accidents < 3 },
    { label: 'Active gig account',            pass: !!renter.gig_platform },
    { label: 'All documents uploaded',        pass: !!(renter.id_document_url && renter.driver_abstract_url && renter.gig_account_screenshot_url) },
  ]
  const allPass = checks.every(c => c.pass)

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/applications" className="btn-ghost p-2" style={{ minWidth: 'auto' }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{renter.full_name}</h1>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Submitted {new Date(app.submitted_at).toLocaleDateString('en-CA', { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Left: Applicant info + documents */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Applicant Information</h2>
            <div className="space-y-2.5">
              {[
                { icon: Phone, label: 'Phone',    value: renter.phone, href: `tel:${renter.phone}` },
                { icon: Mail,  label: 'Email',    value: renter.email, href: `mailto:${renter.email}` },
                { icon: Car,   label: 'Licence',  value: `Class ${renter.licence_class}` },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400 w-16">{label}</span>
                  {href
                    ? <a href={href} className="text-sm text-primary hover:underline font-medium">{value}</a>
                    : <span className="text-sm text-gray-900 font-medium">{value}</span>
                  }
                </div>
              ))}
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-gray-400 w-16">Accidents</span>
                <span className={`text-sm font-medium ${renter.at_fault_accidents >= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                  {renter.at_fault_accidents} at-fault (3yr)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-gray-400 w-16">Suspended</span>
                <span className={`text-sm font-medium ${renter.licence_suspended ? 'text-red-600' : 'text-green-600'}`}>
                  {renter.licence_suspended ? 'Yes — SUSPENDED' : 'No'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-gray-400 w-16">Platform</span>
                <span className="text-sm font-medium text-gray-900">{platformLabel(renter.gig_platform)}</span>
              </div>
            </div>
          </div>

          {/* Auto-checks */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Automatic Checks</h2>
            <div className="space-y-2">
              {checks.map(c => (
                <div key={c.label} className="flex items-center gap-2.5">
                  {c.pass
                    ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <XCircle    className="w-4 h-4 text-red-500 flex-shrink-0" />
                  }
                  <span className={`text-sm ${c.pass ? 'text-gray-700' : 'text-red-700 font-medium'}`}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
            {allPass && (
              <div className="mt-3 alert-success">
                <p className="text-sm font-medium text-green-800">All checks passed — eligible for approval</p>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Documents</h2>
            <div className="grid grid-cols-3 gap-2">
              <DocPreview label="Photo ID"       url={renter.id_document_url} />
              <DocPreview label="Driver Abstract" url={renter.driver_abstract_url} />
              <DocPreview label="Gig Account"    url={renter.gig_account_screenshot_url} />
            </div>
          </div>
        </div>

        {/* Right: Review form */}
        <div>
          {app.status === 'pending' ? (
            <ApplicationReviewForm
              applicationId={app.id}
              availableVehicles={availableVehicles ?? []}
              allChecksPass={allPass}
            />
          ) : (
            <ReviewedState status={app.status} reason={app.rejection_reason} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DocPreview({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="aspect-square rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
        <span className="text-xs text-gray-400 text-center px-2">{label}<br/>Not uploaded</span>
      </div>
    )
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity group">
      <div className="text-center">
        <span className="text-2xl">📄</span>
        <p className="text-[10px] text-gray-500 mt-1">{label}</p>
        <p className="text-[10px] text-primary opacity-0 group-hover:opacity-100">View →</p>
      </div>
    </a>
  )
}

function ReviewedState({ status, reason }: { status: string; reason?: string }) {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Review Decision</h2>
      {status === 'approved' ? (
        <div className="alert-success">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-semibold text-green-800">Application Approved</p>
          </div>
          <p className="text-sm text-green-700 mt-1">Rental agreement was sent to the applicant.</p>
        </div>
      ) : (
        <div className="alert-critical">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-red-800">Application Rejected</p>
          </div>
          {reason && <p className="text-sm text-red-700 mt-1">Reason: {reason}</p>}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  'badge-pending', approved: 'badge-active',
    rejected: 'badge-rejected', cancelled: 'badge-terminated',
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
