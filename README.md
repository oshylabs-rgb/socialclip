# SocialClip — AI Social Media Video Generator

Turn any product URL into export-ready social media videos, reels, stories, and posts.

## Live Demo

**Production:** https://socialclip.vercel.app

## Features

- **URL Analysis** — Paste a product URL; AI extracts brand, tone, features, audience, and CTA
- **Multi-Format Output** — Instagram Reel, Story, Square Post, Landscape, LinkedIn Video
- **In-Browser Preview** — Remotion-powered video player with scene-by-scene playback
- **Demo Mode** — Try the full flow without API keys
- **Dark Mode** — System-aware with manual toggle
- **Responsive** — Mobile-first layout

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** — Design system with CSS custom properties
- **Neon PostgreSQL** + **Drizzle ORM** — Persistence
- **OpenAI GPT-4o** — Brand analysis & scene script generation
- **Remotion** — Programmatic video rendering & in-browser preview
- **Framer Motion** — UI animations
- **Zustand** — Client state management
- **Cheerio** — URL scraping (serverless-compatible)

## Setup

```bash
# Install
npm install

# Set environment variables
cp .env.example .env.local
# Fill in: DATABASE_URL, OPENAI_API_KEY

# Push DB schema
npm run db:push

# Dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (optional, for file storage) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push Drizzle schema to Neon |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Architecture

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── api/          # generate, projects, upload endpoints
│   ├── dashboard/    # Generation dashboard
│   └── preview/      # Video preview & export
├── components/       # Shared UI components
├── lib/              # Store, AI, scraper, DB
│   └── db/           # Drizzle schema & connection
└── remotion/         # Video compositions & scene templates
```

## Deployment

Deployed on **Vercel** with **Neon** PostgreSQL. Push to `master` to trigger auto-deploy.
