-- MeanIn V1 Database Schema
-- Initial migration: Core tables for posts, terms, and analytics

-- ===========================================
-- 0. ENABLE REQUIRED EXTENSIONS
-- ===========================================
create extension if not exists pg_trgm with schema extensions;

-- ===========================================
-- 1. PROFILES (optional, for returning users)
-- ===========================================
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  avatar_url        text,
  preferred_language text default 'en',  -- 'en', 'pt', 'sw', 'sheng', 'luo', etc.
  country_code      text,                -- 'KE', 'PT', 'US', 'UK', etc.
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ===========================================
-- 2. TERMS (dictionary of slang/phrases)
-- ===========================================
create table public.terms (
  id              uuid primary key default gen_random_uuid(),
  phrase          text not null,              -- e.g. 'red pill'
  slug            text not null unique,       -- e.g. 'red-pill'
  base_language   text not null default 'en',
  status          text not null default 'published'
                  check (status in ('draft', 'published', 'archived')),
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes for fast lookups
create index terms_phrase_idx on public.terms using gin (phrase extensions.gin_trgm_ops);
create index terms_slug_idx on public.terms(slug);
create index terms_status_idx on public.terms(status);

-- Enable RLS
alter table public.terms enable row level security;

-- Terms policies (public read, authenticated write)
create policy "Anyone can view published terms"
  on public.terms for select
  using (status = 'published');

create policy "Authenticated users can create terms"
  on public.terms for insert
  with check (auth.role() = 'authenticated');

-- ===========================================
-- 3. TERM_MEANINGS (definitions per term)
-- ===========================================
create table public.term_meanings (
  id                uuid primary key default gen_random_uuid(),
  term_id           uuid not null references public.terms(id) on delete cascade,
  short_definition  text not null,        -- 1-2 line TL;DR used in decode
  full_explanation  text,                 -- optional longer description
  examples          jsonb default '[]',   -- e.g. ['example 1', 'example 2']
  notes_for_ai      jsonb,                -- hints/context for AI (optional)
  language          text default 'en',    -- language of this meaning
  region            text,                 -- optional region specificity (e.g. 'KE', 'NG')
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Indexes
create index term_meanings_term_id_idx on public.term_meanings(term_id);
create index term_meanings_language_idx on public.term_meanings(language);

-- Enable RLS
alter table public.term_meanings enable row level security;

-- Term meanings policies
create policy "Anyone can view term meanings"
  on public.term_meanings for select
  using (true);

create policy "Authenticated users can create term meanings"
  on public.term_meanings for insert
  with check (auth.role() = 'authenticated');

-- ===========================================
-- 4. POSTS (user-created status/story posts)
-- ===========================================
create table public.posts (
  id                uuid primary key default gen_random_uuid(),
  author_id         uuid references public.profiles(id) on delete set null,

  text              text not null,            -- full sentence typed by user
  keyword_text      text,                     -- phrase we decode (as appears in text)
  keyword_term_id   uuid references public.terms(id) on delete set null,

  author_language   text default 'en',        -- inferred from browser or profile
  author_country    text,                     -- inferred from IP/profile

  platform          text default 'whatsapp-status'  -- 'whatsapp-status', 'instagram-story', 'tiktok-story'
                    check (platform in ('whatsapp-status', 'instagram-story', 'tiktok-story')),
  public_slug       text not null unique,     -- short ID for URL (/p/{public_slug})
  
  card_url          text,                     -- URL to generated PNG card
  card_generated_at timestamptz,              -- when card was generated

  created_at        timestamptz not null default now()
);

-- Indexes
create index posts_keyword_term_idx on public.posts(keyword_term_id);
create index posts_public_slug_idx on public.posts(public_slug);
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_platform_idx on public.posts(platform);

-- Enable RLS
alter table public.posts enable row level security;

-- Posts policies (public read for decode, anyone can create)
create policy "Anyone can view posts"
  on public.posts for select
  using (true);

create policy "Anyone can create posts"
  on public.posts for insert
  with check (true);

-- ===========================================
-- 5. POST_VIEWS (lightweight analytics)
-- ===========================================
create table public.post_views (
  id                bigserial primary key,
  post_id           uuid not null references public.posts(id) on delete cascade,
  viewed_at         timestamptz not null default now(),
  viewer_country    text,
  viewer_language   text,
  referer           text,       -- 'whatsapp', 'instagram', 'tiktok', 'direct'
  user_agent        text,
  ip_hash           text        -- hashed IP for uniqueness without storing raw IP
);

-- Indexes
create index post_views_post_id_idx on public.post_views(post_id);
create index post_views_viewed_at_idx on public.post_views(viewed_at desc);
create index post_views_referer_idx on public.post_views(referer);

-- Enable RLS
alter table public.post_views enable row level security;

-- Post views policies
create policy "Anyone can create post views"
  on public.post_views for insert
  with check (true);

create policy "Service role can read post views"
  on public.post_views for select
  using (auth.role() = 'service_role');
