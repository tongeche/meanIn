-- MeanIn V1 Database Schema
-- Migration: Tags for themed backgrounds + Decodes logging

-- ===========================================
-- 1. TAGS (themed backgrounds for cards)
-- ===========================================
create table public.tags (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,           -- e.g. 'existential', 'love', 'conflict'
  label           text not null,                  -- human readable: 'Existential', 'Love'
  description     text,                           -- optional description
  bg_gradient     text,                           -- CSS gradient fallback
  bg_image_urls   text[] default '{}',            -- array of potential background images
  text_color      text default '#F4F4F7',         -- text color for this theme
  accent_color    text default '#8B5CFF',         -- accent color for this theme
  created_at      timestamptz not null default now()
);

-- Indexes
create index tags_slug_idx on public.tags(slug);

-- Enable RLS
alter table public.tags enable row level security;

-- Tags policies (public read)
create policy "Anyone can view tags"
  on public.tags for select
  using (true);

create policy "Service role can manage tags"
  on public.tags for all
  using (auth.role() = 'service_role');

-- ===========================================
-- 2. UPDATE POSTS - Add tag_slug column
-- ===========================================
alter table public.posts 
  add column if not exists tag_slug text references public.tags(slug) on delete set null;

-- Index for tag lookups
create index if not exists posts_tag_slug_idx on public.posts(tag_slug);

-- ===========================================
-- 3. DECODES (viewer decode logging)
-- ===========================================
create table public.decodes (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null references public.posts(id) on delete cascade,
  viewer_id         uuid references public.profiles(id) on delete set null,
  
  -- AI interpretation result
  decoded_text      text not null,                -- the AI-generated interpretation
  base_meaning      text,                         -- base meaning component
  contextual_meaning text,                        -- contextual interpretation
  local_context     text,                         -- local/cultural context
  
  -- Viewer context
  viewer_country    text,                         -- where the decode happened
  viewer_language   text,                         -- browser/user language
  
  created_at        timestamptz not null default now()
);

-- Indexes
create index decodes_post_id_idx on public.decodes(post_id);
create index decodes_created_at_idx on public.decodes(created_at desc);
create index decodes_viewer_country_idx on public.decodes(viewer_country);

-- Enable RLS
alter table public.decodes enable row level security;

-- Decodes policies
create policy "Anyone can create decodes"
  on public.decodes for insert
  with check (true);

create policy "Service role can read decodes"
  on public.decodes for select
  using (auth.role() = 'service_role');

-- ===========================================
-- 4. HELPER FUNCTIONS
-- ===========================================

-- Function to get decode count for a post
create or replace function public.get_decode_count(post_uuid uuid)
returns bigint
language sql
stable
as $$
  select count(*) from public.decodes where post_id = post_uuid;
$$;

-- Function to get random background for a tag
create or replace function public.get_random_bg_for_tag(tag_slug_param text)
returns text
language plpgsql
stable
as $$
declare
  bg_urls text[];
  result text;
begin
  select bg_image_urls into bg_urls
  from public.tags
  where slug = tag_slug_param;
  
  if bg_urls is null or array_length(bg_urls, 1) is null then
    return null;
  end if;
  
  result := bg_urls[1 + floor(random() * array_length(bg_urls, 1))::int];
  return result;
end;
$$;
