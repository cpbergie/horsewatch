'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface NavProfile {
  full_name: string
  profile_photo_url: string | null
  is_admin: boolean
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function Avatar({ profile, size = 'md' }: { profile: NavProfile; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'
  return (
    <div className={`${dim} rounded-full overflow-hidden bg-[#2D5016]/[0.12] flex items-center justify-center flex-shrink-0`}>
      {profile.profile_photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.profile_photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-sans font-semibold text-[#2D5016]">{getInitials(profile.full_name)}</span>
      )}
    </div>
  )
}

export default function NavbarClient({
  initialUser,
  initialProfile,
}: {
  initialUser: User | null
  initialProfile: NavProfile | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  // Server provides the correct initial state — no loading flash
  const [user, setUser] = useState<User | null>(initialUser)
  const [navProfile, setNavProfile] = useState<NavProfile | null>(initialProfile)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Scroll effect (landing page only)
  useEffect(() => {
    if (!isLanding) return
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLanding])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Watch for client-side auth changes (sign-out / sign-in without navigation)
  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('full_name, profile_photo_url, is_admin')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => { if (mounted && data) setNavProfile(data) })
      } else {
        setNavProfile(null)
      }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const opaque = !isLanding || scrolled

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${opaque ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Wordmark */}
        <Link
          href="/"
          className={`font-display text-2xl font-bold tracking-tight transition-colors duration-300 ${opaque ? 'text-[#2D5016]' : 'text-white'}`}
        >
          HorseWatch
        </Link>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-5">
          {!user && (
            <>
              <Link
                href="/login"
                className={`text-sm font-medium transition-colors duration-300 ${opaque ? 'text-[#1A1A1A] hover:text-[#2D5016]' : 'text-white/85 hover:text-white'}`}
              >
                Log In
              </Link>
              <Link
                href="/signup/owner"
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${opaque ? 'bg-[#2D5016] text-white hover:bg-[#1e3710]' : 'bg-white text-[#2D5016] hover:bg-white/90'}`}
              >
                Sign Up
              </Link>
            </>
          )}

          {user && navProfile && (
            <>
              {navProfile.is_admin && (
                <Link
                  href="/admin"
                  className={`text-sm font-semibold transition-colors duration-300 ${opaque ? 'text-[#C9922A] hover:text-[#b37e20]' : 'text-white/85 hover:text-white'}`}
                >
                  Admin
                </Link>
              )}

              {/* Profile avatar dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 focus:outline-none group"
                  aria-label="Account menu"
                >
                  <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 transition-all duration-150 ${opaque ? 'ring-[#2D5016]/20 group-hover:ring-[#2D5016]/50' : 'ring-white/30 group-hover:ring-white/60'} ${navProfile.profile_photo_url ? '' : 'bg-[#2D5016]/[0.12]'}`}>
                    {navProfile.profile_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={navProfile.profile_photo_url} alt={navProfile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className={`font-sans text-xs font-bold ${opaque ? 'text-[#2D5016]' : 'text-white'}`}>
                        {getInitials(navProfile.full_name)}
                      </span>
                    )}
                  </div>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''} ${opaque ? 'text-[#1A1A1A]/40' : 'text-white/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#f0f0ee] py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-[#f5f5f3] mb-1">
                      <p className="font-sans text-xs font-semibold text-[#1A1A1A]">{navProfile.full_name}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-sans text-[#1A1A1A] hover:bg-[#FAF9F6] transition-colors"
                    >
                      <svg className="w-4 h-4 text-[#1A1A1A]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    {navProfile.is_admin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-sans text-[#C9922A] hover:bg-[#FAF9F6] transition-colors font-semibold"
                      >
                        <svg className="w-4 h-4 text-[#C9922A]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-[#f5f5f3] mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm font-sans text-[#1A1A1A]/60 hover:bg-[#FAF9F6] hover:text-[#1A1A1A] transition-colors"
                      >
                        <svg className="w-4 h-4 text-[#1A1A1A]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* While user is known but profile is still loading, show a placeholder ring */}
          {user && !navProfile && (
            <div className={`w-8 h-8 rounded-full ring-2 ${opaque ? 'ring-[#2D5016]/20 bg-[#2D5016]/[0.06]' : 'ring-white/30 bg-white/10'}`} />
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-1 transition-colors duration-300 ${opaque ? 'text-[#1A1A1A]' : 'text-white'}`}
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
            {user && navProfile ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-[#f5f5f3]">
                  <Avatar profile={navProfile} />
                  <span className="font-sans text-sm font-medium text-[#1A1A1A]">{navProfile.full_name}</span>
                </div>
                <Link href="/dashboard" className="text-[#1A1A1A] font-medium text-sm py-1" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                {navProfile.is_admin && (
                  <Link href="/admin" className="text-[#C9922A] font-semibold text-sm py-1" onClick={() => setMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleSignOut} className="text-left text-[#1A1A1A]/50 font-medium text-sm py-1">
                  Log Out
                </button>
              </>
            ) : !user ? (
              <>
                <Link href="/login" className="text-[#1A1A1A] font-medium text-sm py-1" onClick={() => setMenuOpen(false)}>
                  Log In
                </Link>
                <Link href="/signup/owner" className="text-[#1A1A1A] font-medium text-sm py-1" onClick={() => setMenuOpen(false)}>
                  Sign Up as Owner
                </Link>
                <Link href="/signup/caretaker" className="text-[#2D5016] font-medium text-sm py-1" onClick={() => setMenuOpen(false)}>
                  Become a Caretaker
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  )
}
