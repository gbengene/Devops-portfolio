'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'personal' | 'licence' | 'gig' | 'documents' | 'review'

const STEPS: Step[] = ['personal', 'licence', 'gig', 'documents', 'review']

const STEP_LABELS: Record<Step, string> = {
  personal:  '1. Personal Info',
  licence:   '2. Licence',
  gig:       '3. Gig Account',
  documents: '4. Documents',
  review:    '5. Review',
}

interface FormData {
  full_name:              string
  phone:                  string
  email:                  string
  ontario_licence_number: string
  licence_class:          'G' | 'G2' | ''
  at_fault_accidents:     number
  licence_suspended:      boolean
  gig_platform:           'uber_eats' | 'doordash' | 'skip' | 'instacart' | ''
  id_document:            File | null
  driver_abstract:        File | null
  gig_screenshot:         File | null
}

const INITIAL: FormData = {
  full_name:              '',
  phone:                  '',
  email:                  '',
  ontario_licence_number: '',
  licence_class:          '',
  at_fault_accidents:     0,
  licence_suspended:      false,
  gig_platform:           '',
  id_document:            null,
  driver_abstract:        null,
  gig_screenshot:         null,
}

export default function ApplyPage() {
  const router  = useRouter()
  const [step, setStep]       = useState<Step>('personal')
  const [form, setForm]       = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const currentIndex = STEPS.indexOf(step)
  const isFirst = currentIndex === 0
  const isLast  = step === 'review'

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setError(null)
  }

  function next() {
    if (!isLast) setStep(STEPS[currentIndex + 1])
  }

  function back() {
    if (!isFirst) setStep(STEPS[currentIndex - 1])
  }

  async function uploadDocument(file: File, bucket: string, filename: string): Promise<string> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const path = `${crypto.randomUUID()}/${filename}`
    const { error } = await supabase.storage.from(bucket).upload(path, file)
    if (error) throw new Error(`Upload failed: ${error.message}`)
    return path
  }

  async function submit() {
    setLoading(true)
    setError(null)

    try {
      // Upload documents to Supabase Storage
      const [idUrl, abstractUrl, gigUrl] = await Promise.all([
        form.id_document    ? uploadDocument(form.id_document,    'documents', 'id.jpg')                : Promise.resolve(''),
        form.driver_abstract ? uploadDocument(form.driver_abstract, 'documents', 'driver_abstract.pdf') : Promise.resolve(''),
        form.gig_screenshot  ? uploadDocument(form.gig_screenshot,  'documents', 'gig_account.jpg')    : Promise.resolve(''),
      ])

      // Update profile with document URLs first
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('profiles').update({
        id_document_url:           idUrl,
        driver_abstract_url:       abstractUrl,
        gig_account_screenshot_url: gigUrl,
      }).eq('email', form.email)

      // Submit application
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name:              form.full_name,
          phone:                  form.phone,
          ontario_licence_number: form.ontario_licence_number,
          licence_class:          form.licence_class,
          at_fault_accidents:     form.at_fault_accidents,
          licence_suspended:      form.licence_suspended,
          gig_platform:           form.gig_platform,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.push('/apply/submitted')
    } catch (err: any) {
      setError(err.message ?? 'Upload failed. Please check your files and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Apply to Rent — Easy Drive</h1>
        <p className="text-gray-500 mt-1 text-sm">Weekly rentals for gig drivers · No hard credit check</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between mb-1">
          {STEPS.map(s => (
            <span key={s} className={`text-xs ${s === step ? 'text-teal-700 font-semibold' : 'text-gray-400'}`}>
              {STEP_LABELS[s].split('. ')[1]}
            </span>
          ))}
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full">
          <div
            className="h-1.5 bg-teal-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form card */}
      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step: Personal */}
        {step === 'personal' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">Personal Information</h2>
            <Field label="Full Name">
              <input type="text" value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                placeholder="As it appears on your ID"
                className={inputClass}
              />
            </Field>
            <Field label="Phone Number (Ontario)">
              <input type="tel" value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+14161234567"
                className={inputClass}
              />
            </Field>
            <Field label="Email Address">
              <input type="email" value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="you@email.com"
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {/* Step: Licence */}
        {step === 'licence' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">Ontario Driver's Licence</h2>
            <Field label="Licence Number">
              <input type="text" value={form.ontario_licence_number}
                onChange={e => update('ontario_licence_number', e.target.value.toUpperCase())}
                placeholder="A1234-12345-12345"
                className={inputClass}
              />
            </Field>
            <Field label="Licence Class">
              <select value={form.licence_class}
                onChange={e => update('licence_class', e.target.value as any)}
                className={inputClass}
              >
                <option value="">Select class</option>
                <option value="G">G (Full licence)</option>
                <option value="G2">G2 (Graduated)</option>
              </select>
            </Field>
            <Field label="At-fault accidents in past 3 years">
              <select value={form.at_fault_accidents}
                onChange={e => update('at_fault_accidents', Number(e.target.value))}
                className={inputClass}
              >
                {[0,1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n}{n === 3 ? ' (will be declined)' : ''}{n === 0 ? ' (none)' : ''}</option>
                ))}
              </select>
            </Field>
            <Field label="Is your licence currently suspended?">
              <div className="flex gap-4 mt-1">
                {[{ label: 'No', value: false }, { label: 'Yes', value: true }].map(opt => (
                  <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="suspended"
                      checked={form.licence_suspended === opt.value}
                      onChange={() => update('licence_suspended', opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* Step: Gig */}
        {step === 'gig' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">Gig Platform</h2>
            <p className="text-sm text-gray-500">We rent exclusively to active gig delivery drivers.</p>
            <Field label="Which platform do you primarily use?">
              <select value={form.gig_platform}
                onChange={e => update('gig_platform', e.target.value as any)}
                className={inputClass}
              >
                <option value="">Select platform</option>
                <option value="uber_eats">Uber Eats</option>
                <option value="doordash">DoorDash</option>
                <option value="skip">SkipTheDishes</option>
                <option value="instacart">Instacart</option>
              </select>
            </Field>
            <div className="bg-blue-50 border border-blue-100 rounded p-3 text-sm text-blue-700">
              In the next step you will upload a screenshot of your active delivery account.
              This should show your name and active driver status.
            </div>
          </div>
        )}

        {/* Step: Documents */}
        {step === 'documents' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">Document Upload</h2>
            <p className="text-sm text-gray-500">All files are stored securely and only viewed by Easy Drive staff.</p>
            <FileField
              label="Government-Issued Photo ID (front)"
              accept="image/*,.pdf"
              onChange={f => update('id_document', f)}
              file={form.id_document}
            />
            <FileField
              label="Ontario Driver Abstract (from MTO)"
              accept="image/*,.pdf"
              hint="Pull yours at ontario.ca/page/get-driver-abstract (~$12)"
              onChange={f => update('driver_abstract', f)}
              file={form.driver_abstract}
            />
            <FileField
              label="Active Gig Account Screenshot"
              accept="image/*"
              hint="Must show your name and active delivery status"
              onChange={f => update('gig_screenshot', f)}
              file={form.gig_screenshot}
            />
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-800">Review Your Application</h2>
            <dl className="text-sm divide-y divide-gray-100">
              {[
                ['Full Name',       form.full_name],
                ['Phone',           form.phone],
                ['Email',           form.email],
                ['Licence Number',  form.ontario_licence_number],
                ['Licence Class',   form.licence_class],
                ['At-fault Accidents', form.at_fault_accidents.toString()],
                ['Licence Suspended',  form.licence_suspended ? 'Yes' : 'No'],
                ['Gig Platform',    form.gig_platform],
                ['ID Document',     form.id_document?.name ?? '—'],
                ['Driver Abstract', form.driver_abstract?.name ?? '—'],
                ['Gig Screenshot',  form.gig_screenshot?.name ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-800 text-right max-w-[60%] truncate">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-gray-400 mt-4">
              By submitting you agree to Easy Drive's rental terms, GPS tracking disclosure, and
              ignition interrupt consent as detailed in the rental agreement.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 gap-3">
          <button
            onClick={back}
            disabled={isFirst}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 disabled:opacity-30 hover:bg-gray-50"
          >
            Back
          </button>
          {isLast ? (
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          ) : (
            <button
              onClick={next}
              className="flex-1 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

function FileField({ label, accept, hint, onChange, file }: {
  label: string
  accept: string
  hint?: string
  onChange: (f: File | null) => void
  file: File | null
}) {
  return (
    <Field label={label}>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <label className={`
        block w-full border-2 border-dashed rounded-lg px-3 py-4 text-center cursor-pointer
        ${file ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}
      `}>
        <input type="file" accept={accept} className="sr-only"
          onChange={e => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <span className="text-sm text-teal-700 font-medium">✓ {file.name}</span>
        ) : (
          <span className="text-sm text-gray-400">Click to upload</span>
        )}
      </label>
    </Field>
  )
}
