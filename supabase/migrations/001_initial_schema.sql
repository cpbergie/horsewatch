-- ============================================================
-- HorseWatch — Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

create table public.profiles (
  id                uuid references auth.users on delete cascade primary key,
  created_at        timestamptz default now(),
  full_name         text not null,
  email             text not null,
  phone             text,
  location          text,
  bio               text,
  profile_photo_url text,
  is_owner          boolean default false,
  is_caretaker      boolean default false,
  is_admin          boolean default false,
  is_approved       boolean default false  -- caretakers must be approved before appearing in browse
);

create table public.owner_profiles (
  id                  uuid references public.profiles(id) on delete cascade primary key,
  num_horses          int,
  horse_details       text,
  property_address    text,
  barn_access_notes   text
);

create table public.caretaker_profiles (
  id                    uuid references public.profiles(id) on delete cascade primary key,
  years_experience      int,
  services              text[],
  disciplines           text[],
  has_own_transport     boolean,
  rates_per_day         text,
  availability_notes    text,
  references_available  boolean
);

create table public.inquiries (
  id            uuid default gen_random_uuid() primary key,
  created_at    timestamptz default now(),
  owner_id      uuid references public.profiles(id) on delete set null,
  caretaker_id  uuid references public.profiles(id) on delete set null,
  trip_start    date,
  trip_end      date,
  horse_count   int,
  message       text,
  status        text default 'pending' check (status in ('pending', 'connected', 'declined'))
);

-- ============================================================
-- STORAGE BUCKET (profile photos)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict do nothing;

-- ============================================================
-- HELPER FUNCTION
-- Uses security definer so it can read profiles without
-- triggering the RLS policies on that table (avoids recursion)
-- ============================================================

create or replace function public.get_my_profile_flags()
returns table (is_owner boolean, is_caretaker boolean, is_admin boolean)
language sql
security definer
stable
as $$
  select is_owner, is_caretaker, is_admin
  from public.profiles
  where id = auth.uid();
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.owner_profiles    enable row level security;
alter table public.caretaker_profiles enable row level security;
alter table public.inquiries         enable row level security;

-- ------------------------------------------------------------
-- profiles policies
-- ------------------------------------------------------------

-- Anyone can insert their own profile row on signup
create policy "profiles: insert own"
  on public.profiles for insert
  with check (id = auth.uid());

-- Users can read their own profile
create policy "profiles: select own"
  on public.profiles for select
  using (id = auth.uid());

-- Owners can read approved caretaker profiles
create policy "profiles: owners read approved caretakers"
  on public.profiles for select
  using (
    is_caretaker = true
    and is_approved = true
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_owner = true
    )
  );

-- Users can update their own profile
create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ------------------------------------------------------------
-- owner_profiles policies
-- ------------------------------------------------------------

create policy "owner_profiles: insert own"
  on public.owner_profiles for insert
  with check (id = auth.uid());

create policy "owner_profiles: select own"
  on public.owner_profiles for select
  using (id = auth.uid());

create policy "owner_profiles: update own"
  on public.owner_profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Caretakers can read owner profiles for their connected inquiries
create policy "owner_profiles: caretakers read connected owners"
  on public.owner_profiles for select
  using (
    exists (
      select 1 from public.inquiries i
      where i.owner_id = owner_profiles.id
        and i.caretaker_id = auth.uid()
        and i.status = 'connected'
    )
  );

-- ------------------------------------------------------------
-- caretaker_profiles policies
-- ------------------------------------------------------------

create policy "caretaker_profiles: insert own"
  on public.caretaker_profiles for insert
  with check (id = auth.uid());

create policy "caretaker_profiles: select own"
  on public.caretaker_profiles for select
  using (id = auth.uid());

create policy "caretaker_profiles: update own"
  on public.caretaker_profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Owners can read approved caretaker extended profiles
create policy "caretaker_profiles: owners read approved"
  on public.caretaker_profiles for select
  using (
    exists (
      select 1 from public.profiles cp
      where cp.id = caretaker_profiles.id
        and cp.is_caretaker = true
        and cp.is_approved = true
    )
    and exists (
      select 1 from public.profiles op
      where op.id = auth.uid() and op.is_owner = true
    )
  );

-- ------------------------------------------------------------
-- inquiries policies
-- ------------------------------------------------------------

-- Owners can submit inquiries
create policy "inquiries: insert as owner"
  on public.inquiries for insert
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_owner = true
    )
  );

-- Owners see their own inquiries; caretakers see inquiries addressed to them
create policy "inquiries: select own"
  on public.inquiries for select
  using (
    owner_id = auth.uid() or caretaker_id = auth.uid()
  );

-- Caretakers can update status on their own inquiries
create policy "inquiries: caretaker update status"
  on public.inquiries for update
  using (caretaker_id = auth.uid())
  with check (caretaker_id = auth.uid());

-- ============================================================
-- STORAGE POLICIES (profile photos)
-- ============================================================

-- Anyone authenticated can upload their own photo
create policy "profile-photos: authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.role() = 'authenticated'
  );

-- Photos are publicly readable (bucket is public)
create policy "profile-photos: public read"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

-- Users can update/delete their own photo
create policy "profile-photos: owner update"
  on storage.objects for update
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile-photos: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
