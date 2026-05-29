-- ============================================================
-- HorseWatch — Migration 003: add phone + service_requested to inquiries
-- Run in the Supabase SQL Editor
-- ============================================================

alter table public.inquiries
  add column if not exists phone             text,
  add column if not exists service_requested text
    check (service_requested in ('feeding_turnout', 'riding_exercise', 'overnight'));
