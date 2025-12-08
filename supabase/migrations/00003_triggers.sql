-- MeanIn V1 Database Triggers
-- Automatic timestamps and cascading updates

-- ===========================================
-- FUNCTION: Update updated_at timestamp
-- ===========================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================
-- TRIGGERS: Auto-update updated_at
-- ===========================================

-- Profiles
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Terms
create trigger set_terms_updated_at
  before update on public.terms
  for each row
  execute function public.handle_updated_at();

-- Term meanings
create trigger set_term_meanings_updated_at
  before update on public.term_meanings
  for each row
  execute function public.handle_updated_at();

-- ===========================================
-- FUNCTION: Auto-create profile on signup
-- ===========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email)
  );
  return new;
end;
$$;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
