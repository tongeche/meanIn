-- MeanIn V1 Seed Data
-- Initial terms and meanings for testing/demo

-- ===========================================
-- Sample Terms
-- ===========================================
insert into public.terms (phrase, slug, base_language, status) values
  ('red pill', 'red-pill', 'en', 'published'),
  ('blue pill', 'blue-pill', 'en', 'published'),
  ('touch grass', 'touch-grass', 'en', 'published'),
  ('no cap', 'no-cap', 'en', 'published'),
  ('lowkey', 'lowkey', 'en', 'published'),
  ('highkey', 'highkey', 'en', 'published'),
  ('slay', 'slay', 'en', 'published'),
  ('ate and left no crumbs', 'ate-and-left-no-crumbs', 'en', 'published'),
  ('its giving', 'its-giving', 'en', 'published'),
  ('understood the assignment', 'understood-the-assignment', 'en', 'published'),
  ('main character energy', 'main-character-energy', 'en', 'published'),
  ('caught in 4k', 'caught-in-4k', 'en', 'published'),
  ('rent free', 'rent-free', 'en', 'published'),
  ('based', 'based', 'en', 'published'),
  ('sus', 'sus', 'en', 'published');

-- ===========================================
-- Sample Term Meanings
-- ===========================================

-- Red pill
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Choosing to see harsh reality over comfortable illusion, from The Matrix movie.',
  'Originated from the 1999 film The Matrix where the red pill reveals the truth about reality. Now used broadly to mean awakening to uncomfortable truths about society, relationships, politics, or life. Can have different connotations depending on context.',
  '["I took the red pill about corporate culture", "Sometimes you need to red pill yourself about that relationship"]'::jsonb,
  'en'
from public.terms where slug = 'red-pill';

-- Blue pill
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Choosing comfortable ignorance over harsh truth, opposite of red pill.',
  'From The Matrix - choosing the blue pill means staying in blissful ignorance. Used to describe someone who prefers not to face uncomfortable realities or who remains willfully unaware.',
  '["He blue-pilled himself about the situation", "Sometimes blue pill is just self-care"]'::jsonb,
  'en'
from public.terms where slug = 'blue-pill';

-- Touch grass
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Go outside and disconnect from the internet; you''re too online.',
  'A dismissive phrase telling someone they spend too much time online and need to reconnect with the real world. Often used when someone is being overly dramatic about internet drama or showing signs of being chronically online.',
  '["Bro you need to touch grass", "This take is so bad, please touch grass"]'::jsonb,
  'en'
from public.terms where slug = 'touch-grass';

-- No cap
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'No lie, for real, I''m being completely honest.',
  'Used to emphasize that you''re telling the truth or being genuine. "Cap" means lie, so "no cap" means no lies. Originated in hip-hop culture and became mainstream through social media.',
  '["That was the best meal I ever had, no cap", "No cap, she''s the smartest person I know"]'::jsonb,
  'en'
from public.terms where slug = 'no-cap';

-- Lowkey
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Secretly, kind of, or in a subtle way.',
  'Used to express something you feel but don''t want to fully commit to or broadcast. Can mean "secretly" or "sort of." Often used to admit something slightly embarrassing or unexpected.',
  '["I lowkey love that song", "Lowkey nervous about tomorrow"]'::jsonb,
  'en'
from public.terms where slug = 'lowkey';

-- Highkey
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Openly, obviously, or very much so.',
  'The opposite of lowkey - used when you want to emphasize something without reservation. You''re being open and direct about your feelings or opinions.',
  '["I highkey need a vacation", "That was highkey the best party ever"]'::jsonb,
  'en'
from public.terms where slug = 'highkey';

-- Slay
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'To do something exceptionally well; to look amazing or succeed impressively.',
  'Originally from drag and ballroom culture, now mainstream. Used to compliment someone who is doing something impressively, looking great, or succeeding at something.',
  '["You slayed that presentation", "She walked in and absolutely slayed"]'::jsonb,
  'en'
from public.terms where slug = 'slay';

-- Ate and left no crumbs
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Did something so perfectly there''s nothing left to criticize.',
  'A way of saying someone executed something flawlessly. The metaphor suggests they "ate" (did the thing so well) that there are no "crumbs" (flaws or room for criticism) left behind.',
  '["Her performance? She ate and left no crumbs", "The outfit ate, no crumbs detected"]'::jsonb,
  'en'
from public.terms where slug = 'ate-and-left-no-crumbs';

-- It's giving
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'It has the vibe/energy of something; it reminds me of.',
  'Used to describe what energy, aesthetic, or vibe something or someone is giving off. Often used as a compliment but can also be critical depending on what follows.',
  '["That outfit is giving main character", "This party is giving high school dance"]'::jsonb,
  'en'
from public.terms where slug = 'its-giving';

-- Understood the assignment
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Did exactly what was needed; nailed it completely.',
  'A way of saying someone knew exactly what they needed to do and executed it perfectly. Often used for fashion choices, performances, or any situation where someone met or exceeded expectations.',
  '["The dress code was Y2K and she understood the assignment", "He walked in and understood the assignment"]'::jsonb,
  'en'
from public.terms where slug = 'understood-the-assignment';

-- Main character energy
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Acting like you''re the protagonist of life; confident self-focus.',
  'The energy of someone who lives life like they''re the main character in a movie - confident, unbothered, and doing their own thing. Can be aspirational or slightly teasing.',
  '["Walking into Monday with main character energy", "She has that main character energy, everything revolves around her"]'::jsonb,
  'en'
from public.terms where slug = 'main-character-energy';

-- Caught in 4k
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Caught red-handed with clear evidence; undeniably exposed.',
  'References 4K video resolution - meaning someone was caught doing something with such clear evidence there''s no denying it. Often used humorously when someone is exposed or caught in a lie.',
  '["He said he was sick but was caught in 4k at the club", "Caught in 4k liking your ex''s photos"]'::jsonb,
  'en'
from public.terms where slug = 'caught-in-4k';

-- Rent free
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Living in someone''s head without effort; constantly thought about.',
  'When something or someone occupies your thoughts without paying any "rent" - meaning they take up mental space effortlessly. Often used to describe obsessing over something or someone.',
  '["That song has been living rent free in my head", "Your haters think about you rent free"]'::jsonb,
  'en'
from public.terms where slug = 'rent-free';

-- Based
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Authentic, unapologetically yourself, not caring what others think.',
  'Originally from rapper Lil B, now means being true to yourself regardless of what''s popular or expected. Someone with a controversial but genuine opinion might be called based.',
  '["That''s a based take", "He said what everyone was thinking, so based"]'::jsonb,
  'en'
from public.terms where slug = 'based';

-- Sus
insert into public.term_meanings (term_id, short_definition, full_explanation, examples, language)
select 
  id,
  'Suspicious, sketchy, or questionable.',
  'Short for "suspicious" - became hugely popular through the game Among Us. Used when something or someone seems off, untrustworthy, or questionable.',
  '["That excuse sounds sus", "Why is he acting so sus today?"]'::jsonb,
  'en'
from public.terms where slug = 'sus';
