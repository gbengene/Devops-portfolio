'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

// ── Step schemas ──────────────────────────────────────────────────────────────

const Step1Schema = z.object({
  make:         z.string().min(1, 'Required'),
  model:        z.string().min(1, 'Required'),
  year:         z.number().int().min(2010).max(new Date().getFullYear() + 1),
  vin:          z.string().length(17, 'VIN must be 17 characters'),
  plate_number: z.string().min(4, 'Required'),
  colour:       z.string().min(1, 'Required'),
  transmission: z.enum(['automatic', 'manual']),
  fuel_type:    z.enum(['gasoline', 'hybrid', 'electric']),
  seats:        z.number().int().min(2).max(9),
  city:         z.string().min(1, 'Required'),
  pickup_postal_code: z.string().min(6, 'Enter a valid postal code'),
})

const Step5Schema = z.object({
  weekly_rate_cad:       z.number().int().min(200).max(2000),
  auto_accept_bookings:  z.boolean(),
  bouncie_device_id:     z.string().min(1, 'Required'),
  passtime_device_id:    z.string().optional(),
})

type Step1Data = z.infer<typeof Step1Schema>
type Step5Data = z.infer<typeof Step5Schema>

const TOTAL_STEPS = 5

export default function NewListingPage() {
  const router = useRouter()
  const [step, setStep]               = useState(1)
  const [vehicleId, setVehicleId]     = useState<string | null>(null)
  const [step1, setStep1]             = useState<Partial<Step1Data>>({})
  const [step5, setStep5]             = useState<Partial<Step5Data>>({})
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // ── Step 1: Vehicle details ────────────────────────────────────────────────
  async function handleStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const raw = {
      make:         fd.get('make') as string,
      model:        fd.get('model') as string,
      year:         Number(fd.get('year')),
      vin:          fd.get('vin') as string,
      plate_number: fd.get('plate_number') as string,
      colour:       fd.get('colour') as string,
      transmission: fd.get('transmission') as 'automatic' | 'manual',
      fuel_type:    fd.get('fuel_type') as 'gasoline' | 'hybrid' | 'electric',
      seats:        Number(fd.get('seats')),
      city:         fd.get('city') as string,
      pickup_postal_code: fd.get('pickup_postal_code') as string,
    }
    const parsed = Step1Schema.safeParse(raw)
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/host/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const json = await res.json() as { vehicleId?: string; error?: string }
      if (!res.ok) { setError(json.error ?? 'Failed to create listing'); return }
      setStep1(parsed.data)
      setVehicleId(json.vehicleId ?? null)
      setStep(2)
    } catch {
      setError('Network error. Please retry.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2: Photos (simple upload prompt — actual upload via API) ──────────
  // ── Step 3: Insurance cert upload ─────────────────────────────────────────
  // ── Step 4: GPS / kill switch device IDs ──────────────────────────────────
  // ── Step 5: Rate + settings then submit ───────────────────────────────────
  async function handleStep5(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const raw = {
      weekly_rate_cad:      Number(fd.get('weekly_rate_cad')),
      auto_accept_bookings: fd.get('auto_accept_bookings') === 'true',
      bouncie_device_id:    fd.get('bouncie_device_id') as string,
      passtime_device_id:   fd.get('passtime_device_id') as string || undefined,
    }
    const parsed = Step5Schema.safeParse(raw)
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }

    if (!vehicleId) { setError('Vehicle ID missing — please restart.'); return }

    setSubmitting(true)
    try {
      // Save rate + device IDs
      await fetch(`/api/host/listings/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      // Submit for admin review
      const res = await fetch(`/api/host/listings/${vehicleId}/submit`, { method: 'POST' })
      const json = await res.json() as { error?: string }
      if (!res.ok) { setError(json.error ?? 'Submission failed'); return }

      router.push('/host/listings')
    } catch {
      setError('Network error. Please retry.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">List a new vehicle</h1>
          <span className="text-sm text-gray-500">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: 'var(--color-primary)' }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* ── Step 1 ── */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Vehicle details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Make" name="make" placeholder="Toyota" required />
            <Field label="Model" name="model" placeholder="Corolla" required />
            <Field label="Year" name="year" type="number" placeholder="2020" required />
            <Field label="Colour" name="colour" placeholder="Silver" required />
          </div>
          <Field label="VIN (17 characters)" name="vin" placeholder="1HGCM82633A004352" required />
          <Field label="Plate number" name="plate_number" placeholder="ABCD 123" required />
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="Transmission" name="transmission" options={['automatic', 'manual']} required />
            <SelectField label="Fuel type" name="fuel_type" options={['gasoline', 'hybrid', 'electric']} required />
            <Field label="Seats" name="seats" type="number" placeholder="5" required />
          </div>
          <Field label="City" name="city" placeholder="Toronto" required />
          <Field label="Pickup postal code" name="pickup_postal_code" placeholder="M5V 2T6" required />
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center" style={{ minHeight: 44 }}>
            {submitting ? 'Saving...' : 'Continue'}
          </button>
        </form>
      )}

      {/* ── Step 2: Photos ── */}
      {step === 2 && vehicleId && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Upload photos</h2>
          <p className="text-sm text-gray-500">
            Upload at least 8 photos: exterior (all 4 angles), interior, dashboard, odometer, and any existing damage.
            Each photo must be under 10 MB (JPEG or PNG).
          </p>
          <PhotoUploader vehicleId={vehicleId} />
          <button onClick={() => setStep(3)} className="btn-primary w-full justify-center" style={{ minHeight: 44 }}>
            Continue
          </button>
        </div>
      )}

      {/* ── Step 3: Insurance ── */}
      {step === 3 && vehicleId && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Insurance certificate</h2>
          <p className="text-sm text-gray-500">
            Upload a copy of your valid commercial insurance certificate.
            It must confirm coverage for P2P car rental and delivery use.
          </p>
          <InsuranceUploader vehicleId={vehicleId} />
          <button onClick={() => setStep(4)} className="btn-primary w-full justify-center" style={{ minHeight: 44 }}>
            Continue
          </button>
        </div>
      )}

      {/* ── Step 4: GPS / kill switch ── */}
      {step === 4 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">GPS & kill switch device IDs</h2>
          <p className="text-sm text-gray-500">
            Every listed vehicle must have a Bouncie GPS tracker installed.
            Enter the device IDs from your Bouncie dashboard.
          </p>
          <Field label="Bouncie GPS device ID" name="bouncie_device_id_step4" placeholder="BNCI-XXXXXX" required />
          <Field label="PassTime kill switch device ID (optional)" name="passtime_id_step4" placeholder="PT-XXXXXX" />
          <button onClick={() => setStep(5)} className="btn-primary w-full justify-center" style={{ minHeight: 44 }}>
            Continue
          </button>
        </div>
      )}

      {/* ── Step 5: Rate & submit ── */}
      {step === 5 && (
        <form onSubmit={handleStep5} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Rate & settings</h2>
          <Field label="Weekly rate (CAD)" name="weekly_rate_cad" type="number" placeholder="350" required />
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" name="auto_accept_bookings" value="true" className="rounded" />
              Auto-accept booking requests
            </label>
            <p className="text-xs text-gray-400 mt-1 ml-6">
              If unchecked, each booking request requires your manual approval.
            </p>
          </div>
          <Field label="Bouncie GPS device ID" name="bouncie_device_id" placeholder="BNCI-XXXXXX" required />
          <Field label="PassTime kill switch device ID (optional)" name="passtime_device_id" placeholder="PT-XXXXXX" />
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Submitting will send your listing to Easy Drive for review. You will hear back within 48 hours.
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center" style={{ minHeight: 44 }}>
            {submitting ? 'Submitting...' : 'Submit for review'}
          </button>
        </form>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Field({
  label, name, type = 'text', placeholder, required,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

function SelectField({
  label, name, options, required,
}: {
  label: string
  name: string
  options: string[]
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
      </select>
    </div>
  )
}

function PhotoUploader({ vehicleId }: { vehicleId: string }) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded]   = useState(0)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      await fetch(`/api/host/listings/${vehicleId}/photos`, { method: 'POST', body: fd })
      setUploaded(prev => prev + 1)
    }
    setUploading(false)
  }

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png"
        onChange={handleFiles}
        className="block text-sm text-gray-600"
      />
      {uploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
      {uploaded > 0 && <p className="text-xs text-green-600 mt-1">{uploaded} photo(s) uploaded</p>}
    </div>
  )
}

function InsuranceUploader({ vehicleId }: { vehicleId: string }) {
  const [uploading, setUploading] = useState(false)
  const [done, setDone]           = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    await fetch(`/api/host/listings/${vehicleId}/photos`, { method: 'POST', body: fd })
    setUploading(false)
    setDone(true)
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleFile}
        className="block text-sm text-gray-600"
      />
      {uploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
      {done && <p className="text-xs text-green-600 mt-1">Insurance certificate uploaded</p>}
    </div>
  )
}
