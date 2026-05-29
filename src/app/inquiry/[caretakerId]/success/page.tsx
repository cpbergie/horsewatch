import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function InquirySuccessPage({
  params,
}: {
  params: { caretakerId: string }
}) {
  const admin = createAdminClient()
  const { data: caretaker } = await admin
    .from('profiles')
    .select('full_name, location')
    .eq('id', params.caretakerId)
    .single()

  if (!caretaker) notFound()

  const firstName = caretaker.full_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-16">
      <Navbar />
      <div className="max-w-[520px] mx-auto px-6 py-16 text-center">

        {/* Check icon */}
        <div className="w-16 h-16 rounded-full bg-[#2D5016]/[0.08] flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#2D5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-3">
          Inquiry sent!
        </h1>
        <p className="font-sans text-[#1A1A1A]/60 leading-relaxed mb-8">
          Your message is on its way to <span className="font-semibold text-[#1A1A1A]">{caretaker.full_name}</span>.
          {caretaker.location ? ` They're based in ${caretaker.location}.` : ''}
        </p>

        {/* What happens next */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-left mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-0.5 h-4 bg-[#C9922A] flex-shrink-0" />
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
              What happens next
            </span>
          </div>
          <ol className="space-y-3">
            {[
              `${firstName} has your contact info and will reach out directly by phone or email.`,
              'Work out the details together — dates, property access, feeding schedules.',
              'Check your email for a copy of your inquiry for your records.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2D5016]/[0.08] text-[#2D5016] font-sans text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="font-sans text-sm text-[#1A1A1A]/70 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/caretakers"
            className="bg-[#2D5016] text-white rounded-full px-8 py-3 font-sans font-semibold text-sm hover:bg-[#1e3710] transition-colors duration-150"
          >
            Browse more caretakers
          </Link>
          <Link
            href="/dashboard"
            className="border border-[#2D5016]/25 text-[#2D5016] rounded-full px-8 py-3 font-sans font-semibold text-sm hover:bg-[#2D5016]/[0.05] transition-colors duration-150"
          >
            Go to dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
