# MeanIn Supabase Database

This directory contains the database schema, functions, and seed data for MeanIn.

## Structure

```
supabase/
├── config.toml                    # Supabase local dev config
├── seed.sql                       # Sample data for testing
├── migrations/
│   ├── 00001_initial_schema.sql   # Core tables (profiles, terms, posts, etc.)
│   ├── 00002_functions.sql        # Database functions
│   └── 00003_triggers.sql         # Auto-update triggers
└── README.md
```

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Optional user profiles (for returning users) |
| `terms` | Dictionary of slang/phrases to decode |
| `term_meanings` | Definitions and examples per term |
| `posts` | User-created WhatsApp status/story posts |
| `post_views` | Analytics for link clicks |

## Relationships

```
profiles
   ├──< terms          (created_by)
   ├──< term_meanings  (created_by)
   └──< posts          (author_id)

terms ──< term_meanings  (term_id)
  ▲
  │
posts.keyword_term_id    (many posts → one term)
  │
  └──< post_views        (post_id)
```

## Key Functions

| Function | Purpose |
|----------|---------|
| `create_post()` | Create post with auto-generated slug |
| `get_post_for_decode()` | Fetch post + term data for decode page |
| `record_post_view()` | Track analytics when someone views a post |
| `find_or_create_term()` | Find existing term or create draft |
| `search_terms()` | Fuzzy search for terms |
| `get_post_analytics()` | Get view stats for a post |

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Start local Supabase

```bash
supabase start
```

### 3. Apply migrations

```bash
supabase db reset  # Applies all migrations + seed data
```

### 4. Link to production (when ready)

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Storage

The app uses Supabase Storage for card images. Create the bucket:

```sql
insert into storage.buckets (id, name, public) 
values ('cards', 'cards', true);
```

Or via Dashboard: Storage → New Bucket → "cards" (public)
