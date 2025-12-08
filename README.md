# MeanIn

**Decode the hidden meaning behind social media posts.**

MeanIn is a web app that helps users understand the deeper meaning behind cryptic WhatsApp statuses, Instagram stories, and TikTok captions. Users create posts, generate shareable story cards, and viewers can tap to decode the meaning.

## Features

- 📝 **Create Posts** - Write a one-sentence post with hidden meaning
- 🎨 **Story Cards** - Generate shareable PNG cards for social media
- 🔍 **Decode Meanings** - AI-powered explanations of slang, phrases, and cultural references
- 📚 **Origin & History** - Learn where phrases come from and how they evolved
- 💾 **Smart Caching** - AI meanings are cached in the database to reduce API costs

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router, Turbopack) |
| **Styling** | Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (Postgres) |
| **AI** | OpenAI GPT-4o-mini |
| **Storage** | Supabase Storage |

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI (OpenAI)
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
```

### Installation

```bash
# Install dependencies
npm install

# Push database migrations
make db-push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Management

```bash
# Push migrations to remote
make db-push

# Create a new migration
make db-new NAME=your_migration_name

# Generate TypeScript types
make db-types

# Check migration status
make db-status
```

See [supabase/DATABASE.md](supabase/DATABASE.md) for detailed database documentation.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Create Post screen (/)
│   ├── p/[slug]/page.tsx     # Decode screen (/p/:slug)
│   └── api/
│       ├── posts/route.ts    # POST /api/posts
│       ├── decode/[slug]/    # GET /api/decode/:slug
│       └── cards/route.ts    # POST /api/cards
├── components/
│   ├── ui/                   # Reusable UI components
│   └── StoryCard.tsx         # Card preview
└── lib/
    ├── supabase/             # Supabase clients
    ├── openai/               # AI prompts & client
    └── card-generator.ts     # PNG generation
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | POST | Create a new post |
| `/api/decode/:slug` | GET | Get post with decoded meaning |
| `/api/cards` | POST | Generate shareable card |

## How It Works

1. **User creates a post** with a cryptic phrase
2. **AI extracts the keyword** and generates meaning
3. **Meaning is cached** in the database for future requests
4. **Viewers tap the link** to see the decoded meaning with:
   - Base meaning (universal definition)
   - Contextual meaning (what the author meant)
   - Origin/history (etymology and cultural background)
   - Related terms

## License

Private project.

