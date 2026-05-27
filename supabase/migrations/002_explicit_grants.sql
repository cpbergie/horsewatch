-- ============================================================
-- HorseWatch — Explicit PostgREST Grants
-- Required by Supabase policy change (effective Oct 30, 2026
-- for existing projects; new projects from May 30, 2026).
--
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- owner_profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.owner_profiles TO authenticated;

-- caretaker_profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caretaker_profiles TO authenticated;

-- inquiries
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
