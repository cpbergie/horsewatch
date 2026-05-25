import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'

// ── Service label map ─────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
  feeding_turnout: 'Feeding & Turnout',
  riding_exercise: 'Riding & Exercise',
  overnight: 'Overnight Care',
}

// ── Types ─────────────────────────────────────────────────

interface CaretakerProfile {
  years_experience: number
  services: string[]
  rates_per_day: string | null
}

interface Caretaker {
  id: string
  full_name: string
  location: string
  profile_photo_url: string | null
  caretaker_profiles: CaretakerProfile | CaretakerProfile[] | null
}

// ── Helpers ───────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function resolveProfile(raw: CaretakerProfile | CaretakerProfile[] | null) {
  if (!raw) return null
  return Array.isArray(raw) ? raw[0] ?? null : raw
}

// ── Card ──────────────────────────────────────────────────

function CaretakerCard({ caretaker, index }: { caretaker: Caretaker; index: number }) {
  const profile = resolveProfile(caretaker.caretaker_profiles)
  const services = profile?.services ?? []
  const visible = services.slice(0, 3)
  const extra = services.length - visible.length

  const delays = ['0ms', '60ms', '120ms', '180ms', '240ms', '300ms']
  const delay = delays[index % delays.length]

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col animate-fade-in-up"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      {/* Photo / initials */}
      <div className="h-44 bg-[#2D5016]/[0.07] flex-shrink-0 relative overflow-hidden">
        {caretaker.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={caretaker.profile_photo_url}
            alt={caretaker.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-4xl font-bold text-[#2D5016]/30 select-none">
              {getInitials(caretaker.full_name)}
            </span>
          </div>
        )}
        {/* Subtle bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-[1.1rem] font-bold text-[#1A1A1A] mb-1 leading-snug">
          {caretaker.full_name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <svg className="w-3.5 h-3.5 text-[#1A1A1A]/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-sans text-sm text-[#1A1A1A]/45">{caretaker.location}</span>
        </div>

        {/* Experience + rate */}
        <div className="flex items-center gap-3 mb-3">
          {profile?.years_experience != null && (
            <span className="font-sans text-sm text-[#1A1A1A]/45">
              {profile.years_experience} yr{profile.years_experience !== 1 ? 's' : ''} experience
            </span>
          )}
          {profile?.rates_per_day && (
            <>
              <span className="text-[#1A1A1A]/20 text-xs">·</span>
              <span className="font-sans text-sm text-[#2D5016] font-medium">
                {profile.rates_per_day}
              </span>
            </>
          )}
        </div>

        {/* Service pills */}
        {visible.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {visible.map(svc => (
              <span
                key={svc}
                className="bg-[#2D5016]/[0.07] text-[#2D5016] text-xs rounded-full px-3 py-1 font-sans font-medium"
              >
                {SERVICE_LABELS[svc] ?? svc}
              </span>
            ))}
            {extra > 0 && (
              <span className="bg-[#2D5016]/[0.07] text-[#2D5016] text-xs rounded-full px-3 py-1 font-sans font-medium">
                +{extra} more
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* CTA buttons */}
        <div className="flex gap-2 mt-2">
          <Link
            href={`/caretakers/${caretaker.id}`}
            className="flex-1 text-center py-2.5 rounded-full text-sm font-sans font-semibold border border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016]/[0.04] transition-colors duration-150"
          >
            View Profile
          </Link>
          <Link
            href={`/inquiry/${caretaker.id}`}
            className="flex-1 text-center py-2.5 rounded-full text-sm font-sans font-semibold bg-[#2D5016] text-white hover:bg-[#1e3710] transition-colors duration-150"
          >
            Send Inquiry
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────

export default async function CaretakersPage() {
  const supabase = createClient()

  const { data: caretakers } = await supabase
    .from('profiles')
    .select('id, full_name, location, profile_photo_url, caretaker_profiles(years_experience, services, rates_per_day)')
    .eq('is_caretaker', true)
    .eq('is_approved', true)

  const list = (caretakers ?? []) as Caretaker[]

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-16">
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-6 py-12">

        {/* Heading */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-[#1A1A1A] mb-2">
            Find a Caretaker
          </h1>
          <p className="font-sans text-[#1A1A1A]/50 text-base">
            Browse vetted horse caretakers in your area.
          </p>
        </div>

        {list.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-[#2D5016]/[0.06] flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#2D5016]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 3c0 0-4 1-4 6 0 2 1 3.5 2 4.5L6 18h12l-1-4.5c1-1 2-2.5 2-4.5 0-5-4-6-4-6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3c1-1 3-1.5 3-1.5s2 .5 3 1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18v2M18 18v2" />
              </svg>
            </div>
            <p className="font-display text-2xl font-bold text-[#1A1A1A] mb-2">
              No caretakers listed yet
            </p>
            <p className="font-sans text-[#1A1A1A]/45 text-sm max-w-[300px] leading-relaxed">
              Check back soon — we&apos;re reviewing caretaker applications now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((caretaker, i) => (
              <CaretakerCard key={caretaker.id} caretaker={caretaker} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
