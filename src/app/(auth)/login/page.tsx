'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — Brand ─────────────────────── */}
      <div className="hidden md:flex md:w-2/5 bg-[#2D5016] relative flex-col justify-between p-12 overflow-hidden">

        {/* Atmospheric decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-white/[0.07]" />
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border border-white/[0.06]" />
          <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-80 h-80 rounded-full bg-white/[0.025]" />
          <div className="absolute bottom-32 -right-16 w-56 h-56 rounded-full border border-white/[0.05]" />
          <div className="absolute bottom-16 left-8 w-36 h-36 rounded-full bg-white/[0.03]" />
          <div className="absolute top-1/3 right-16 w-20 h-20 rounded-full bg-[#C9922A]/[0.08]" />
        </div>

        {/* Brand content */}
        <div className="relative z-10">
          <Link href="/" className="font-display text-3xl font-bold text-white tracking-tight">
            HorseWatch
          </Link>
          <p className="mt-4 text-white/65 font-sans text-lg leading-relaxed max-w-xs">
            Trusted horse care,<br />when you can&apos;t be there.
          </p>
        </div>

        {/* Spacer pushes trust line to bottom */}
        <div className="relative z-10 mt-auto">
          <div className="w-8 h-px bg-[#C9922A]/50 mb-6" />
          <p className="text-white/45 font-sans text-sm tracking-wide">
            Serving the Atlanta equestrian community
          </p>
        </div>
      </div>

      {/* ── Right panel — Form ─────────────────────── */}
      <div className="flex-1 bg-[#FAF9F6] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile-only wordmark */}
          <div className="md:hidden mb-10">
            <Link href="/" className="font-display text-2xl font-bold text-[#2D5016]">
              HorseWatch
            </Link>
          </div>

          <h1 className="font-display text-[2rem] font-bold text-[#1A1A1A] mb-1.5 leading-tight">
            Welcome back
          </h1>
          <p className="font-sans text-[#1A1A1A]/50 text-[0.95rem] mb-8">
            Sign in to your HorseWatch account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-sans"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-lg font-sans text-[#1A1A1A] text-sm placeholder-[#1A1A1A]/30 focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-colors duration-150"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1A1A1A] mb-1.5 font-sans"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 bg-white border border-[#e5e7eb] rounded-lg font-sans text-[#1A1A1A] text-sm placeholder-[#1A1A1A]/30 focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-colors duration-150"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error box */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200">
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
              className="w-full py-3.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Signup links */}
          <div className="mt-8 pt-7 border-t border-[#1A1A1A]/[0.08]">
            <p className="font-sans text-sm text-[#1A1A1A]/50 text-center mb-3">
              Don&apos;t have an account?
            </p>
            <div className="flex gap-3">
              <Link
                href="/signup/owner"
                className="flex-1 py-2.5 text-center rounded-full border border-[#2D5016] text-[#2D5016] font-sans text-sm font-medium hover:bg-[#2D5016] hover:text-white transition-all duration-200"
              >
                Sign up as owner
              </Link>
              <Link
                href="/signup/caretaker"
                className="flex-1 py-2.5 text-center rounded-full border border-[#2D5016] text-[#2D5016] font-sans text-sm font-medium hover:bg-[#2D5016] hover:text-white transition-all duration-200"
              >
                Become a caretaker
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
