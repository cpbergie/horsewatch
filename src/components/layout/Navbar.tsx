'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoaded, setAuthLoaded] = useState(false)

  useEffect(() => {
    if (!isLanding) return
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLanding])

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      // getSession reads from local storage — no network call, no flash
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
        setIsAdmin(profile?.is_admin ?? false)
      }
      setAuthLoaded(true)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
        setIsAdmin(profile?.is_admin ?? false)
      } else {
        setIsAdmin(false)
      }
      setAuthLoaded(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        !isLanding || scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className={`font-display text-2xl font-bold tracking-tight transition-colors duration-300 ${
            !isLanding || scrolled ? 'text-[#2D5016]' : 'text-white'
          }`}
        >
          HorseWatch
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {authLoaded && (user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`text-sm font-medium transition-colors duration-300 ${
                    !isLanding || scrolled ? 'text-[#C9922A] hover:text-[#b37e20]' : 'text-white/85 hover:text-white'
                  }`}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors duration-300 ${
                  !isLanding || scrolled ? 'text-[#1A1A1A] hover:text-[#2D5016]' : 'text-white/85 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  !isLanding || scrolled
                    ? 'bg-[#2D5016] text-white hover:bg-[#1e3710]'
                    : 'bg-white text-[#2D5016] hover:bg-white/90'
                }`}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-medium transition-colors duration-300 ${
                  !isLanding || scrolled ? 'text-[#1A1A1A] hover:text-[#2D5016]' : 'text-white/85 hover:text-white'
                }`}
              >
                Log In
              </Link>
              <Link
                href="/signup/owner"
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  !isLanding || scrolled
                    ? 'bg-[#2D5016] text-white hover:bg-[#1e3710]'
                    : 'bg-white text-[#2D5016] hover:bg-white/90'
                }`}
              >
                Sign Up
              </Link>
            </>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-1 transition-colors duration-300 ${
            !isLanding || scrolled ? 'text-[#1A1A1A]' : 'text-white'
          }`}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4">
            {authLoaded && (user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-[#C9922A] font-medium text-sm py-1"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-[#1A1A1A] font-medium text-sm py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-left text-[#2D5016] font-medium text-sm py-1"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#1A1A1A] font-medium text-sm py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup/owner"
                  className="text-[#1A1A1A] font-medium text-sm py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up as Owner
                </Link>
                <Link
                  href="/signup/caretaker"
                  className="text-[#2D5016] font-medium text-sm py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Become a Caretaker
                </Link>
              </>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
