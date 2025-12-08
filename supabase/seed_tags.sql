-- Seed data for tags table
-- Run this after the migration: make db-seed

-- Insert themed tags with gradients and accent colors
insert into public.tags (slug, label, description, bg_gradient, text_color, accent_color) values
  ('love', 'Love', 'Romance, relationships, heartbreak', 'linear-gradient(135deg, #1a0a14 0%, #2d1f2f 50%, #1a0a14 100%)', '#F4F4F7', '#FF6B9D'),
  ('conflict', 'Conflict', 'Arguments, disagreements, tension', 'linear-gradient(135deg, #1a0f0a 0%, #2f1f1a 50%, #1a0f0a 100%)', '#F4F4F7', '#FF6B3D'),
  ('existential', 'Existential', 'Deep thoughts, meaning of life, philosophy', 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2f 50%, #0a0a1a 100%)', '#F4F4F7', '#8B5CFF'),
  ('growth', 'Growth', 'Self-improvement, learning, progress', 'linear-gradient(135deg, #0a1a0f 0%, #1a2f1f 50%, #0a1a0f 100%)', '#F4F4F7', '#4ADE80'),
  ('hustle', 'Hustle', 'Work, ambition, grind culture', 'linear-gradient(135deg, #1a1a0a 0%, #2f2f1a 50%, #1a1a0a 100%)', '#F4F4F7', '#FBBF24'),
  ('shade', 'Shade', 'Subtle insults, passive aggression', 'linear-gradient(135deg, #0f0a1a 0%, #1f1a2f 50%, #0f0a1a 100%)', '#F4F4F7', '#A78BFA'),
  ('peace', 'Peace', 'Calm, acceptance, inner peace', 'linear-gradient(135deg, #0a1414 0%, #1a2424 50%, #0a1414 100%)', '#F4F4F7', '#5EEAD4'),
  ('faith', 'Faith', 'Religion, spirituality, belief', 'linear-gradient(135deg, #14140a 0%, #24241a 50%, #14140a 100%)', '#F4F4F7', '#F9F7C9'),
  ('flex', 'Flex', 'Showing off, bragging, achievements', 'linear-gradient(135deg, #1a0a0a 0%, #2f1a1a 50%, #1a0a0a 100%)', '#F4F4F7', '#F472B6'),
  ('general', 'General', 'Default theme for uncategorized posts', 'linear-gradient(135deg, #0A0A0F 0%, #1B1B24 100%)', '#F4F4F7', '#4A90FF')
on conflict (slug) do update set
  label = excluded.label,
  description = excluded.description,
  bg_gradient = excluded.bg_gradient,
  text_color = excluded.text_color,
  accent_color = excluded.accent_color;
