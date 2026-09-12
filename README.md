# Noti

Anonymous notes to names — inspired by [akiwah.lol](https://akiwah.lol/).

Leave a note for someone by first name. Anyone with that name (or who knows someone with that name) can read it. Reply anonymously under each note. No accounts, no DMs — just words left in the open.

**Repository:** [github.com/joqlk/noti](https://github.com/joqlk/noti)

## Features

- **Home feed** — scroll recent anonymous notes from everyone
- **Search by name** — jump to `/to/Wangari` (or any name)
- **Write a note** — recipient name, message, optional alias
- **Replies per note** — expand comments on any note to read or post a reply
- **Admin moderation** — secret-protected `/admin` panel to delete notes and comments
- **No sign-up** — fully anonymous for readers and writers

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite (local) / [Turso](https://turso.tech) (production) |
| ORM | [Prisma 7](https://www.prisma.io) with driver adapters |

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/joqlk/noti.git
cd noti
npm install
npm run db:migrate
npm run db:seed   # optional — adds sample notes
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env` file in the project root:

```env
# Local SQLite database (default for development)
DATABASE_URL="file:./dev.db"

# Admin panel secret — required for /admin moderation
ADMIN_SECRET="your-secret-here"
```

Generate a strong admin secret:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

For production on Vercel with Turso, also set:

```env
TURSO_DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="your-turso-token"
```

When both Turso variables are present, the app uses Turso automatically. Otherwise it falls back to the local SQLite file.

## Usage

| Page | URL | Description |
|------|-----|---------------|
| Home | `/` | Recent notes + search |
| Name | `/to/[name]` | All notes for a specific name |
| Write | `/write` | Leave a new note |
| Admin | `/admin` | Moderate notes and comments (requires secret) |

### Admin moderation

1. Set `ADMIN_SECRET` in your environment
2. Open `/admin` and sign in with that secret
3. Delete any note or comment from the moderation panel

The admin session lasts 7 days via an httpOnly cookie. The `/admin` route is excluded from search engine indexing.

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add the [Turso integration](https://vercel.com/marketplace/tursocloud) from the Vercel marketplace — this provisions `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
4. Add `ADMIN_SECRET` under Project Settings → Environment Variables
5. Apply the database schema to Turso:

```bash
npx vercel env pull .env.production.local --environment=production
npm run db:setup-turso
```

6. Deploy:

```bash
npx vercel deploy --prod
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Run production build locally |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Seed sample notes (skips if data exists) |
| `npm run db:setup-turso` | Apply schema + seed to remote Turso database |

## Customize

Edit `src/lib/constants.ts` to change:

- `APP_NAME` — site title
- `APP_TAGLINE` — subtitle under the logo
- `SAMPLE_NAMES` — name chips on the home page

Global styles live in `src/app/globals.css`.

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Home feed
│   ├── write/page.tsx        # Compose a note
│   ├── to/[name]/page.tsx    # Notes for one name
│   ├── admin/page.tsx        # Moderation panel
│   └── api/                  # REST endpoints
├── components/
│   ├── NoteWithComments.tsx  # Note card + reply thread
│   ├── NoteComments.tsx      # Per-note comment UI
│   └── AdminPanel.tsx        # Admin login + delete actions
└── lib/
    ├── db.ts                 # Prisma client (SQLite or Turso)
    ├── admin.ts              # Admin session helpers
    └── validation.ts         # Input validation
prisma/
├── schema.prisma             # Note + Comment models
└── migrations/               # Database migrations
```

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notes` | List notes (supports `?name=` and `?cursor=`) |
| `POST` | `/api/notes` | Create a note |
| `DELETE` | `/api/notes/[id]` | Delete a note (admin only) |
| `GET` | `/api/comments?noteId=` | List replies for a note |
| `POST` | `/api/comments` | Post a reply on a note |
| `DELETE` | `/api/comments/[id]` | Delete a comment (admin only) |

## License

Private project — all rights reserved unless otherwise specified.
