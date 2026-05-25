# HorseWatch — Claude Code Project Spec

## Project Overview

**Product:** HorseWatch  
**Tagline:** Trusted horse care, when you can't be there.  
**Purpose:** Two-sided marketplace POC connecting horse owners (who need care coverage while traveling) with vetted caretakers (who provide feeding, turnout, and exercise services). Launch market: Atlanta metro / North Georgia equestrian corridor.  
**Stage:** POC — real signups, real data, no payments yet.

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | TypeScript |
| Styling | Tailwind CSS | Clean, professional |
| Database + Auth | Supabase | Postgres + email auth + storage |
| Email | Resend | Transactional email (inquiries, notifications) |
| Hosting | Vercel | Deploy from GitHub https://github.com/cpbergie/horsewatch |
| Forms | React Hook Form + Zod | Validation |

---

## Design Direction

**Vibe:** Clean and professional — think Rover meets Airbnb. Trust-forward. Not rustic, not startup-y.

**Typography:** Pair a refined serif display font (e.g. Playfair Display or Lora) for headings with a clean sans-serif (e.g. DM Sans) for body. Conveys both warmth and professionalism.

**Color Palette:**
- Primary: Deep forest green (`#2D5016`) — equestrian, trustworthy
- Accent: Warm gold (`#C9922A`) — premium feel
- Background: Off-white (`#FAF9F6`)
- Text: Near-black (`#1A1A1A`)
- Surface: White with subtle shadow cards

**Motion:** Subtle fade-ins on page load, hover states on cards, smooth transitions. Nothing flashy.

**Logo/Brand:** "HorseWatch" wordmark — serif display font, forest green. Simple horseshoe icon optional.

---

## Site Architecture

```
/                        → Landing page
/signup/owner            → Owner registration + profile
/signup/caretaker        → Caretaker registration + profile
/caretakers              → Browse caretakers (owners only)
/caretakers/[id]         → Caretaker profile detail
/inquiry/[caretakerId]   → Inquiry form (owner → caretaker)
/dashboard               → Post-login: owner or caretaker view
/admin                   → Simple admin: all signups + inquiries
```

---

## Supabase Schema

### Table: `profiles`
```sql
id uuid references auth.users primary key
created_at timestamptz default now()
role text check (role in ('owner', 'caretaker'))
full_name text not null
email text not null
phone text
location text           -- city/zip
bio text
profile_photo_url text
is_approved boolean default false   -- admin can approve caretakers
```

### Table: `owner_profiles`
```sql
id uuid references profiles(id) primary key
num_horses int
horse_details text       -- breed, age, special needs (free text)
property_address text    -- where the horses are kept
barn_access_notes text   -- gate codes, parking, etc (shown only after match)
```

### Table: `caretaker_profiles`
```sql
id uuid references profiles(id) primary key
years_experience int
services text[]          -- ['feeding_turnout', 'riding_exercise', 'overnight']
disciplines text[]       -- ['hunter_jumper', 'western', 'dressage', 'trail', 'general']
has_own_transport boolean
rates_per_day text       -- free text for POC ("$X/day" etc)
availability_notes text
references_available boolean
```

### Table: `inquiries`
```sql
id uuid default gen_random_uuid() primary key
created_at timestamptz default now()
owner_id uuid references profiles(id)
caretaker_id uuid references profiles(id)
trip_start date
trip_end date
horse_count int
message text
status text default 'pending' check (status in ('pending', 'connected', 'declined'))
```

---

## Pages — Detailed Specs

### 1. Landing Page (`/`)

**Goal:** Convert visitors into signups on either side.

**Sections:**
1. **Hero** — Full-width. Headline: *"Trusted horse care, when you can't be there."* Subhead: *"Connect with experienced caretakers in the Atlanta area."* Two CTAs: `Find a Caretaker` (owner) and `Become a Caretaker`. Background: high-quality horse/pasture photo (use Unsplash URL).
2. **How It Works** — 3-step flow for owners: Post your trip → Browse caretakers → Get connected. Clean icon + text cards.
3. **Services Covered** — Icons for: Daily feeding & turnout, Riding & exercise, Overnight care.
4. **Why HorseWatch** — Trust signals: Experienced caretakers, Atlanta-area focus, Personal introductions, No guesswork.
5. **CTA Banner** — "Ready to find care for your horse?" → signup buttons.
6. **Footer** — Logo, tagline, links, "Currently serving the Atlanta metro area."

---

### 2. Owner Signup (`/signup/owner`)

**Flow:** Email/password auth via Supabase → profile form → confirmation page.

**Form Fields:**
- Full name (required)
- Email (required)
- Password (required)
- Phone number
- City / Zip code (required)
- Number of horses (required)
- Horse details — breed, age, any special needs (textarea)
- Property location — general area only, e.g. "Milton, GA" (required) — NOT full address at this stage
- Anything else a caretaker should know (textarea)

**Post-signup:** Show confirmation: *"Thanks! Browse caretakers and send an inquiry when you're ready."* Redirect to `/caretakers`.

---

### 3. Caretaker Signup (`/signup/caretaker`)

**Flow:** Email/password auth via Supabase → profile form → pending approval page.

**Form Fields:**
- Full name (required)
- Email (required)
- Password (required)
- Phone number
- City / Zip code (required)
- Profile photo upload (Supabase storage)
- Years of experience with horses (required)
- Services offered (checkboxes): Daily feeding & turnout, Riding & exercise, Overnight / live-in care
- Disciplines comfortable with (checkboxes): Hunter/Jumper, Western, Dressage, Trail, General care
- Do you have your own transportation? (yes/no)
- Approximate daily rate (free text — e.g. "$75/day")
- Availability notes (textarea — e.g. "Available weekends and summers")
- Bio / tell owners about yourself (textarea, required)
- References available? (yes/no)

**Post-signup:** Show pending message: *"Thanks for signing up! We'll review your profile and notify you when you're live. This usually takes 1 business day."* Set `is_approved = false`.

---

### 4. Browse Caretakers (`/caretakers`)

**Access:** Must be logged in as owner.

**Display:** Grid of caretaker cards (2-col desktop, 1-col mobile). Only show `is_approved = true` caretakers.

**Each card shows:**
- Profile photo (or placeholder avatar)
- Name
- Location
- Years of experience
- Services offered (tag pills)
- Approximate rate
- `View Profile` button

**Filters (simple, top of page):**
- Service type (checkboxes)
- Availability (free text search for now)

---

### 5. Caretaker Profile (`/caretakers/[id]`)

**Access:** Must be logged in as owner.

**Shows:**
- Full profile photo
- Name, location, experience
- Bio
- Services + disciplines (tag pills)
- Rate
- Availability notes
- References available badge
- `Send Inquiry` button → links to `/inquiry/[id]`

---

### 6. Inquiry Form (`/inquiry/[caretakerId]`)

**Access:** Must be logged in as owner.

**Form Fields:**
- Trip start date (required)
- Trip end date (required)
- Number of horses needing care (required)
- Message to caretaker (textarea, required) — pre-fill hint: "Tell the caretaker about your horses, your property, and what you need."

**On Submit:**
1. Write inquiry to `inquiries` table with status `pending`
2. Send email to **caretaker**: "You have a new inquiry from [Owner Name] for [dates]. Here's their message: [message]. Their contact: [email] [phone]. Reply directly to connect."
3. Send email to **owner**: "Your inquiry has been sent to [Caretaker Name]. They'll be in touch at [caretaker email]."
4. Send email to **admin** (hardcoded env var `ADMIN_EMAIL`): "New HorseWatch inquiry. Owner: [name/email]. Caretaker: [name/email]. Dates: [x to y]. Message: [message]."
5. Show confirmation page: *"Your inquiry has been sent! [Caretaker name] will be in touch at the email you provided."*

---

### 7. Dashboard (`/dashboard`)

**Owner view:**
- "Your Inquiries" — list of sent inquiries with caretaker name, dates, status
- Link to browse more caretakers

**Caretaker view:**
- Profile summary
- "Your Inquiries" — list of received inquiries with owner name, dates, message
- Status: pending / connected

---

### 8. Admin Page (`/admin`)

**Access:** Protect with hardcoded admin email check (env var `ADMIN_EMAIL`).

**Sections:**
- **Pending Caretakers** — list of unapproved caretakers with Approve button (sets `is_approved = true`)
- **All Caretakers** — name, email, location, signup date
- **All Owners** — name, email, location, signup date
- **All Inquiries** — owner name, caretaker name, dates, message, status. Dropdown to update status.

No fancy UI needed — clean data table is fine.

---

## Email Templates (Resend)

All emails should be plain but branded. Include HorseWatch name/logo text in header.

### New Inquiry — To Caretaker
```
Subject: New inquiry from [Owner Name] — [Trip Start] to [Trip End]

Hi [Caretaker Name],

You have a new care inquiry on HorseWatch.

Owner: [Full Name]
Dates: [Start] to [End]
Horses: [Count]

Their message:
"[Message]"

To connect, reply directly:
Email: [Owner Email]
Phone: [Owner Phone]

— The HorseWatch Team
```

### New Inquiry — To Owner
```
Subject: Your HorseWatch inquiry has been sent

Hi [Owner Name],

Your inquiry has been sent to [Caretaker Name].

They'll reach out to you directly at [owner email] or [owner phone].

Caretaker contact: [Caretaker Email] | [Caretaker Phone]

— The HorseWatch Team
```

### New Inquiry — To Admin
```
Subject: [HorseWatch] New inquiry

Owner: [Name] | [Email] | [Phone]
Caretaker: [Name] | [Email] | [Phone]
Dates: [Start] to [End]
Horses: [Count]
Message: [Message]
```

### Caretaker Approved — To Caretaker
```
Subject: You're live on HorseWatch!

Hi [Name],

Your HorseWatch profile has been approved and is now visible to horse owners in the Atlanta area.

Log in to view your profile: [site URL]/dashboard

— The HorseWatch Team
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

---

## Auth Rules (Supabase RLS)

- Owners can read approved caretaker profiles
- Owners can read/write their own profile and inquiries
- Caretakers can read/write their own profile
- Caretakers can read inquiries where they are the caretaker
- Admin (service role) can read/write everything
- Unauthenticated users can only see the landing page

---

## Explicitly Out of Scope (POC)

- Payments / escrow
- In-app messaging (email only)
- Reviews / ratings
- Background check integration
- Map/geo search
- Mobile app
- Calendar availability system
- Insurance / liability waivers

---

## Suggested Build Order for Claude Code

1. Supabase project setup + schema (run SQL migrations)
2. Next.js project scaffold + Tailwind + Supabase client
3. Landing page
4. Auth (signup/login/logout) — shared for both roles
5. Owner signup profile form
6. Caretaker signup profile form
7. Browse caretakers page
8. Caretaker profile detail page
9. Inquiry form + Resend email integration
10. Dashboard (owner + caretaker views)
11. Admin page
12. Deploy to Vercel

---

## Notes for Claude Code

- Use Next.js App Router with server components where possible
- Use Supabase server client (not client-side) for auth checks and data fetching on protected pages
- All forms should have proper Zod validation with user-friendly error messages
- Mobile responsive throughout — many equestrians will use this on phones
- Keep the admin page simple — a styled data table is fine, no need for a full admin framework
- Use Unsplash source URLs for placeholder images (horses, pastures) — no local assets needed
- Seed 2-3 fake approved caretaker profiles so the browse page isn't empty on first load
