'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { addOwnerRole } from './actions'

const schema = z.object({
  location: z.string().min(2, 'City or zip is required'),
  numHorses: z.number().min(1, 'At least 1 horse required'),
  horseDetails: z.string().optional(),
  propertyAddress: z.string().min(2, 'Property area required'),
  barnAccessNotes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

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

export default function BecomeOwnerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
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

    const result = await addOwnerRole({
      userId: user.id,
      location: values.location,
      numHorses: values.numHorses,
      horseDetails: values.horseDetails,
      propertyAddress: values.propertyAddress,
      barnAccessNotes: values.barnAccessNotes,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
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
            Register as an Owner
          </h1>
          <p className="font-sans text-[#1A1A1A]/50 text-[0.95rem]">
            Tell us about your horses.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="bg-white rounded-2xl shadow-sm p-7 mb-6">
            <SectionHeader>Your Horses</SectionHeader>
            <div className="space-y-5">

              <div>
                <Label htmlFor="location" required>City / Zip code</Label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Milton, GA or 30004"
                  className={inputClass}
                  {...register('location')}
                />
                <FieldError message={errors.location?.message} />
              </div>

              <div>
                <Label htmlFor="numHorses" required>Number of horses</Label>
                <input
                  id="numHorses"
                  type="number"
                  min={1}
                  placeholder="1"
                  className={inputClass}
                  {...register('numHorses', { valueAsNumber: true })}
                />
                <FieldError message={errors.numHorses?.message} />
              </div>

              <div>
                <Label htmlFor="horseDetails">About your horses</Label>
                <textarea
                  id="horseDetails"
                  rows={3}
                  placeholder="e.g. Two quarter horses, ages 8 and 12. One is on daily medication."
                  className={textareaClass}
                  {...register('horseDetails')}
                />
                <FieldHint>Breed, age, temperament, special needs — anything a caretaker should know</FieldHint>
              </div>

              <div>
                <Label htmlFor="propertyAddress" required>General property area</Label>
                <input
                  id="propertyAddress"
                  type="text"
                  placeholder="e.g. Milton, GA — no street address needed yet"
                  className={inputClass}
                  {...register('propertyAddress')}
                />
                <FieldError message={errors.propertyAddress?.message} />
                <FieldHint>Exact address only shared after you connect with a caretaker</FieldHint>
              </div>

              <div>
                <Label htmlFor="barnAccessNotes">Anything else?</Label>
                <textarea
                  id="barnAccessNotes"
                  rows={3}
                  placeholder="Gate codes, parking instructions, barn quirks…"
                  className={textareaClass}
                  {...register('barnAccessNotes')}
                />
                <FieldHint>Gate codes, parking, barn quirks — you can add this later too</FieldHint>
              </div>

            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 mb-4">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-sans text-sm text-red-700 leading-snug">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Saving…' : 'Save & Continue'}
          </button>

        </form>
      </div>
    </div>
  )
}
