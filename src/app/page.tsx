import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-center justify-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#2D5016',
          }}
        >
          {/* Gradient overlay — heavier at bottom for text */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/70" />

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <span className="animate-fade-in-up inline-block text-[#C9922A] text-xs font-semibold tracking-[0.25em] uppercase mb-6 bg-[#C9922A]/10 px-4 py-2 rounded-full border border-[#C9922A]/30">
              Atlanta Metro Area
            </span>

            <h1 className="animate-fade-in-up-1 font-display text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.1] mb-6">
              Trusted horse care,
              <br />
              <span className="italic text-white/90">when you can&apos;t be there.</span>
            </h1>

            <p className="animate-fade-in-up-2 text-white/75 text-lg md:text-xl font-sans leading-relaxed mb-10 max-w-xl mx-auto">
              Connect with experienced caretakers in the Atlanta area. Real people
              who love horses, ready to care for yours.
            </p>

            <div className="animate-fade-in-up-3 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup/owner"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#2D5016] text-white font-semibold text-base hover:bg-[#1e3710] transition-colors duration-200"
              >
                Find a Caretaker
              </Link>
              <Link
                href="/signup/caretaker"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-white/60 text-white font-semibold text-base hover:bg-white/10 hover:border-white transition-all duration-200"
              >
                Become a Caretaker
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────── */}
        <section className="py-24 bg-[#FAF9F6] px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
                How It Works
              </h2>
              <p className="text-[#1A1A1A]/55 font-sans text-lg max-w-md mx-auto">
                Finding trusted horse care has never been simpler.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  num: '01',
                  title: 'Create your profile',
                  desc: 'Tell us about your horses and property so caretakers know exactly what to expect.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                },
                {
                  num: '02',
                  title: 'Browse caretakers',
                  desc: 'Find experienced caretakers in your area, filtered by services, disciplines, and availability.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                },
                {
                  num: '03',
                  title: 'Send an inquiry',
                  desc: "Connect directly with your caretaker. A small platform fee applies — a fraction of what traditional services charge.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center overflow-hidden group"
                >
                  {/* Ghost number */}
                  <span className="absolute top-4 right-5 font-display text-7xl font-bold text-[#2D5016]/[0.05] select-none leading-none pointer-events-none">
                    {step.num}
                  </span>
                  {/* Icon circle */}
                  <div className="w-14 h-14 rounded-full bg-[#2D5016]/[0.07] flex items-center justify-center text-[#2D5016] mb-5 group-hover:bg-[#2D5016]/[0.12] transition-colors duration-200">
                    {step.icon}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#1A1A1A] mb-3">{step.title}</h3>
                  <p className="font-sans text-[#1A1A1A]/55 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services Covered ─────────────────────────────────────── */}
        <section className="py-24 bg-stone-50 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
                What&apos;s Covered
              </h2>
              <p className="text-[#1A1A1A]/55 font-sans text-lg max-w-md mx-auto">
                From daily care to extended overnight stays — caretakers for every need.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Daily Feeding & Turnout',
                  desc: 'Morning and evening feeding, turnout, stall checks, and fresh water. Your daily routine, covered.',
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 3v1m0 16v1m8.485-9H20m-16 0h-.485M17.95 6.05l-.707.707M6.757 17.243l-.707.707m11.9 0l-.707-.707M6.757 6.757l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
                {
                  title: 'Riding & Exercise',
                  desc: "Keep your horse fit and mentally stimulated with regular exercise sessions while you're away.",
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
                {
                  title: 'Overnight Care',
                  desc: 'Live-in or overnight caretakers for extended trips when your horses need round-the-clock attention.',
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ),
                },
              ].map((service) => (
                <div
                  key={service.title}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="py-8 bg-gradient-to-br from-[#2D5016]/[0.04] to-[#2D5016]/[0.09] flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#C9922A]/10 flex items-center justify-center text-[#C9922A]">
                      {service.icon}
                    </div>
                  </div>
                  <div className="px-8 py-7">
                    <h3 className="font-display text-xl font-semibold text-[#1A1A1A] mb-3">{service.title}</h3>
                    <p className="font-sans text-[#1A1A1A]/55 text-sm leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why HorseWatch ───────────────────────────────────────── */}
        <section className="py-24 bg-white px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
                Why HorseWatch
              </h2>
              <p className="text-[#1A1A1A]/55 font-sans text-lg max-w-md mx-auto">
                Built for horse owners who don&apos;t settle for &ldquo;good enough.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  title: 'Experienced Caretakers',
                  desc: 'Every caretaker is personally reviewed. We verify experience and get to know them before they appear on the platform.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  title: 'Atlanta-Area Focus',
                  desc: 'Caretakers who know the local equestrian community — the barns, the vets, the farriers, the roads.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
                {
                  title: 'Direct Connection',
                  desc: 'You get contact info upfront — no in-app messaging, no booking system. A real introduction, then you take it from there.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                },
                {
                  title: 'No Guesswork',
                  desc: "Detailed profiles with experience, disciplines, services, and availability — so you know exactly who's caring for your horse.",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-5 p-7 rounded-xl bg-[#FAF9F6] hover:bg-white hover:shadow-md transition-all duration-200"
                  style={{ borderLeft: '4px solid #2D5016' }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#2D5016]/[0.07] flex items-center justify-center text-[#2D5016] mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[#1A1A1A] mb-2">{item.title}</h3>
                    <p className="font-sans text-[#1A1A1A]/55 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────── */}
        <section className="py-20 bg-[#2D5016] px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to find care for your horse?
            </h2>
            <p className="text-white/60 font-sans text-lg mb-10 max-w-lg mx-auto">
              Join horse owners across the Atlanta area who trust HorseWatch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup/owner"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-[#2D5016] font-semibold text-base hover:bg-[#FAF9F6] transition-colors duration-200"
              >
                Find a Caretaker
              </Link>
              <Link
                href="/signup/caretaker"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-white/40 text-white font-semibold text-base hover:bg-white/10 hover:border-white/70 transition-all duration-200"
              >
                Become a Caretaker
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="bg-[#1A1A1A] text-white">
          <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">

              {/* Brand */}
              <div>
                <div className="font-display text-2xl font-bold text-white mb-3">HorseWatch</div>
                <p className="text-white/45 font-sans text-sm leading-relaxed">
                  Trusted horse care,
                  <br />
                  when you can&apos;t be there.
                </p>
              </div>

              {/* Nav links */}
              <div>
                <p className="text-white/30 font-sans text-xs uppercase tracking-[0.15em] mb-5">Links</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Home', href: '/' },
                    { label: 'Find a Caretaker', href: '/signup/owner' },
                    { label: 'Become a Caretaker', href: '/signup/caretaker' },
                    { label: 'Log In', href: '/login' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-white/50 hover:text-white font-sans text-sm transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Service area */}
              <div>
                <p className="text-white/30 font-sans text-xs uppercase tracking-[0.15em] mb-5">
                  Service Area
                </p>
                <p className="text-white/50 font-sans text-sm leading-relaxed">
                  Currently serving the Atlanta metro area and the North Georgia
                  equestrian corridor.
                </p>
              </div>
            </div>

            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/25 font-sans text-sm">
                © 2025 HorseWatch. All rights reserved.
              </p>
              <div className="h-px w-12 bg-[#C9922A]/40" />
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}
