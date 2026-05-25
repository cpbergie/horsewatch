'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { ownerSignupSchema, type OwnerSignupValues } from '@/lib/validations/owner-signup'
import { createOwnerProfile } from './actions'

// ── Reusable field components ─────────────────────────────

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

const inputClass =
  'w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-lg font-sans text-[#1A1A1A] text-sm placeholder-[#1A1A1A]/30 focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-colors duration-150'

const textareaClass =
  'w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-lg font-sans text-[#1A1A1A] text-sm placeholder-[#1A1A1A]/30 focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-colors duration-150 resize-none'

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

// ── Main page ─────────────────────────────────────────────

export default function OwnerSignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OwnerSignupValues>({
    resolver: zodResolver(ownerSignupSchema),
  })

  const onSubmit = async (values: OwnerSignupValues) => {
    setError('')
    setLoading(true)

    const supabase = createClient()

    // 1. Create auth account
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Signup failed, please try again.')
      setLoading(false)
      return
    }

    // 2. Write profile via server action (service role bypasses RLS)
    const result = await createOwnerProfile({
      userId: data.user.id,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
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

    setSubmittedEmail(values.email)
    setSubmitted(true)
  }

  // ── Success state ──────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[480px] text-center">
          <div className="w-16 h-16 rounded-full bg-[#2D5016]/8 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#2D5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-3">
            Check your inbox
          </h1>
          <p className="font-sans text-[#1A1A1A]/55 text-base leading-relaxed mb-8">
            We sent a confirmation link to{' '}
            <span className="font-medium text-[#1A1A1A]">{submittedEmail}</span>.
            Click it to activate your account, then you can log in and browse caretakers.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF9F6] px-6 py-10">
      <div className="max-w-[600px] mx-auto">

        {/* Top nav */}
        <div className="flex items-center gap-2 mb-10">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[#2D5016] hover:text-[#1e3710] transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-display text-xl font-bold">HorseWatch</span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-display text-[2rem] font-bold text-[#1A1A1A] mb-2 leading-tight">
            Create your owner account
          </h1>
          <p className="font-sans text-[#1A1A1A]/50 text-[0.95rem]">
            Tell us about yourself and your horses.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ── Section 1: Your Account ─────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-7 mb-5">
            <SectionHeader>Your Account</SectionHeader>

            <div className="space-y-5">

              {/* Full name */}
              <div>
                <Label htmlFor="fullName" required>Full name</Label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  className={inputClass}
                  {...register('fullName')}
                />
                <FieldError message={errors.fullName?.message} />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" required>Email address</Label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  {...register('email')}
                />
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" required>Password</Label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className={`${inputClass} pr-11`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/35 hover:text-[#1A1A1A]/65 transition-colors duration-150"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(404) 555-0100"
                  className={inputClass}
                  {...register('phone')}
                />
                <FieldHint>Optional, but helpful for caretakers</FieldHint>
              </div>

            </div>
          </div>

          {/* ── Section 2: Your Horses ──────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-7 mb-6">
            <SectionHeader>Your Horses</SectionHeader>

            <div className="space-y-5">

              {/* Location */}
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

              {/* Num horses */}
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

              {/* Horse details */}
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

              {/* Property area */}
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

              {/* Barn notes */}
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

          {/* Error box */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 mb-4">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-sans text-sm text-red-700 leading-snug">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          {/* Login link */}
          <p className="text-center font-sans text-sm text-[#1A1A1A]/50 mt-5 mb-8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2D5016] font-medium hover:underline">
              Sign in
            </Link>
          </p>

        </form>
      </div>
    </div>
  )
}
