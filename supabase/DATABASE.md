# Database Management

This document describes how to manage database migrations for MeanIn.

## Quick Commands

```bash
# See all available commands
make help

# Push migrations to remote
make db-push

# Create a new migration
make db-new NAME=add_user_preferences

# Generate TypeScript types
make db-types

# Check migration status
make db-status
```

## Workflow

### 1. Making Schema Changes

**Option A: Write migration manually (recommended)**

```bash
# Create a new migration file
make db-new NAME=add_user_preferences

# Edit the generated file in supabase/migrations/
# Then push to remote
make db-push
```

**Option B: Make changes in Supabase Dashboard, then pull**

```bash
# After making changes in Dashboard
make db-pull

# Review the generated migration
# Then push to ensure it's tracked
make db-push
```

### 2. Syncing Local & Remote

```bash
# Check current status
make db-status

# See differences between local and remote
make db-diff

# Full reconciliation workflow
make reconcile
```

### 3. Generating TypeScript Types

After any schema change:

```bash
make db-types
```

This generates `src/types/database.types.ts` with full type definitions.

## Migration Files

Migrations are in `supabase/migrations/`:

| File | Purpose |
|------|---------|
| `00001_initial_schema.sql` | Core tables (profiles, terms, posts, etc.) |
| `00002_functions.sql` | Database functions |
| `00003_triggers.sql` | Auto-update triggers |

## Seed Data

Sample data is in `supabase/seed.sql`. To apply:

```bash
make db-push-seed
```

## Danger Zone

```bash
# Reset local database (destroys local data)
make db-reset

# Reset remote database (DESTROYS ALL DATA - use with extreme caution!)
make db-reset-remote
```

## Troubleshooting

### Migration already applied error

If you see "migration already applied" errors:

```bash
# Check which migrations are applied
make db-status

# If needed, mark a migration as applied without running it
supabase migration repair --status applied <version>
```

### Schema drift

If local and remote are out of sync:

```bash
# See the diff
make db-diff

# Pull remote changes
make db-pull

# Or push local changes
make db-push
```

### Extension errors

If you see errors about missing extensions (like `pg_trgm`):

1. Make sure extensions are created in the first migration
2. Use `extensions.` prefix when referencing extension functions
3. Check that the extension is enabled in Supabase Dashboard → Database → Extensions
