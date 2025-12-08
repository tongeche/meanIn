-- Add origin column to term_meanings for storing etymology/history
-- This allows caching AI-generated origin data to avoid redundant API calls

alter table public.term_meanings
  add column if not exists origin text;

comment on column public.term_meanings.origin is 'Etymology, history, or cultural origin of the term - can be AI-generated or curated';
