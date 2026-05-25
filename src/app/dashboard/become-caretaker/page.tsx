'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { addCaretakerRole } from './actions'

// ── Constants ─────────────────────────────────────────────

const SERVICES = [
  { value: 'feeding_turnout', label: 'Daily Feeding & Turnout' },
  { value: 'riding_exercise', label: 'Riding & Exercise' },
  { value: 'overnight', label: 'Overnight Care' },
]

const DISCIPLINES = [
  { value: 'hunter_jumper', label: 'Hunter/Jumper' },
  { value: 'western', label: 'Western' },
  { value: 'dressage', label: 'Dressage' },
  { value: 'trail', label: 'Trail Riding' },
  { value: 'general', label: 'General Care' },
]

const schema = z.object({
  location: z.string().min(2, 'City or zip is required'),
  yearsExperience: z.number().min(0, 'Please enter your years of experience'),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  disciplines: z.array(z.string()).min(1, 'Select at least one discipline'),
  hasOwnTransport: z.boolean(),
  ratesPerDay: z.string().optional(),
  availabilityNotes: z.string().optional(),
  bio: z.string().min(10, 'Please tell owners about yourself'),
  referencesAvailable: z.boolean(),
})

type FormValues = z.infer<typeof schema>

// ── Shared field components ───────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600 mt-1">{message}</p>
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-[#1A1A1A]/45 mt-1 font-sans">{children}</p>
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-sans">
      {children}
      {required && <span className="text-[#C9922A] ml-0.5">*</span>}
    </label>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
        {children}
      </span>
    </div>
  )
}

const inputClass =
  'w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-lg font-sans text-[#1A1A1A] text-sm placeholder-[#1A1A1A]/30 focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-colors duration-150'

const textareaClass =
  'w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-lg font-sans text-[#1A1A1A] text-sm placeholder-[#1A1A1A]/30 focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-colors duration-150 resize-none'

// ── Page ──────────────────────────────────────────────────

export default function BecomeCaretakerPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      services: [],
      disciplines: [],
      hasOwnTransport: false,
      referencesAvailable: false,
    },
  })

  const hasOwnTransport = watch('hasOwnTransport')
  const referencesAvailable = watch('referencesAvailable')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const readFileAsBase64 = (file: File): Promise<{ base64: string; mimeType: string; extension: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const base64 = dataUrl.split(',')[1]
        resolve({ base64, mimeType: file.type, extension: file.name.split('.').pop() ?? 'jpg' })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const onSubmit = async (values: FormValues) => {
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    let photo
    if (photoFile) {
      try { photo = await readFileAsBase64(photoFile) } catch { /* optional */ }
    }

    const result = await addCaretakerRole({
      userId: user.id,
      location: values.location,
      yearsExperience: values.yearsExperience,
      services: values.services,
      disciplines: values.disciplines,
      hasOwnTransport: values.hasOwnTransport,
      ratesPerDay: values.ratesPerDay,
      availabilityNotes: values.availabilityNotes,
      bio: values.bio,
      referencesAvailable: values.referencesAvailable,
      photo,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[480px]">
          <div className="w-16 h-16 rounded-full bg-[#2D5016]/8 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#2D5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-3 text-center">
            Application submitted
          </h1>
          <p className="font-sans text-[#1A1A1A]/55 text-sm text-center leading-relaxed mb-8">
            Your caretaker profile is now under review. We&apos;ll let you know when it&apos;s approved.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-6 py-10">
      <div className="max-w-[600px] mx-auto">

        {/* Back link */}
        <div className="flex items-center gap-2 mb-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[#2D5016] hover:text-[#1e3710] transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-display text-xl font-bold">Dashboard</span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-display text-[2rem] font-bold text-[#1A1A1A] mb-2 leading-tight">
            Become a Caretaker
          </h1>
          <p className="font-sans text-[#1A1A1A]/50 text-[0.95rem]">
            Tell owners about your experience.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Experience */}
          <div className="bg-white rounded-2xl shadow-sm p-7 mb-5">
            <SectionHeader>Your Experience</SectionHeader>
            <div className="space-y-5">

              <div>
                <Label htmlFor="location" required>City / Zip code</Label>
                <input id="location" type="text" placeholder="e.g. Milton, GA or 30004" className={inputClass} {...register('location')} />
                <FieldError message={errors.location?.message} />
              </div>

              {/* Photo */}
              <div>
                <Label htmlFor="photo">Profile photo</Label>
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                  <div className="w-16 h-16 rounded-full bg-[#2D5016]/[0.06] border-2 border-dashed border-[#2D5016]/20 flex items-center justify-center overflow-hidden flex-shrink-0 hover:bg-[#2D5016]/[0.09] transition-colors">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-[#2D5016]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-[#2D5016]">{photoFile ? photoFile.name : 'Upload a photo'}</p>
                    <p className="font-sans text-xs text-[#1A1A1A]/40 mt-0.5">JPG, PNG — optional but recommended</p>
                  </div>
                </div>
                <input ref={photoInputRef} id="photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
              </div>

              <div>
                <Label htmlFor="yearsExperience" required>Years of experience with horses</Label>
                <input id="yearsExperience" type="number" min={0} placeholder="5" className={inputClass} {...register('yearsExperience', { valueAsNumber: true })} />
                <FieldError message={errors.yearsExperience?.message} />
              </div>

              <div>
                <Label htmlFor="bio" required>About you</Label>
                <textarea id="bio" rows={4} placeholder="Tell owners about your background with horses, your approach to care, and what makes you a great caretaker…" className={textareaClass} {...register('bio')} />
                <FieldError message={errors.bio?.message} />
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2 font-sans">Services offered<span className="text-[#C9922A] ml-0.5">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map(({ value, label }) => (
                    <label key={value} className="cursor-pointer">
                      <input type="checkbox" value={value} className="sr-only" {...register('services')} />
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150 select-none ${
                        (watch('services') ?? []).includes(value)
                          ? 'bg-[#2D5016] text-white border-[#2D5016]'
                          : 'bg-white text-[#1A1A1A]/60 border-[#e5e7eb] hover:border-[#2D5016]/30'
                      }`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError message={errors.services?.message} />
              </div>

              {/* Disciplines */}
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2 font-sans">Disciplines<span className="text-[#C9922A] ml-0.5">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {DISCIPLINES.map(({ value, label }) => (
                    <label key={value} className="cursor-pointer">
                      <input type="checkbox" value={value} className="sr-only" {...register('disciplines')} />
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150 select-none ${
                        (watch('disciplines') ?? []).includes(value)
                          ? 'bg-[#2D5016] text-white border-[#2D5016]'
                          : 'bg-white text-[#1A1A1A]/60 border-[#e5e7eb] hover:border-[#2D5016]/30'
                      }`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError message={errors.disciplines?.message} />
              </div>

            </div>
          </div>

          {/* Availability & Rates */}
          <div className="bg-white rounded-2xl shadow-sm p-7 mb-6">
            <SectionHeader>Availability &amp; Rates</SectionHeader>
            <div className="space-y-5">

              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2 font-sans">Do you have your own transportation?</p>
                <div className="flex gap-3">
                  {[true, false].map((val) => (
                    <button key={String(val)} type="button" onClick={() => setValue('hasOwnTransport', val, { shouldValidate: true })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-sans font-medium border transition-all duration-150 ${
                        hasOwnTransport === val ? 'bg-[#2D5016] text-white border-[#2D5016]' : 'bg-white text-[#1A1A1A]/55 border-[#e5e7eb] hover:border-[#2D5016]/30'
                      }`}>
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="ratesPerDay">Approximate daily rate</Label>
                <input id="ratesPerDay" type="text" placeholder="e.g. $75/day" className={inputClass} {...register('ratesPerDay')} />
                <FieldHint>Approximate is fine — exact rates are worked out directly with owners</FieldHint>
              </div>

              <div>
                <Label htmlFor="availabilityNotes">Availability</Label>
                <textarea id="availabilityNotes" rows={2} placeholder="e.g. Available weekends and summers, or full-time available" className={textareaClass} {...register('availabilityNotes')} />
              </div>

              <div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2 font-sans">References available?</p>
                <div className="flex gap-3">
                  {[true, false].map((val) => (
                    <button key={String(val)} type="button" onClick={() => setValue('referencesAvailable', val, { shouldValidate: true })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-sans font-medium border transition-all duration-150 ${
                        referencesAvailable === val ? 'bg-[#2D5016] text-white border-[#2D5016]' : 'bg-white text-[#1A1A1A]/55 border-[#e5e7eb] hover:border-[#2D5016]/30'
                      }`}>
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 mb-4">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-sans text-sm text-red-700 leading-snug">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200">
            {loading ? 'Saving…' : 'Submit Application'}
          </button>

        </form>
      </div>
    </div>
  )
}
