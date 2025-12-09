-- Add creator_profile jsonb to profiles for storing CEP and analyzed profile
alter table public.profiles
  add column if not exists creator_profile jsonb default '{}'::jsonb;
