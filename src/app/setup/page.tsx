'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { setupOwnerProfile, setupCaretakerProfile } from './actions'

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

// ── Schemas ───────────────────────────────────────────────

const ownerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  location: z.string().min(2, 'City or zip is required'),
  numHorses: z.number().min(1, 'At least 1 horse required'),
  horseDetails: z.string().optional(),
  propertyAddress: z.string().min(2, 'Property area required'),
  barnAccessNotes: z.string().optional(),
})

const caretakerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  location: z.string().min(2, 'City or zip is required'),
  bio: z.string().min(10, 'Please tell owners about yourself'),
  yearsExperience: z.number().min(0),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  disciplines: z.array(z.string()).min(1, 'Select at least one discipline'),
  hasOwnTransport: z.boolean(),
  ratesPerDay: z.string().optional(),
  availabilityNotes: z.string().optional(),
  referencesAvailable: z.boolean(),
})

type OwnerValues = z.infer<typeof ownerSchema>
type CaretakerValues = z.infer<typeof caretakerSchema>

// ── Field components ──────────────────────────────────────

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

// ── Owner form ────────────────────────────────────────────

function OwnerForm({ userId, email, onDone }: { userId: string; email: string; onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<OwnerValues>({
    resolver: zodResolver(ownerSchema),
  })

  const onSubmit = async (values: OwnerValues) => {
    setError('')
    setLoading(true)
    const result = await setupOwnerProfile({ userId, email, ...values })
    if (result.error) { setError(result.error); setLoading(false); return }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="bg-white rounded-2xl shadow-sm p-7 mb-5">
        <SectionHeader>About You</SectionHeader>
        <div className="space-y-5">
          <div>
            <Label htmlFor="fullName" required>Full name</Label>
            <input id="fullName" type="text" placeholder="Jane Smith" className={inputClass} {...register('fullName')} />
            <FieldError message={errors.fullName?.message} />
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <input id="phone" type="tel" placeholder="(404) 555-0100" className={inputClass} {...register('phone')} />
            <FieldHint>Optional, but helpful for caretakers</FieldHint>
          </div>
          <div>
            <Label htmlFor="location" required>City / Zip code</Label>
            <input id="location" type="text" placeholder="e.g. Milton, GA or 30004" className={inputClass} {...register('location')} />
            <FieldError message={errors.location?.message} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-7 mb-6">
        <SectionHeader>Your Horses</SectionHeader>
        <div className="space-y-5">
          <div>
            <Label htmlFor="numHorses" required>Number of horses</Label>
            <input id="numHorses" type="number" min={1} placeholder="1" className={inputClass} {...register('numHorses', { valueAsNumber: true })} />
            <FieldError message={errors.numHorses?.message} />
          </div>
          <div>
            <Label htmlFor="horseDetails">About your horses</Label>
            <textarea id="horseDetails" rows={3} placeholder="Breed, age, temperament, special needs…" className={textareaClass} {...register('horseDetails')} />
          </div>
          <div>
            <Label htmlFor="propertyAddress" required>General property area</Label>
            <input id="propertyAddress" type="text" placeholder="e.g. Milton, GA — no street address needed yet" className={inputClass} {...register('propertyAddress')} />
            <FieldError message={errors.propertyAddress?.message} />
            <FieldHint>Exact address only shared after you connect with a caretaker</FieldHint>
          </div>
          <div>
            <Label htmlFor="barnAccessNotes">Anything else?</Label>
            <textarea id="barnAccessNotes" rows={2} placeholder="Gate codes, parking, barn quirks…" className={textareaClass} {...register('barnAccessNotes')} />
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

      <button type="submit" disabled={loading} className="w-full py-3.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200">
        {loading ? 'Saving…' : 'Complete Setup'}
      </button>
    </form>
  )
}

// ── Caretaker form ────────────────────────────────────────

function CaretakerForm({ userId, email, onDone }: { userId: string; email: string; onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CaretakerValues>({
    resolver: zodResolver(caretakerSchema),
    defaultValues: { services: [], disciplines: [], hasOwnTransport: false, referencesAvailable: false },
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
        resolve({ base64: dataUrl.split(',')[1], mimeType: file.type, extension: file.name.split('.').pop() ?? 'jpg' })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const onSubmit = async (values: CaretakerValues) => {
    setError('')
    setLoading(true)
    let photo
    if (photoFile) { try { photo = await readFileAsBase64(photoFile) } catch { /* optional */ } }
    const result = await setupCaretakerProfile({ userId, email, ...values, photo })
    if (result.error) { setError(result.error); setLoading(false); return }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="bg-white rounded-2xl shadow-sm p-7 mb-5">
        <SectionHeader>About You</SectionHeader>
        <div className="space-y-5">
          <div>
            <Label htmlFor="fullName" required>Full name</Label>
            <input id="fullName" type="text" placeholder="Jane Smith" className={inputClass} {...register('fullName')} />
            <FieldError message={errors.fullName?.message} />
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <input id="phone" type="tel" placeholder="(404) 555-0100" className={inputClass} {...register('phone')} />
          </div>
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
                {photoPreview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  : <svg className="w-6 h-6 text-[#2D5016]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                }
              </div>
              <div>
                <p className="font-sans text-sm font-medium text-[#2D5016]">{photoFile ? photoFile.name : 'Upload a photo'}</p>
                <p className="font-sans text-xs text-[#1A1A1A]/40 mt-0.5">JPG, PNG — optional</p>
              </div>
            </div>
            <input ref={photoInputRef} id="photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div>
            <Label htmlFor="yearsExperience" required>Years of experience</Label>
            <input id="yearsExperience" type="number" min={0} placeholder="5" className={inputClass} {...register('yearsExperience', { valueAsNumber: true })} />
            <FieldError message={errors.yearsExperience?.message} />
          </div>

          <div>
            <Label htmlFor="bio" required>About you</Label>
            <textarea id="bio" rows={4} placeholder="Tell owners about your background with horses…" className={textareaClass} {...register('bio')} />
            <FieldError message={errors.bio?.message} />
          </div>

          <div>
            <p className="text-sm font-medium text-[#1A1A1A] mb-2 font-sans">Services offered<span className="text-[#C9922A] ml-0.5">*</span></p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map(({ value, label }) => (
                <label key={value} className="cursor-pointer">
                  <input type="checkbox" value={value} className="sr-only" {...register('services')} />
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150 select-none ${(watch('services') ?? []).includes(value) ? 'bg-[#2D5016] text-white border-[#2D5016]' : 'bg-white text-[#1A1A1A]/60 border-[#e5e7eb] hover:border-[#2D5016]/30'}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <FieldError message={errors.services?.message} />
          </div>

          <div>
            <p className="text-sm font-medium text-[#1A1A1A] mb-2 font-sans">Disciplines<span className="text-[#C9922A] ml-0.5">*</span></p>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map(({ value, label }) => (
                <label key={value} className="cursor-pointer">
                  <input type="checkbox" value={value} className="sr-only" {...register('disciplines')} />
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150 select-none ${(watch('disciplines') ?? []).includes(value) ? 'bg-[#2D5016] text-white border-[#2D5016]' : 'bg-white text-[#1A1A1A]/60 border-[#e5e7eb] hover:border-[#2D5016]/30'}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <FieldError message={errors.disciplines?.message} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-7 mb-6">
        <SectionHeader>Availability &amp; Rates</SectionHeader>
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-[#1A1A1A] mb-2 font-sans">Own transportation?</p>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button key={String(val)} type="button" onClick={() => setValue('hasOwnTransport', val, { shouldValidate: true })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-sans font-medium border transition-all duration-150 ${hasOwnTransport === val ? 'bg-[#2D5016] text-white border-[#2D5016]' : 'bg-white text-[#1A1A1A]/55 border-[#e5e7eb] hover:border-[#2D5016]/30'}`}>
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="ratesPerDay">Approximate daily rate</Label>
            <input id="ratesPerDay" type="text" placeholder="e.g. $75/day" className={inputClass} {...register('ratesPerDay')} />
          </div>
          <div>
            <Label htmlFor="availabilityNotes">Availability</Label>
            <textarea id="availabilityNotes" rows={2} placeholder="e.g. Available weekends and summers" className={textareaClass} {...register('availabilityNotes')} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A1A] mb-2 font-sans">References available?</p>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button key={String(val)} type="button" onClick={() => setValue('referencesAvailable', val, { shouldValidate: true })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-sans font-medium border transition-all duration-150 ${referencesAvailable === val ? 'bg-[#2D5016] text-white border-[#2D5016]' : 'bg-white text-[#1A1A1A]/55 border-[#e5e7eb] hover:border-[#2D5016]/30'}`}>
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

      <button type="submit" disabled={loading} className="w-full py-3.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200">
        {loading ? 'Saving…' : 'Complete Setup'}
      </button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────

export default function SetupPage() {
  const router = useRouter()
  const [role, setRole] = useState<'owner' | 'caretaker' | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      setEmail(user.email ?? '')
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="font-sans text-sm text-[#1A1A1A]/40">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-6 py-10">
      <div className="max-w-[600px] mx-auto">

        <div className="flex items-center gap-2 mb-10">
          <span className="font-display text-xl font-bold text-[#2D5016]">HorseWatch</span>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-[2rem] font-bold text-[#1A1A1A] mb-2 leading-tight">
            Complete your profile
          </h1>
          <p className="font-sans text-[#1A1A1A]/50 text-[0.95rem]">
            Your account was created — just tell us a bit more to get started.
          </p>
        </div>

        {!role ? (
          <div className="space-y-4">
            <p className="font-sans text-sm font-semibold text-[#1A1A1A]/60 uppercase tracking-wide">I am a…</p>
            <button
              onClick={() => setRole('owner')}
              className="w-full bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-shadow duration-200 border-2 border-transparent hover:border-[#2D5016]/20"
            >
              <p className="font-display text-lg font-bold text-[#1A1A1A] mb-1">Horse Owner</p>
              <p className="font-sans text-sm text-[#1A1A1A]/50">I own horses and need trusted care coverage.</p>
            </button>
            <button
              onClick={() => setRole('caretaker')}
              className="w-full bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-shadow duration-200 border-2 border-transparent hover:border-[#2D5016]/20"
            >
              <p className="font-display text-lg font-bold text-[#1A1A1A] mb-1">Caretaker</p>
              <p className="font-sans text-sm text-[#1A1A1A]/50">I have horse experience and want to offer care.</p>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setRole(null)}
                className="text-[#2D5016] hover:text-[#1e3710] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <p className="font-sans text-sm text-[#1A1A1A]/50">
                Setting up as <span className="font-semibold text-[#1A1A1A]">{role === 'owner' ? 'Horse Owner' : 'Caretaker'}</span>
              </p>
            </div>

            {role === 'owner' && userId && email && (
              <OwnerForm userId={userId} email={email} onDone={() => router.push('/dashboard')} />
            )}
            {role === 'caretaker' && userId && email && (
              <CaretakerForm userId={userId} email={email} onDone={() => router.push('/dashboard')} />
            )}
          </>
        )}

      </div>
    </div>
  )
}
