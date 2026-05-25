'use client'

import Link from 'next/link'
import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────

interface OwnerProfile {
  num_horses: number
  horse_details: string | null
  property_address: string
}

interface CaretakerProfile {
  years_experience: number
  services: string[]
  disciplines: string[]
  rates_per_day: string | null
}

interface Profile {
  id: string
  full_name: string
  location: string
  is_owner: boolean
  is_caretaker: boolean
  is_approved: boolean
  owner_profiles: OwnerProfile | OwnerProfile[] | null
  caretaker_profiles: CaretakerProfile | CaretakerProfile[] | null
}

interface RecentCaretaker {
  id: string
  full_name: string
  location: string
  profile_photo_url: string | null
  caretaker_profiles: { services: string[] } | { services: string[] }[] | null
}

// ── Constants ─────────────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
  feeding_turnout: 'Feeding & Turnout',
  riding_exercise: 'Riding & Exercise',
  overnight: 'Overnight Care',
}

const DISCIPLINE_LABELS: Record<string, string> = {
  hunter_jumper: 'Hunter/Jumper',
  western: 'Western',
  dressage: 'Dressage',
  trail: 'Trail Riding',
  general: 'General Care',
}

// ── Helpers ───────────────────────────────────────────────

function resolve<T>(val: T | T[] | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? (val[0] ?? null) : val
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
        {children}
      </span>
    </div>
  )
}

// ── Owner tab ─────────────────────────────────────────────

function OwnerTab({
  profile,
  recentCaretakers,
}: {
  profile: Profile
  recentCaretakers: RecentCaretaker[]
}) {
  const ownerProfile = resolve(profile.owner_profiles)

  return (
    <div className="space-y-5">

      {/* Your Horses */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <SectionHeader>Your Horses</SectionHeader>
        {ownerProfile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D5016]/[0.07] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#2D5016]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-sans font-semibold text-[#1A1A1A] text-sm">
                    {ownerProfile.num_horses} horse{ownerProfile.num_horses !== 1 ? 's' : ''}
                  </p>
                  <p className="font-sans text-xs text-[#1A1A1A]/45">{profile.location}</p>
                </div>
              </div>
              <span className="font-sans text-xs text-[#1A1A1A]/30 cursor-default">Edit</span>
            </div>
            {ownerProfile.horse_details && (
              <p className="font-sans text-sm text-[#1A1A1A]/60 leading-relaxed line-clamp-2 pl-[52px]">
                {ownerProfile.horse_details}
              </p>
            )}
            <div className="flex items-center gap-1.5 pl-[52px]">
              <svg className="w-3.5 h-3.5 text-[#1A1A1A]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-sans text-xs text-[#1A1A1A]/40">{ownerProfile.property_address}</span>
            </div>
          </div>
        ) : (
          <p className="font-sans text-sm text-[#1A1A1A]/45">No horse details on file.</p>
        )}
      </div>

      {/* Browse CTA */}
      <div className="bg-[#2D5016] rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-white mb-1">Ready to find care?</p>
          <p className="font-sans text-sm text-white/65">Browse vetted caretakers in your area.</p>
        </div>
        <Link
          href="/caretakers"
          className="flex-shrink-0 px-5 py-2.5 rounded-full bg-white text-[#2D5016] font-sans font-semibold text-sm hover:bg-white/90 transition-colors duration-150 whitespace-nowrap"
        >
          Browse →
        </Link>
      </div>

      {/* Recent Caretakers */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <SectionHeader>Recently Added Caretakers</SectionHeader>
        {recentCaretakers.length === 0 ? (
          <p className="font-sans text-sm text-[#1A1A1A]/40">No caretakers approved yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentCaretakers.map(ct => {
              const cp = resolve(ct.caretaker_profiles)
              const firstService = cp?.services?.[0]
              return (
                <div key={ct.id} className="bg-[#FAF9F6] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#2D5016]/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {ct.profile_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ct.profile_photo_url} alt={ct.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display text-xs font-bold text-[#2D5016]/50">
                          {getInitials(ct.full_name)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-[#1A1A1A] truncate">{ct.full_name}</p>
                      <p className="font-sans text-xs text-[#1A1A1A]/45 truncate">{ct.location}</p>
                    </div>
                  </div>
                  {firstService && (
                    <span className="inline-block bg-[#2D5016]/[0.07] text-[#2D5016] text-xs rounded-full px-2.5 py-0.5 font-sans font-medium mb-3">
                      {SERVICE_LABELS[firstService] ?? firstService}
                    </span>
                  )}
                  <div>
                    <Link href={`/caretakers/${ct.id}`} className="font-sans text-xs font-medium text-[#2D5016] hover:underline">
                      View Profile →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Inquiries placeholder */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <SectionHeader>Your Inquiries</SectionHeader>
        <div className="flex items-center justify-between">
          <p className="font-sans text-sm text-[#1A1A1A]/40">
            No inquiries sent yet. Browse caretakers to get started.
          </p>
          <Link href="/caretakers" className="font-sans text-xs font-medium text-[#2D5016] hover:underline flex-shrink-0 ml-4">
            Browse
          </Link>
        </div>
      </div>

    </div>
  )
}

// ── Caretaker tab ─────────────────────────────────────────

function CaretakerTab({ profile }: { profile: Profile }) {
  const cp = resolve(profile.caretaker_profiles)

  return (
    <div className="space-y-5">

      {/* Status */}
      <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${profile.is_approved ? 'border-l-[#2D5016]' : 'border-l-[#C9922A]'}`}>
        <SectionHeader>Profile Status</SectionHeader>
        {profile.is_approved ? (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2D5016]/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#2D5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-sans font-semibold text-[#1A1A1A] text-sm mb-0.5">Active</p>
              <p className="font-sans text-sm text-[#1A1A1A]/55 leading-relaxed">
                Your profile is live and visible to owners.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9922A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#C9922A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-sans font-semibold text-[#1A1A1A] text-sm mb-0.5">Pending Review</p>
              <p className="font-sans text-sm text-[#1A1A1A]/55 leading-relaxed">
                We&apos;ll notify you once your profile is approved. This usually takes 1 business day.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Profile summary */}
      {cp && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <SectionHeader>Your Profile Summary</SectionHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {cp.years_experience != null && (
                <div>
                  <p className="font-sans text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-0.5">Experience</p>
                  <p className="font-sans text-sm font-medium text-[#1A1A1A]">
                    {cp.years_experience} yr{cp.years_experience !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              {cp.rates_per_day && (
                <div>
                  <p className="font-sans text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-0.5">Rate</p>
                  <p className="font-sans text-sm font-medium text-[#2D5016]">{cp.rates_per_day}</p>
                </div>
              )}
            </div>

            {cp.services?.length > 0 && (
              <div>
                <p className="font-sans text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-2">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {cp.services.map(s => (
                    <span key={s} className="bg-[#2D5016]/[0.07] text-[#2D5016] text-xs rounded-full px-3 py-1 font-sans font-medium">
                      {SERVICE_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cp.disciplines?.length > 0 && (
              <div>
                <p className="font-sans text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-2">Disciplines</p>
                <div className="flex flex-wrap gap-1.5">
                  {cp.disciplines.map(d => (
                    <span key={d} className="border border-[#2D5016]/30 text-[#2D5016]/70 text-xs rounded-full px-3 py-1 font-sans font-medium">
                      {DISCIPLINE_LABELS[d] ?? d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inquiries placeholder */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <SectionHeader>Incoming Inquiries</SectionHeader>
        <p className="font-sans text-sm text-[#1A1A1A]/40">
          No inquiries yet — owners will reach out once your profile is approved.
        </p>
      </div>

    </div>
  )
}

// ── Main client component ─────────────────────────────────

export default function DashboardClient({
  profile,
  recentCaretakers,
}: {
  profile: Profile | null
  recentCaretakers: RecentCaretaker[]
}) {
  const [activeTab, setActiveTab] = useState<'owner' | 'caretaker'>('owner')

  if (!profile) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-10">
        <p className="font-sans text-[#1A1A1A]/50 text-sm">Could not load profile.</p>
      </div>
    )
  }

  const firstName = profile.full_name.split(' ')[0]
  const hasBoth = profile.is_owner && profile.is_caretaker
  const showOwner = hasBoth ? activeTab === 'owner' : profile.is_owner
  const showCaretaker = hasBoth ? activeTab === 'caretaker' : profile.is_caretaker

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-[#1A1A1A] mb-1">
          Welcome back, {firstName}
        </h1>
        <p className="font-sans text-[#1A1A1A]/45 text-sm">Your HorseWatch dashboard</p>
      </div>

      {/* Tabs (only if both roles) */}
      {hasBoth && (
        <div className="flex gap-2 mb-7">
          <button
            onClick={() => setActiveTab('owner')}
            className={`px-6 py-2 rounded-full font-sans font-semibold text-sm transition-all duration-150 ${
              activeTab === 'owner'
                ? 'bg-[#2D5016] text-white'
                : 'border border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016]/[0.04]'
            }`}
          >
            Owner
          </button>
          <button
            onClick={() => setActiveTab('caretaker')}
            className={`px-6 py-2 rounded-full font-sans font-semibold text-sm transition-all duration-150 ${
              activeTab === 'caretaker'
                ? 'bg-[#2D5016] text-white'
                : 'border border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016]/[0.04]'
            }`}
          >
            Caretaker
          </button>
        </div>
      )}

      {/* Tab content */}
      {showOwner && (
        <OwnerTab profile={profile} recentCaretakers={recentCaretakers} />
      )}
      {showCaretaker && (
        <CaretakerTab profile={profile} />
      )}

      {/* Add role CTA */}
      {profile.is_caretaker && !profile.is_owner && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6 border-l-4 border-l-[#C9922A]">
          <h3 className="font-display text-lg font-bold text-[#1A1A1A] mb-1">Also an owner?</h3>
          <p className="font-sans text-sm text-[#1A1A1A]/55 mb-4">
            Register your horses and start browsing caretakers.
          </p>
          <Link
            href="/dashboard/become-owner"
            className="inline-flex items-center px-6 py-2.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] transition-colors duration-150"
          >
            Register as Owner →
          </Link>
        </div>
      )}

      {profile.is_owner && !profile.is_caretaker && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6 border-l-4 border-l-[#C9922A]">
          <h3 className="font-display text-lg font-bold text-[#1A1A1A] mb-1">Want to offer care?</h3>
          <p className="font-sans text-sm text-[#1A1A1A]/55 mb-4">
            List your experience and let owners find you.
          </p>
          <Link
            href="/dashboard/become-caretaker"
            className="inline-flex items-center px-6 py-2.5 rounded-full bg-[#2D5016] text-white font-sans font-semibold text-sm hover:bg-[#1e3710] transition-colors duration-150"
          >
            Become a Caretaker →
          </Link>
        </div>
      )}

    </div>
  )
}
