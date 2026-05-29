import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import InquiryForm from './InquiryForm'

export default async function InquiryPage({
  params,
}: {
  params: { caretakerId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Load caretaker + owner profiles in parallel
  const [{ data: caretaker }, { data: ownerProfile }] = await Promise.all([
    admin
      .from('profiles')
      .select('id, full_name, location, profile_photo_url, is_approved, caretaker_profiles(services)')
      .eq('id', params.caretakerId)
      .eq('is_caretaker', true)
      .single(),
    admin
      .from('profiles')
      .select('is_owner, phone, owner_profiles(num_horses)')
      .eq('id', user.id)
      .single(),
  ])

  if (!caretaker || !caretaker.is_approved) notFound()
  if (!ownerProfile?.is_owner) redirect('/dashboard')

  const cp = Array.isArray(caretaker.caretaker_profiles)
    ? caretaker.caretaker_profiles[0] ?? null
    : caretaker.caretaker_profiles

  const op = Array.isArray(ownerProfile.owner_profiles)
    ? ownerProfile.owner_profiles?.[0] ?? null
    : ownerProfile.owner_profiles

  const offeredServices: string[] = cp?.services ?? ['feeding_turnout']

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-16">
      <Navbar />

      <div className="max-w-[640px] mx-auto px-6 py-8">

        {/* Back link */}
        <Link
          href={`/caretakers/${params.caretakerId}`}
          className="inline-flex items-center gap-1.5 font-sans text-sm text-[#2D5016] hover:text-[#1e3710] transition-colors duration-150 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to profile
        </Link>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-[#1A1A1A] leading-tight mb-1">
            Send an inquiry
          </h1>
          <p className="font-sans text-sm text-[#1A1A1A]/45">
            Fill in the details below and {caretaker.full_name.split(' ')[0]} will reach out to you directly.
          </p>
        </div>

        <InquiryForm
          caretakerId={params.caretakerId}
          caretakerName={caretaker.full_name}
          caretakerLocation={caretaker.location}
          caretakerPhotoUrl={caretaker.profile_photo_url}
          offeredServices={offeredServices}
          defaultHorseCount={op?.num_horses ?? 1}
          defaultPhone={ownerProfile.phone ?? ''}
        />
      </div>
    </div>
  )
}
