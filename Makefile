# ===========================================
# MeanIn - Development Makefile
# ===========================================
# Usage: make <command>
# Run `make help` to see all available commands
# ===========================================

.PHONY: help db-push db-pull db-reset db-diff db-new db-seed db-status db-studio db-types dev setup

# Default target
help:
	@echo ""
	@echo "MeanIn Development Commands"
	@echo "==========================="
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-push        Push local migrations to remote Supabase"
	@echo "  make db-push-seed   Push migrations + seed data to remote"
	@echo "  make db-pull        Pull remote schema changes to local"
	@echo "  make db-diff        Show diff between local and remote"
	@echo "  make db-reset       Reset local database (dangerous!)"
	@echo "  make db-new NAME=x  Create a new migration file"
	@echo "  make db-seed        Run seed file on remote database"
	@echo "  make db-status      Check migration status"
	@echo "  make db-studio      Open Supabase Studio locally"
	@echo "  make db-types       Generate TypeScript types from schema"
	@echo ""
	@echo "Development Commands:"
	@echo "  make setup          Initial project setup"
	@echo "  make dev            Start development server"
	@echo "  make lint           Run linter"
	@echo "  make typecheck      Run TypeScript type checking"
	@echo ""

# ===========================================
# Database Commands
# ===========================================

# Push local migrations to remote Supabase
db-push:
	@echo "🚀 Pushing migrations to remote database..."
	supabase db push
	@echo "✅ Migrations applied successfully"

# Push migrations + seed data
db-push-seed:
	@echo "🚀 Pushing migrations and seed data to remote database..."
	supabase db push --include-seed
	@echo "✅ Migrations and seed data applied successfully"

# Pull remote schema changes to local migrations
db-pull:
	@echo "⬇️  Pulling remote schema to local..."
	supabase db pull
	@echo "✅ Schema pulled successfully"

# Show diff between local and remote
db-diff:
	@echo "🔍 Comparing local and remote schemas..."
	supabase db diff

# Create a new migration file
# Usage: make db-new NAME=add_user_preferences
db-new:
ifndef NAME
	$(error NAME is required. Usage: make db-new NAME=migration_name)
endif
	@echo "📝 Creating new migration: $(NAME)"
	supabase migration new $(NAME)
	@echo "✅ Created: supabase/migrations/$$(ls -t supabase/migrations | head -1)"

# Run seed file on remote database
db-seed:
	@echo "🌱 Seeding remote database..."
	supabase db push --include-seed
	@echo "✅ Seed data applied"

# Check migration status
db-status:
	@echo "📊 Checking migration status..."
	supabase migration list

# Open Supabase Studio locally
db-studio:
	@echo "🎨 Opening Supabase Studio..."
	supabase studio

# Generate TypeScript types from database schema
db-types:
	@echo "📦 Generating TypeScript types..."
	supabase gen types typescript --local > src/types/database.types.ts 2>/dev/null || \
	supabase gen types typescript --project-id $$(grep project_id supabase/config.toml | cut -d'"' -f2) > src/types/database.types.ts
	@echo "✅ Types generated: src/types/database.types.ts"

# ===========================================
# Danger Zone - Use with caution!
# ===========================================

# Reset local database (destroys all local data)
db-reset:
	@echo "⚠️  WARNING: This will destroy all local database data!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	supabase db reset
	@echo "✅ Local database reset complete"

# Reset remote database (VERY DANGEROUS)
db-reset-remote:
	@echo "🚨 DANGER: This will destroy ALL remote database data!"
	@echo "🚨 This action cannot be undone!"
	@read -p "Type 'DESTROY' to confirm: " confirm && [ "$$confirm" = "DESTROY" ] || exit 1
	supabase db reset --linked
	@echo "✅ Remote database reset complete"

# ===========================================
# Development Commands
# ===========================================

# Initial project setup
setup:
	@echo "🔧 Setting up MeanIn..."
	@echo "1. Installing dependencies..."
	npm install
	@echo "2. Linking Supabase project..."
	supabase link --project-ref $$(grep project_id supabase/config.toml | cut -d'"' -f2)
	@echo "3. Generating types..."
	$(MAKE) db-types
	@echo "✅ Setup complete! Run 'make dev' to start."

# Start development server
dev:
	npm run dev

# Run linter
lint:
	npm run lint

# Run TypeScript type checking
typecheck:
	npm run typecheck

# ===========================================
# Reconciliation Workflow
# ===========================================

# Full reconciliation: pull remote changes, check diff, then push local
reconcile:
	@echo "🔄 Starting reconciliation workflow..."
	@echo ""
	@echo "Step 1: Checking current status..."
	supabase migration list
	@echo ""
	@echo "Step 2: Showing diff between local and remote..."
	supabase db diff || true
	@echo ""
	@read -p "Continue with pull? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 0
	@echo ""
	@echo "Step 3: Pulling remote changes..."
	supabase db pull || true
	@echo ""
	@echo "✅ Reconciliation complete. Review changes and run 'make db-push' when ready."
