'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const SERVICE_LABELS: Record<string, string> = {
  feeding_turnout: 'Daily Feeding & Turnout',
  riding_exercise: 'Riding & Exercise',
  overnight: 'Overnight Care',
}

export async function submitInquiry(caretakerId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Load owner + caretaker profiles for email content
  const [{ data: ownerProfile }, { data: caretakerProfile }] = await Promise.all([
    admin.from('profiles').select('full_name, email, phone').eq('id', user.id).single(),
    admin.from('profiles').select('full_name, email').eq('id', caretakerId).single(),
  ])

  const tripStart    = formData.get('trip_start') as string
  const tripEnd      = formData.get('trip_end') as string
  const horseCount   = parseInt(formData.get('horse_count') as string, 10)
  const phone        = formData.get('phone') as string
  const service      = formData.get('service_requested') as string
  const message      = formData.get('message') as string

  // Save inquiry to DB
  const { error } = await admin
    .from('inquiries')
    .insert({
      owner_id:          user.id,
      caretaker_id:      caretakerId,
      trip_start:        tripStart,
      trip_end:          tripEnd,
      horse_count:       horseCount,
      phone,
      service_requested: service,
      message,
      status:            'pending',
    })

  if (error) {
    console.error('submitInquiry DB error:', error)
    return { error: 'Failed to submit inquiry. Please try again.' }
  }

  // Send emails (best-effort — don't block on failure)
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const from   = process.env.FROM_EMAIL ?? 'HorseWatch <onboarding@resend.dev>'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://horsewatch.vercel.app'

    const ownerName     = ownerProfile?.full_name ?? 'A horse owner'
    const ownerEmail    = ownerProfile?.email ?? user.email ?? ''
    const caretakerName = caretakerProfile?.full_name ?? 'the caretaker'
    const serviceLabel  = SERVICE_LABELS[service] ?? service
    const dateRange     = `${tripStart} → ${tripEnd}`

    await Promise.allSettled([
      // ── Email to caretaker ────────────────────────────────
      resend.emails.send({
        from,
        to: [caretakerProfile?.email ?? ''],
        subject: `New inquiry from ${ownerName} — HorseWatch`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A">
            <div style="background:#2D5016;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="margin:0;color:#fff;font-size:22px">New inquiry on HorseWatch</h1>
            </div>
            <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="margin:0 0 24px">Hi ${caretakerName.split(' ')[0]}, you have a new inquiry:</p>

              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px">From</td><td style="padding:8px 0;font-size:14px;font-weight:600">${ownerName}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Phone</td><td style="padding:8px 0;font-size:14px">${phone}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Email</td><td style="padding:8px 0;font-size:14px">${ownerEmail}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Service</td><td style="padding:8px 0;font-size:14px">${serviceLabel}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Dates</td><td style="padding:8px 0;font-size:14px">${dateRange}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Horses</td><td style="padding:8px 0;font-size:14px">${horseCount}</td></tr>
              </table>

              ${message ? `
              <div style="background:#f9f9f7;border-left:3px solid #C9922A;padding:14px 16px;border-radius:0 6px 6px 0;margin-bottom:24px">
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${message.replace(/\n/g, '<br>')}</p>
              </div>` : ''}

              <p style="margin:0;font-size:14px;color:#6b7280">
                Reach out to ${ownerName} directly at <strong>${phone}</strong> or reply to <strong>${ownerEmail}</strong> to get connected.
              </p>

              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f0f0ee">
                <p style="margin:0;font-size:12px;color:#9ca3af">HorseWatch · Trusted horse care, when you can't be there · <a href="${siteUrl}" style="color:#2D5016">${siteUrl}</a></p>
              </div>
            </div>
          </div>
        `,
      }),

      // ── Confirmation email to owner ───────────────────────
      resend.emails.send({
        from,
        to: [ownerEmail],
        subject: `Your inquiry to ${caretakerName} has been sent`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A">
            <div style="background:#2D5016;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="margin:0;color:#fff;font-size:22px">Inquiry sent!</h1>
            </div>
            <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="margin:0 0 16px">Hi ${ownerName.split(' ')[0]},</p>
              <p style="margin:0 0 24px;color:#374151">Your inquiry has been sent to <strong>${caretakerName}</strong>. They have your contact details and will reach out directly.</p>

              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px">Caretaker</td><td style="padding:8px 0;font-size:14px;font-weight:600">${caretakerName}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Service</td><td style="padding:8px 0;font-size:14px">${serviceLabel}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Dates</td><td style="padding:8px 0;font-size:14px">${dateRange}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Horses</td><td style="padding:8px 0;font-size:14px">${horseCount}</td></tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#6b7280">
                In the meantime, feel free to browse other caretakers in your area.
              </p>

              <a href="${siteUrl}/caretakers" style="display:inline-block;background:#2D5016;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Browse caretakers</a>

              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f0f0ee">
                <p style="margin:0;font-size:12px;color:#9ca3af">HorseWatch · Trusted horse care, when you can't be there · <a href="${siteUrl}" style="color:#2D5016">${siteUrl}</a></p>
              </div>
            </div>
          </div>
        `,
      }),
    ])
  }

  redirect(`/inquiry/${caretakerId}/success`)
}
