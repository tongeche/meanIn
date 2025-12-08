-- Creator Decode Flow tables (tags, creator_cards, decodes)
-- Implements structures from instructions/CREATOR_DECODE_FLOW.md

-- 1) Tags (optional background/theme metadata)
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  description text,
  bg_image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists tags_slug_idx on public.tags(slug);
create index if not exists tags_created_at_idx on public.tags(created_at desc);

alter table public.tags enable row level security;

create policy "Anyone can view tags"
  on public.tags for select
  using (true);

create policy "Authenticated users can manage tags"
  on public.tags for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2) Creator cards (line + decode slug + card asset)
create table if not exists public.creator_cards (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete set null,
  text text not null,
  tag_slug text references public.tags(slug),
  bg_image_url text,
  card_image_url text,
  decode_slug text unique not null,
  created_at timestamptz not null default now()
);

create index if not exists creator_cards_decode_slug_idx on public.creator_cards(decode_slug);
create index if not exists creator_cards_created_at_idx on public.creator_cards(created_at desc);

alter table public.creator_cards enable row level security;

create policy "Anyone can view creator cards"
  on public.creator_cards for select
  using (true);

create policy "Anyone can create creator cards"
  on public.creator_cards for insert
  with check (true);

-- 3) Decodes (viewer decode log)
create table if not exists public.decodes (
  id uuid primary key default gen_random_uuid(),
  creator_card_id uuid references public.creator_cards(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  decoded_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists decodes_card_idx on public.decodes(creator_card_id);
create index if not exists decodes_created_at_idx on public.decodes(created_at desc);

alter table public.decodes enable row level security;

create policy "Anyone can log decodes"
  on public.decodes for insert
  with check (true);

create policy "Service role can read decodes"
  on public.decodes for select
  using (auth.role() = 'service_role');
