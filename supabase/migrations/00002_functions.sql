-- MeanIn V1 Database Functions
-- Utility functions for posts, terms, and analytics

-- ===========================================
-- Note: pg_trgm extension is created in 00001_initial_schema.sql
-- ===========================================

-- ===========================================
-- FUNCTION: Generate unique public slug
-- ===========================================
create or replace function public.generate_public_slug(length int default 8)
returns text
language plpgsql
as $$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i int;
begin
  for i in 1..length loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

-- ===========================================
-- FUNCTION: Create post with auto-generated slug
-- ===========================================
create or replace function public.create_post(
  p_text text,
  p_keyword_text text default null,
  p_keyword_term_id uuid default null,
  p_platform text default 'whatsapp-status',
  p_author_language text default 'en',
  p_author_country text default null
)
returns public.posts
language plpgsql
security definer
as $$
declare
  new_slug text;
  new_post public.posts;
  max_attempts int := 10;
  attempt int := 0;
begin
  -- Generate unique slug
  loop
    new_slug := public.generate_public_slug(8);
    exit when not exists (select 1 from public.posts where public_slug = new_slug);
    attempt := attempt + 1;
    if attempt >= max_attempts then
      raise exception 'Could not generate unique slug after % attempts', max_attempts;
    end if;
  end loop;

  -- Insert the post
  insert into public.posts (
    text,
    keyword_text,
    keyword_term_id,
    platform,
    author_language,
    author_country,
    public_slug,
    author_id
  ) values (
    p_text,
    p_keyword_text,
    p_keyword_term_id,
    p_platform,
    p_author_language,
    p_author_country,
    new_slug,
    auth.uid()
  )
  returning * into new_post;

  return new_post;
end;
$$;

-- ===========================================
-- FUNCTION: Get post with term details for decode
-- ===========================================
create or replace function public.get_post_for_decode(p_slug text)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'post', jsonb_build_object(
      'id', p.id,
      'text', p.text,
      'keyword_text', p.keyword_text,
      'author_language', p.author_language,
      'author_country', p.author_country,
      'platform', p.platform,
      'created_at', p.created_at,
      'card_url', p.card_url
    ),
    'term', case 
      when t.id is not null then jsonb_build_object(
        'id', t.id,
        'phrase', t.phrase,
        'slug', t.slug,
        'base_language', t.base_language
      )
      else null
    end,
    'meanings', coalesce(
      (select jsonb_agg(jsonb_build_object(
        'id', tm.id,
        'short_definition', tm.short_definition,
        'full_explanation', tm.full_explanation,
        'examples', tm.examples,
        'language', tm.language,
        'region', tm.region
      ))
      from public.term_meanings tm
      where tm.term_id = t.id),
      '[]'::jsonb
    )
  ) into result
  from public.posts p
  left join public.terms t on t.id = p.keyword_term_id
  where p.public_slug = p_slug;

  return result;
end;
$$;

-- ===========================================
-- FUNCTION: Record post view (analytics)
-- ===========================================
create or replace function public.record_post_view(
  p_post_id uuid,
  p_viewer_country text default null,
  p_viewer_language text default null,
  p_referer text default null,
  p_user_agent text default null,
  p_ip_hash text default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.post_views (
    post_id,
    viewer_country,
    viewer_language,
    referer,
    user_agent,
    ip_hash
  ) values (
    p_post_id,
    p_viewer_country,
    p_viewer_language,
    p_referer,
    p_user_agent,
    p_ip_hash
  );
end;
$$;

-- ===========================================
-- FUNCTION: Find or create term by phrase
-- ===========================================
create or replace function public.find_or_create_term(
  p_phrase text,
  p_base_language text default 'en'
)
returns public.terms
language plpgsql
security definer
as $$
declare
  found_term public.terms;
  new_slug text;
begin
  -- Try to find existing term (case-insensitive)
  select * into found_term
  from public.terms
  where lower(phrase) = lower(p_phrase)
  limit 1;

  if found_term.id is not null then
    return found_term;
  end if;

  -- Create slug from phrase
  new_slug := lower(regexp_replace(p_phrase, '[^a-zA-Z0-9]+', '-', 'g'));
  new_slug := regexp_replace(new_slug, '^-|-$', '', 'g');

  -- Ensure unique slug
  if exists (select 1 from public.terms where slug = new_slug) then
    new_slug := new_slug || '-' || substr(gen_random_uuid()::text, 1, 4);
  end if;

  -- Create new term as draft
  insert into public.terms (
    phrase,
    slug,
    base_language,
    status,
    created_by
  ) values (
    p_phrase,
    new_slug,
    p_base_language,
    'draft',
    auth.uid()
  )
  returning * into found_term;

  return found_term;
end;
$$;

-- ===========================================
-- FUNCTION: Search terms by phrase (fuzzy)
-- ===========================================
create or replace function public.search_terms(
  p_query text,
  p_limit int default 10
)
returns setof public.terms
language plpgsql
security definer
as $$
begin
  return query
  select *
  from public.terms
  where status = 'published'
    and (
      phrase ilike '%' || p_query || '%'
      or phrase % p_query  -- trigram similarity
    )
  order by extensions.similarity(phrase, p_query) desc
  limit p_limit;
end;
$$;

-- ===========================================
-- FUNCTION: Get post analytics summary
-- ===========================================
create or replace function public.get_post_analytics(p_post_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total_views', count(*),
    'unique_views', count(distinct ip_hash),
    'views_by_referer', jsonb_object_agg(
      coalesce(referer, 'direct'),
      ref_count
    ),
    'views_by_country', jsonb_object_agg(
      coalesce(viewer_country, 'unknown'),
      country_count
    ),
    'first_view', min(viewed_at),
    'last_view', max(viewed_at)
  ) into result
  from (
    select 
      referer,
      viewer_country,
      ip_hash,
      viewed_at,
      count(*) over (partition by referer) as ref_count,
      count(*) over (partition by viewer_country) as country_count
    from public.post_views
    where post_id = p_post_id
  ) as subquery;

  return coalesce(result, '{}'::jsonb);
end;
$$;

-- ===========================================
-- FUNCTION: Update card URL after generation
-- ===========================================
create or replace function public.update_post_card(
  p_post_id uuid,
  p_card_url text
)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts
  set 
    card_url = p_card_url,
    card_generated_at = now()
  where id = p_post_id;
end;
$$;
