# Noti

Anonymous notes to names — inspired by [akiwah.lol](https://akiwah.lol/).

Leave a note for someone by name. Anyone with that name (or who knows someone with that name) can read it. No accounts, no DMs — just words left in the open.

## Run locally

```bash
npm install
npm run db:migrate
npm run db:seed   # optional sample notes
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Home feed** — recent anonymous notes from everyone
- **Search by name** — e.g. `/to/Wangari`
- **Write a note** — recipient name, message, optional alias
- **SQLite database** — no external DB required for development

## Admin moderation

Set `ADMIN_SECRET` in your environment, then open `/admin` and sign in with that secret. You can delete any note from there.

```bash
# generate a secret
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

On Vercel: Project Settings → Environment Variables → add `ADMIN_SECRET`, then redeploy.

## Customize

Edit `src/lib/constants.ts` to change the app name, tagline, and sample name chips.

## Deploy

Works on Vercel, Railway, or any Node host. For production, consider PostgreSQL instead of SQLite and set `DATABASE_URL` accordingly.
