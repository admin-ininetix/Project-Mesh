# Project Mesh

Eine offene Social-Media-Community-Plattform gebaut mit Next.js 15, TypeScript, PostgreSQL und Prisma.

## Features

- 📖 **Öffentlich lesbar** – Alle Posts, Profile und Communities ohne Login einsehbar
- 🔐 **Auth** – NextAuth.js mit JWT (Login/Register)
- 📝 **Posts** – Erstellen, Liken, Kommentieren, Teilen
- 🏘️ **Communities** – Beitreten, Community-Posts
- 👤 **Profile** – Avatar, Bio, Follower-System
- 🔔 **Notifications** – Benachrichtigungen für Likes, Kommentare, Follows
- 🚨 **Moderation** – Report-System, Admin-Panel
- 🔍 **SEO** – Server-Side Rendering, Open Graph Meta Tags
- 🇩🇪 **DSGVO** – Impressum, Datenschutzerklärung, Account-Löschung
- 🐳 **Docker** – Ready für Self-Hosting auf IONOS

## Quick Start

### Entwicklung

\`\`\`bash
# 1. Dependencies installieren
npm install

# 2. .env.local anlegen
cp .env.example .env.local
# DATABASE_URL und NEXTAUTH_SECRET anpassen

# 3. Datenbank starten (PostgreSQL benötigt)
docker run -d -e POSTGRES_USER=meshuser -e POSTGRES_PASSWORD=meshpassword -e POSTGRES_DB=projectmesh -p 5432:5432 postgres:16-alpine

# 4. Schema und Seed
npm run db:push
npm run db:seed

# 5. Dev-Server starten
npm run dev
\`\`\`

### Produktions-Deployment mit Docker

\`\`\`bash
# .env Datei erstellen
cp .env.example .env
# Werte anpassen!

# Bauen und starten
docker-compose up -d

# Migrationen
docker-compose run migrate
\`\`\`

## Standard-Accounts (nach Seed)

| Nutzer | E-Mail | Passwort | Rolle |
|--------|--------|---------|-------|
| admin | admin@projectmesh.de | Admin1234! | admin |
| demo_user | demo@projectmesh.de | Demo1234! | user |

## Tech Stack

- **Frontend/Backend**: Next.js 15 (App Router)
- **Sprache**: TypeScript
- **Datenbank**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Docker + docker-compose

## Deployment auf IONOS

1. Server mit Ubuntu 22.04 aufsetzen
2. Docker + Docker Compose installieren
3. Repository klonen
4. `.env` Datei mit Produktionswerten anlegen
5. `docker-compose up -d` ausführen
6. Nginx als Reverse Proxy (Port 80/443 → 3000) konfigurieren
7. SSL-Zertifikat mit Certbot einrichten
