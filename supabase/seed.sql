-- ============================================================
-- HorseWatch — Seed data (fake owner + caretaker)
-- Run in the Supabase SQL Editor
-- ============================================================

-- Add caretaker_status if it doesn't exist yet
alter table public.profiles
  add column if not exists caretaker_status text check (caretaker_status in ('pending', 'approved', 'rejected'));

-- Use fixed UUIDs so this script is idempotent
do $$
declare
  owner_id    uuid := 'aaaaaaaa-0000-4000-8000-000000000001';
  caretaker_id uuid := 'bbbbbbbb-0000-4000-8000-000000000002';
begin

  -- ── Auth users ─────────────────────────────────────────────
  insert into auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values
  (
    owner_id, 'authenticated', 'authenticated',
    'testowner@horsewatch.test',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now()
  ),
  (
    caretaker_id, 'authenticated', 'authenticated',
    'testcaretaker@horsewatch.test',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now()
  )
  on conflict (id) do nothing;

  -- ── Profiles ───────────────────────────────────────────────
  insert into public.profiles (
    id, full_name, email, phone, location,
    bio, is_owner, is_caretaker, is_approved, caretaker_status, created_at
  ) values
  (
    owner_id,
    'Sarah Mitchell',
    'testowner@horsewatch.test',
    '404-555-0101',
    'Alpharetta, GA',
    null,
    true, false, true, null,
    now()
  ),
  (
    caretaker_id,
    'Jake Harmon',
    'testcaretaker@horsewatch.test',
    '404-555-0202',
    'Roswell, GA',
    'Lifelong horse lover with over a decade of hands-on barn experience. I grew up on a working farm in north Georgia and have cared for everything from quarter horses to warmbloods. Reliable, detail-oriented, and genuinely passionate about horse welfare.',
    false, true, true, 'approved',
    now()
  )
  on conflict (id) do nothing;

  -- ── Owner profile ──────────────────────────────────────────
  insert into public.owner_profiles (
    id, num_horses, horse_details, property_address, barn_access_notes
  ) values (
    owner_id,
    2,
    'Two quarter horses, Biscuit (8yo gelding) and Maple (12yo mare). Both are easy keepers on standard hay and grain.',
    '1240 Windmill Farm Rd, Alpharetta, GA 30004',
    'Gate code is 4821. Barn is the second building on the left. Feed and supplies are labeled in the tack room.'
  )
  on conflict (id) do nothing;

  -- ── Caretaker profile ──────────────────────────────────────
  insert into public.caretaker_profiles (
    id, years_experience, services, disciplines,
    has_own_transport, rates_per_day, availability_notes, references_available
  ) values (
    caretaker_id,
    11,
    array['feeding_turnout', 'riding_exercise', 'overnight'],
    array['hunter_jumper', 'western', 'trail'],
    true,
    '$75 / day',
    'Available most weekends year-round. Can accommodate last-minute bookings with 48 hours notice. Not available major holidays.',
    true
  )
  on conflict (id) do nothing;

end $$;
