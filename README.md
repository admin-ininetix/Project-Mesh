# Project Mesh 🌐

A modern, production-ready social media platform built with Next.js 14, TypeScript, PostgreSQL, and Prisma.

## Features

- 🔐 **Auth** — Secure JWT-based authentication with NextAuth.js
- 📝 **Posts** — Create, like, comment, delete posts
- 👥 **Communities** — Create/join communities, post within them
- 👤 **Profiles** — Public user profiles with follow/unfollow
- 🌍 **Public Feed** — SEO-optimized, readable without login
- 🛡️ **Moderation** — Role-based access (USER / MODERATOR / ADMIN)
- 🌙 **Dark Mode** — Modern dark UI with indigo accent

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js v4 |
| Styling | Tailwind CSS |
| Validation | Zod |
| Password | bcryptjs |
| Deployment | Docker + IONOS |

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (or Docker)

### 1. Clone & Install

```bash
git clone <repo-url>
cd project-mesh
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL="postgresql://meshuser:meshpassword@localhost:5432/projectmesh"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-min-32-chars"
```

### 3. Database Setup

```bash
# Start PostgreSQL via Docker
docker compose up db -d

# Run migrations
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed with demo data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo accounts:**
- Admin: `admin@projectmesh.app` / `admin1234`
- User: `demo@projectmesh.app` / `demo1234`

## Production with Docker

```bash
# Copy and configure env
cp .env.example .env
# Edit .env with production values

# Build and start
docker compose up -d

# Run migrations in container
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
```

## IONOS Deployment

1. Push Docker image to registry
2. Configure managed database (PostgreSQL) on IONOS
3. Set environment variables via IONOS control panel
4. Deploy container to IONOS Cloud / Kubernetes

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Login + Register pages
│   ├── (app)/            # Protected pages (feed, compose, settings)
│   ├── api/              # REST API routes
│   ├── communities/      # Community pages (public)
│   ├── posts/            # Post detail pages (public)
│   └── profile/          # User profile pages (public)
├── components/
│   ├── feed/             # PostCard, PostComposer, CommentSection
│   ├── layout/           # Navbar, Sidebar
│   └── ui/               # Button, Input, Card, Avatar
├── lib/                  # prisma.ts, auth.ts, utils.ts
└── types/                # TypeScript types + NextAuth extensions
```

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | Optional | Public feed with pagination |
| POST | `/api/posts` | Required | Create post |
| GET | `/api/posts/:id` | Optional | Get post |
| DELETE | `/api/posts/:id` | Owner/Mod | Delete post |
| POST | `/api/posts/:id/like` | Required | Like post |
| DELETE | `/api/posts/:id/like` | Required | Unlike post |
| GET | `/api/posts/:id/comments` | Optional | Get comments |
| POST | `/api/posts/:id/comments` | Required | Add comment |
| POST | `/api/register` | None | Register user |
| GET | `/api/users/:username` | Optional | Get user profile |
| POST | `/api/users/:username/follow` | Required | Follow user |
| DELETE | `/api/users/:username/follow` | Required | Unfollow user |
| PATCH | `/api/users/profile` | Required | Update own profile |
| GET | `/api/communities` | Optional | List communities |
| POST | `/api/communities` | Required | Create community |
| GET | `/api/communities/:id` | Optional | Get community |
| POST | `/api/communities/:id/join` | Required | Join community |
| DELETE | `/api/communities/:id/join` | Required | Leave community |
