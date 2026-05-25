import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Label maps ────────────────────────────────────────────

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

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
        {label}
      </span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────

export default async function CaretakerProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createAdminClient()

  const { data: caretaker } = await supabase
    .from('profiles')
    .select(
      'id, full_name, location, bio, profile_photo_url, is_approved, caretaker_profiles(years_experience, services, disciplines, has_own_transport, rates_per_day, availability_notes, references_available)'
    )
    .eq('id', params.id)
    .eq('is_caretaker', true)
    .single()

  if (!caretaker || !caretaker.is_approved) notFound()

  const cp = Array.isArray(caretaker.caretaker_profiles)
    ? caretaker.caretaker_profiles[0] ?? null
    : caretaker.caretaker_profiles

  const firstName = caretaker.full_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 pt-16">
      <Navbar />

      {/* Back link */}
      <div className="max-w-[720px] mx-auto px-6 py-3">
        <Link
          href="/caretakers"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-[#2D5016] hover:text-[#1e3710] transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to caretakers
        </Link>
      </div>

      {/* Hero */}
      <div className="w-full h-72 overflow-hidden relative">
        {caretaker.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={caretaker.profile_photo_url}
            alt={caretaker.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#2D5016]/[0.08] flex items-center justify-center">
            <span className="font-display text-7xl font-bold text-[#2D5016]/20 select-none">
              {getInitials(caretaker.full_name)}
            </span>
          </div>
        )}
        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FAF9F6]/60 to-transparent pointer-events-none" />
      </div>

      {/* Profile card — overlaps hero */}
      <div className="max-w-[720px] mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-md p-7">

          {/* Name + rate row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#1A1A1A] leading-tight mb-1">
                {caretaker.full_name}
              </h1>
              {caretaker.location && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#1A1A1A]/35 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-sans text-sm text-[#1A1A1A]/50">{caretaker.location}</span>
                </div>
              )}
            </div>
            {cp?.rates_per_day && (
              <span className="flex-shrink-0 bg-[#2D5016]/[0.07] text-[#2D5016] font-sans font-semibold text-sm rounded-full px-4 py-1.5">
                {cp.rates_per_day}
              </span>
            )}
          </div>

          {/* Stats row */}
          {cp && (
            <div className="flex items-center gap-0 mt-4 pt-4 border-t border-[#f0f0ee]">

              <div className="flex-1 text-center px-3">
                <p className="font-sans text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-1">Experience</p>
                <p className="font-sans text-sm font-medium text-[#1A1A1A]">
                  {cp.years_experience} yr{cp.years_experience !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="w-px h-8 bg-[#e5e7eb] flex-shrink-0" />

              <div className="flex-1 text-center px-3">
                <p className="font-sans text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-1">Transport</p>
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-[#1A1A1A]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l2 1m0 0l2-1V8a1 1 0 00-1-1h-3.5M15 17h2" />
                  </svg>
                  <p className={`font-sans text-sm font-medium ${cp.has_own_transport ? 'text-[#2D5016]' : 'text-[#1A1A1A]'}`}>
                    {cp.has_own_transport ? 'Own transport' : 'No transport'}
                  </p>
                </div>
              </div>

              <div className="w-px h-8 bg-[#e5e7eb] flex-shrink-0" />

              <div className="flex-1 text-center px-3">
                <p className="font-sans text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-1">References</p>
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-[#1A1A1A]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`font-sans text-sm font-medium ${cp.references_available ? 'text-[#2D5016]' : 'text-[#1A1A1A]'}`}>
                    {cp.references_available ? 'Available' : 'On request'}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Content sections */}
      <div className="max-w-[720px] mx-auto px-6 mt-6 space-y-6">

        {/* About */}
        {caretaker.bio && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <SectionHeader label="About" />
            <p className="font-sans text-[#1A1A1A]/70 leading-relaxed text-[0.95rem]">
              {caretaker.bio}
            </p>
          </div>
        )}

        {/* Services */}
        {cp?.services && cp.services.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <SectionHeader label="Services" />
            <div className="flex flex-wrap gap-2">
              {cp.services.map((s: string) => (
                <span
                  key={s}
                  className="bg-[#2D5016]/[0.08] text-[#2D5016] text-sm font-sans font-medium rounded-full px-4 py-1.5"
                >
                  {SERVICE_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disciplines */}
        {cp?.disciplines && cp.disciplines.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <SectionHeader label="Disciplines" />
            <div className="flex flex-wrap gap-2">
              {cp.disciplines.map((d: string) => (
                <span
                  key={d}
                  className="border border-[#2D5016]/30 text-[#2D5016]/70 text-sm font-sans font-medium rounded-full px-4 py-1.5"
                >
                  {DISCIPLINE_LABELS[d] ?? d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        {cp?.availability_notes && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <SectionHeader label="Availability" />
            <p className="font-sans text-[#1A1A1A]/70 leading-relaxed text-[0.95rem]">
              {cp.availability_notes}
            </p>
          </div>
        )}

      </div>

      {/* Sticky CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] py-4 px-6 z-20">
        <div className="max-w-[720px] mx-auto flex items-center justify-between gap-4">
          <p className="font-sans text-sm text-[#1A1A1A]/50">
            Send an inquiry to{' '}
            <span className="font-semibold text-[#1A1A1A]">{firstName}</span>
          </p>
          <Link
            href={`/inquiry/${caretaker.id}`}
            className="flex-shrink-0 bg-[#2D5016] text-white rounded-full px-8 py-3 font-sans font-semibold text-sm hover:bg-[#1e3710] transition-colors duration-150"
          >
            Send Inquiry
          </Link>
        </div>
      </div>
    </div>
  )
}
