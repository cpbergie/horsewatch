'use client'

import { useState } from 'react'
import { submitInquiry } from './actions'

const SERVICE_LABELS: Record<string, string> = {
  feeding_turnout: 'Daily Feeding & Turnout',
  riding_exercise: 'Riding & Exercise',
  overnight: 'Overnight Care',
}

interface Props {
  caretakerId: string
  caretakerName: string
  caretakerLocation: string | null
  caretakerPhotoUrl: string | null
  offeredServices: string[]
  defaultHorseCount: number
  defaultPhone: string
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function InquiryForm({
  caretakerId,
  caretakerName,
  caretakerLocation,
  caretakerPhotoUrl,
  offeredServices,
  defaultHorseCount,
  defaultPhone,
}: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstName = caretakerName.split(' ')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await submitInquiry(caretakerId, formData)

    // submitInquiry redirects on success; only reaches here on error
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Caretaker mini-card ─────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#2D5016]/[0.08] flex items-center justify-center">
          {caretakerPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={caretakerPhotoUrl} alt={caretakerName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-sans text-sm font-bold text-[#2D5016]/50">{getInitials(caretakerName)}</span>
          )}
        </div>
        <div>
          <p className="font-display font-bold text-[#1A1A1A] text-base leading-tight">{caretakerName}</p>
          {caretakerLocation && (
            <p className="font-sans text-sm text-[#1A1A1A]/45 mt-0.5">{caretakerLocation}</p>
          )}
        </div>
      </div>

      {/* ── Service requested ───────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
            Service Requested
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {offeredServices.map((svc, i) => (
            <label key={svc} className="relative cursor-pointer">
              <input
                type="radio"
                name="service_requested"
                value={svc}
                defaultChecked={i === 0}
                required
                className="sr-only peer"
              />
              <span className="inline-block border border-[#2D5016]/25 text-[#1A1A1A]/60 text-sm font-sans font-medium rounded-full px-4 py-2 peer-checked:bg-[#2D5016] peer-checked:text-white peer-checked:border-[#2D5016] transition-all duration-150 select-none">
                {SERVICE_LABELS[svc] ?? svc}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Trip dates + horse count ────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
            Trip Details
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="trip_start" className="font-sans text-sm font-medium text-[#1A1A1A]/70">
              Start date <span className="text-red-400">*</span>
            </label>
            <input
              id="trip_start"
              name="trip_start"
              type="date"
              required
              className="border border-[#e5e7eb] rounded-xl px-4 py-2.5 font-sans text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D5016]/30 focus:border-[#2D5016] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="trip_end" className="font-sans text-sm font-medium text-[#1A1A1A]/70">
              End date <span className="text-red-400">*</span>
            </label>
            <input
              id="trip_end"
              name="trip_end"
              type="date"
              required
              className="border border-[#e5e7eb] rounded-xl px-4 py-2.5 font-sans text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D5016]/30 focus:border-[#2D5016] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="horse_count" className="font-sans text-sm font-medium text-[#1A1A1A]/70">
              Number of horses <span className="text-red-400">*</span>
            </label>
            <input
              id="horse_count"
              name="horse_count"
              type="number"
              min={1}
              max={20}
              defaultValue={defaultHorseCount || 1}
              required
              className="border border-[#e5e7eb] rounded-xl px-4 py-2.5 font-sans text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D5016]/30 focus:border-[#2D5016] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Contact ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
            Your Contact Info
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="font-sans text-sm font-medium text-[#1A1A1A]/70">
            Phone number <span className="text-red-400">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaultPhone}
            placeholder="404-555-0100"
            required
            className="border border-[#e5e7eb] rounded-xl px-4 py-2.5 font-sans text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D5016]/30 focus:border-[#2D5016] transition-colors max-w-xs"
          />
          <p className="font-sans text-xs text-[#1A1A1A]/40 mt-0.5">
            {firstName} will use this to get in touch with you directly.
          </p>
        </div>
      </div>

      {/* ── Message ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
            Message
          </span>
        </div>
        <textarea
          name="message"
          rows={4}
          placeholder={`Tell ${firstName} a bit about your horses, your property, and anything they should know…`}
          className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 font-sans text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:ring-2 focus:ring-[#2D5016]/30 focus:border-[#2D5016] transition-colors resize-none"
        />
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="font-sans text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ── Submit ──────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#2D5016] text-white rounded-full py-3.5 font-sans font-semibold text-sm hover:bg-[#1e3710] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Sending inquiry…' : `Send inquiry to ${firstName}`}
      </button>

      <p className="font-sans text-xs text-center text-[#1A1A1A]/35 pb-2">
        Your contact info will be shared with {firstName} so they can reach out directly.
      </p>
    </form>
  )
}
