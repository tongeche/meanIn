# **DEVELOPMENT_GUIDE.md**

**MeanIn – Development Implementation Guide**  
Version: **1.0**  
Purpose: Consolidated guide for building MeanIn V1, synthesized from all specification documents.

---

## **1. Project Overview**

### **What is MeanIn?**

A minimal web app for WhatsApp Status where users:
1. Write a one-sentence post
2. Generate a shareable story card (PNG)
3. Share to WhatsApp Status (primary), Instagram, or TikTok
4. Viewers tap the link → see decoded meaning → become creators

### **Core Principle**

> Everything must happen in < 5 seconds with zero friction.

---

## **2. Tech Stack**

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router) |
| **Styling** | Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (Postgres) |
| **Auth** | None for V1 (anonymous) |
| **AI** | OpenAI GPT-4o-mini |
| **Storage** | Supabase Storage |
| **Hosting** | Netlify |

---

## **3. Project Structure**

```
meanIn/
├── .env                    # Environment variables (gitignored)
├── .env.example            # Template for env vars
├── .gitignore
├── Makefile                # Database & dev commands
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
│
├── instructions/           # Product specs (gitignored)
│   ├── productsepac.md     # Product & data spec
│   ├── prompts.md          # AI prompt specifications
│   ├── ui.md               # UI/UX guidelines
│   └── user_journey.md     # User flow documentation
│
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   ├── DATABASE.md
│   └── migrations/
│       ├── 00001_initial_schema.sql
│       ├── 00002_functions.sql
│       └── 00003_triggers.sql
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Create Post screen (/)
│   │   ├── p/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Decode screen (/p/:slug)
│   │   └── api/
│   │       ├── posts/
│   │       │   └── route.ts    # POST /api/posts
│   │       └── decode/
│   │           └── [slug]/
│   │               └── route.ts # GET /api/decode/:slug
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── PlatformSelector.tsx
│   │   │   └── LoadingShimmer.tsx
│   │   ├── CreatePost.tsx      # Main create form
│   │   ├── DecodeCard.tsx      # Decode display
│   │   └── StoryCard.tsx       # Card preview
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   └── server.ts       # Server client
│   │   ├── openai/
│   │   │   ├── client.ts       # OpenAI client
│   │   │   └── prompts.ts      # Prompt templates
│   │   ├── card-generator.ts   # PNG generation
│   │   └── utils.ts            # Helpers
│   │
│   ├── types/
│   │   ├── database.types.ts   # Generated from Supabase
│   │   └── index.ts            # App types
│   │
│   └── styles/
│       └── globals.css         # Tailwind + custom styles
│
└── public/
    └── fonts/                  # Inter font files
```

---

## **4. Routes & Pages**

### **Frontend Routes**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `page.tsx` | Create Post screen |
| `/p/[slug]` | `page.tsx` | Decode screen |

### **API Routes**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/posts` | POST | Create post, extract keyword, generate card |
| `/api/decode/[slug]` | GET | Fetch post + decode with AI |

---

## **5. Database Schema**

### **Tables**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | Optional user data | `id`, `display_name`, `preferred_language` |
| `terms` | Dictionary of phrases | `id`, `phrase`, `slug`, `status` |
| `term_meanings` | Definitions | `term_id`, `short_definition`, `full_explanation` |
| `posts` | User posts | `text`, `keyword_text`, `keyword_term_id`, `public_slug` |
| `post_views` | Analytics | `post_id`, `viewer_country`, `referer` |

### **Key Functions**

| Function | Purpose |
|----------|---------|
| `create_post()` | Create post with auto-generated slug |
| `get_post_for_decode()` | Fetch post + term data for decode |
| `find_or_create_term()` | Find or create draft term |
| `record_post_view()` | Track analytics |

---

## **6. API Implementation**

### **POST /api/posts**

**Request:**
```json
{
  "text": "Sometimes it's better to choose the red pill.",
  "platform": "whatsapp-status"
}
```

**Flow:**
1. Extract keyword (check DB first, then AI)
2. Find or create term
3. Create post record with unique slug
4. Generate PNG card
5. Upload to storage
6. Return share URL + card URL

**Response:**
```json
{
  "slug": "abc123",
  "share_url": "https://meanin.com/p/abc123",
  "card_url": "https://cdn.meanin.com/cards/abc123.png"
}
```

### **GET /api/decode/[slug]**

**Flow:**
1. Fetch post by slug
2. Fetch term + meanings
3. Infer viewer country/language from headers
4. Call AI with decode prompt
5. Record view analytics
6. Return decode payload

**Response:**
```json
{
  "post": {
    "text": "Sometimes it's better to choose the red pill.",
    "keyword_text": "red pill"
  },
  "meaning": {
    "base_meaning": "Choosing harsh truth over comfortable illusion.",
    "contextual_meaning": "They mean it's sometimes better to face reality.",
    "local_context": "In Kenyan culture...",
    "local_example": "Saa ingine ni better ukubali tu ukweli...",
    "related_terms": ["blue pill", "based"]
  }
}
```

---

## **7. AI Prompts**

### **Prompt Types**

| # | Prompt | When Used |
|---|--------|-----------|
| 1 | Keyword Extraction | Creating post, no DB match |
| 2 | Term Meaning Generation | New keyword not in DB |
| 3 | Decode Interpretation | Viewer opens decode page |
| 4 | Safety Check | Before processing any post |

### **Key Settings**

```typescript
{
  model: 'gpt-4o-mini',
  response_format: { type: 'json_object' },
  temperature: 0.3,
  max_tokens: 400
}
```

See `instructions/prompts.md` for full prompt templates.

---

## **8. UI Components**

### **Design Tokens**

```css
/* Colors */
--midnight-black: #0A0A0F;
--deep-slate: #1B1B24;
--electric-blue: #3F8CFF;
--soft-white: #F4F4F7;
--fog-grey: #A7A7B2;
--neon-violet: #8B5CFF;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Radius */
--radius-button: 12px;
--radius-card: 20px;
```

### **Key Components**

| Component | Purpose |
|-----------|---------|
| `Button` | Primary (blue) and secondary (outline) variants |
| `Input` | Dark textarea, autosizing, max 4 lines |
| `PlatformSelector` | Pill buttons, WhatsApp pre-selected |
| `LoadingShimmer` | Skeleton loader |
| `DecodeCard` | Expandable meaning display |
| `StoryCard` | 9:16 PNG preview |

See `instructions/ui.md` for full specifications.

---

## **9. Card Generation**

### **Specifications**

- **Size:** 1080 x 1920 (9:16)
- **Background:** Gradient `#0A0A0F → #1B1B24`
- **Text:** Center-aligned, Inter SemiBold
- **Keyword:** Highlighted in Neon Violet
- **Footer:** `meanin.com/p/slug` in small Fog Grey

### **Implementation Options**

1. **Satori + Resvg** (recommended) - React to SVG to PNG
2. **Puppeteer** - Headless browser screenshot
3. **Canvas API** - Node-canvas

---

## **10. Development Workflow**

### **Setup**

```bash
# Clone and install
npm install

# Copy env file
cp .env.example .env
# Fill in your keys

# Generate types from DB
make db-types

# Start dev server
npm run dev
```

### **Database Changes**

```bash
# Create new migration
make db-new NAME=add_feature

# Push to remote
make db-push

# Regenerate types
make db-types
```

### **Common Commands**

```bash
make help          # See all commands
make dev           # Start dev server
make db-push       # Push migrations
make db-types      # Generate TypeScript types
make db-status     # Check migration status
```

---

## **11. Implementation Order**

### **Phase 1: Foundation**
- [ ] Initialize Next.js project
- [ ] Configure Tailwind with design tokens
- [ ] Set up Supabase client
- [ ] Generate TypeScript types
- [ ] Create base layout

### **Phase 2: Create Flow**
- [ ] Build Create Post page UI
- [ ] Implement POST /api/posts
- [ ] Keyword extraction (DB lookup + AI fallback)
- [ ] Card generation (basic template)
- [ ] Native share integration

### **Phase 3: Decode Flow**
- [ ] Build Decode page UI
- [ ] Implement GET /api/decode/[slug]
- [ ] AI decode interpretation
- [ ] Analytics tracking
- [ ] "Create your own" CTA

### **Phase 4: Polish**
- [ ] Loading states
- [ ] Error handling
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Safety checks

### **Phase 5: Launch**
- [ ] Deploy to Vercel
- [ ] Configure domain
- [ ] Create storage bucket
- [ ] Test full flow
- [ ] Monitor analytics

---

## **12. Success Criteria**

| Metric | Target |
|--------|--------|
| Create → Share time | < 5 seconds |
| Decode page load | < 2 seconds |
| Mobile responsiveness | 100% |
| Core flow completion | Works without errors |

### **Definition of Done**

1. ✅ User can write → generate card → share
2. ✅ Viewer can tap → see meaning instantly
3. ✅ Viewer can become creator (loop completes)

---

## **13. Reference Documents**

| Document | Location | Purpose |
|----------|----------|---------|
| Product Spec | `instructions/productsepac.md` | Features, data model, API spec |
| AI Prompts | `instructions/prompts.md` | All prompt templates |
| UI Guidelines | `instructions/ui.md` | Colors, typography, components |
| User Journey | `instructions/user_journey.md` | User flows, wireframes |
| Database Docs | `supabase/DATABASE.md` | Migration workflow |

---

## **14. Key Decisions**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary platform | WhatsApp Status | Target market, viral potential |
| Auth | None for V1 | Zero friction |
| AI Model | GPT-4o-mini | Cost-effective, fast |
| Card generation | Server-side | Consistent quality |
| Styling | Tailwind | Fast development, consistent |
| Database | Supabase | Postgres + auth + storage |

---

## **15. Gotchas & Tips**

### **Common Issues**

| Issue | Solution |
|-------|----------|
| pg_trgm extension error | Use `extensions.` prefix |
| CORS on Supabase | Check RLS policies |
| Card generation slow | Use caching, lazy generation |
| AI returning bad JSON | Use `response_format: { type: 'json_object' }` |

### **Performance Tips**

- Cache term meanings (they don't change)
- Lazy load "More context" section
- Use skeleton loaders
- Preload fonts

### **Mobile First**

- Test on real devices
- Touch targets ≥ 44px
- Keep pages single-scroll
- Test on 3G connection

---

**End of DEVELOPMENT_GUIDE.md**
