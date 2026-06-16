# Cosette Productions — T-Shirt Orders & Campaigns

A full-stack platform for managing custom T-shirt designs, running public order campaigns, and automatically generating dynamically branded order pages, QR codes, flyers, social graphics, and email banners — themed from each artwork’s color palette.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · SQLite (dev) / Postgres (Neon, prod) · Stripe Checkout · `node-vibrant` + `sharp` for palette extraction · `qrcode` for QR codes · server-rendered SVG → PNG for flyers / social / email.

---

## Quick start (local)

```bash
# 1. Install deps
npm install

# 2. Copy env
cp .env.example .env
# (edit .env — at minimum, set SESSION_PASSWORD to a long random string)

# 3. Set up DB + seed sample designs and pricing
npm run setup

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

Default admin login (change in `.env`):
- Email: `admin@cosetteproductions.com`
- Password: `changeMe!`

Visit `/admin/login` to access the dashboard.

---

## Features

### Public
- **Home** (`/`) — Hero, marquee, featured campaigns, services overview.
- **Shop** (`/shop`) — All live campaigns with auto-themed cards.
- **Design order page** (`/shop/[slug]`) — Theming pulled from artwork palette: backgrounds, buttons, accents, QR/flyer all match. Size/color/quantity picker, pickup or shipping, Stripe checkout or manual invoice.
- **Custom request** (`/custom-request`) — Upload artwork, describe vision, pick shirt type + quantity range + deadline.
- **Pricing** (`/pricing`) — Editable rows from the admin pricing manager.
- **Contact + FAQ** (`/contact`).

### Admin
- **Login + iron-session** auth.
- **Dashboard** with KPIs and recent orders/requests.
- **Designs** — create with artwork upload (palette auto-extracted), edit, toggle public/private, delete, regenerate flyer/QR.
- **Clients** — manage the brands/artists/orgs each campaign is for.
- **Orders** — view all, update status, **export CSV**.
- **Custom Requests** — review uploads + descriptions.
- **Pricing** — editable rows, categories: single / bulk / design / extra / package.

### AI-style branding system
When you upload artwork, `node-vibrant` (with a `sharp` quantized fallback) extracts a vibrant 5-color palette: `primary`, `secondary`, `accent`, `background`, `text`. That palette is then used to dynamically theme:

- The public order page (background gradients, buttons, swatch row).
- The QR code (`/api/qr/[id]`) — colors match the campaign.
- The flyer (`/api/flyer/[id]`) — 1080×1620 PNG generated on the fly, gradients, layered graphic accents, QR card, deadline chip, branding bar.
- Social graphic (`/api/social/[id]`) — 1080×1080 themed share image.
- Email banner (`/api/email-graphic/[id]`) — 1200×600 themed banner.

Every campaign automatically gets its own cohesive, vibrant visual identity from a single artwork upload.

### Order flow
- Customer picks size, color, quantity, fills details, chooses pickup or shipping.
- If the campaign has Stripe enabled, they pay online; if manual is enabled, they get an invoiced order.
- Stripe webhook (`/api/webhook/stripe`) marks the order paid on `checkout.session.completed`.

---

## Project structure

```
prisma/
  schema.prisma             # SQLite (dev) — switch to postgres for Neon
  schema.postgres.prisma    # Reference postgres datasource block
  seed.ts                   # Sample admin, clients, designs, pricing
src/
  app/
    layout.tsx · page.tsx · globals.css
    pricing/  custom-request/  shop/[slug]/  contact/
    admin/    designs/  clients/  orders/  requests/  pricing/  login/
    api/
      auth/login            auth/logout
      designs               designs/[id]   designs/[id]/regenerate
      orders                orders/[id]    orders/export
      custom-requests       clients
      pricing               pricing/[id]
      qr/[id]               flyer/[id]
      social/[id]           email-graphic/[id]
      webhook/stripe
  components/  OrderForm.tsx · CustomRequestForm.tsx
  lib/        prisma · auth · stripe · upload · palette · qr · flyer · money
public/
  seed/                     # Sample artwork SVGs used by seed.ts
  uploads/                  # Local upload target (gitignored)
```

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite `file:./dev.db` locally; Postgres URL on Neon. |
| `NEXT_PUBLIC_APP_URL` | yes | Used in Stripe redirects, QR codes, flyer/social URLs. |
| `SESSION_PASSWORD` | yes | 32+ char secret for iron-session. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seed only | Used by `prisma/seed.ts` to create the initial admin. |
| `STRIPE_SECRET_KEY` | optional | Enables Stripe Checkout. If empty, orders default to manual invoice. |
| `STRIPE_WEBHOOK_SECRET` | optional | Required to verify the Stripe webhook. |
| `BLOB_READ_WRITE_TOKEN` | prod | Required for uploads on Vercel (filesystem is read-only). Auto-injected when you create a Vercel Blob store. |
| `UPLOAD_DIR` | optional | Local upload target. Defaults to `public/uploads`. |

---

## Deploying to Vercel + Neon Postgres

The codebase is built to deploy cleanly to Vercel with a Neon Postgres database and Vercel Blob for uploads.

### 1. Provision a Neon database

1. Create a project at https://neon.tech and copy the connection string. Use the **pooled** URL (`...-pooler.../neondb?sslmode=require`) — it’s safe for serverless.
2. In your Vercel project Settings → Environment Variables, set `DATABASE_URL` to that connection string.

### 2. Switch Prisma to Postgres

Open `prisma/schema.prisma` and change the datasource block:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

(See `prisma/schema.postgres.prisma` for a reference.) Then run migrations against Neon from your local machine **once**:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy   # or db push
DATABASE_URL="postgresql://..." npm run prisma:seed
```

### 3. Add a Vercel Blob store

In your Vercel project: Storage → Create → Blob → connect. Vercel will inject `BLOB_READ_WRITE_TOKEN` automatically. The `saveUploadedFile()` helper in `src/lib/upload.ts` auto-detects that token and writes uploads to Blob instead of the filesystem.

### 4. Configure Stripe (optional but recommended)

- Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to Vercel env vars.
- Create a webhook endpoint at `https://YOURDOMAIN.vercel.app/api/webhook/stripe` listening for `checkout.session.completed`, and copy its signing secret into `STRIPE_WEBHOOK_SECRET`.

### 5. Set the public app URL

Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://cosetteproductions.com`). It’s embedded in QR codes, flyer downloads, and Stripe redirect URLs.

### 6. Deploy

```bash
vercel
```

The `vercel.json` build command (`prisma generate && next build`) ensures Prisma client is generated for the Vercel runtime.

---

## Notes & extension points

- **Flyer / QR / social / email images** are generated on demand via API routes and cached with `Cache-Control: max-age=300`. To persist them (e.g. for downstream use), wrap `renderFlyerPng()` / `renderQrPng()` with a write to Vercel Blob and cache the URL on the `Flyer` / `QRCode` rows.
- **Tax / shipping rates** are flat ($8) in the order calculator — wire in a proper carrier / tax layer when needed.
- **Stripe Tax / shipping options** can be added on `stripe.checkout.sessions.create({...})` in `src/app/api/orders/route.ts`.
- **Variants edit UI** is intentionally minimal — the data model and admin design page expose them, and adding inline edit is a quick win.

---

## NPM scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next dev server. |
| `npm run build` | Production build. |
| `npm run start` | Run production build. |
| `npm run prisma:generate` | Generate Prisma client. |
| `npm run prisma:push` | Push schema to DB without migrations. |
| `npm run prisma:migrate` | Create + run a migration. |
| `npm run prisma:seed` | Run `prisma/seed.ts`. |
| `npm run setup` | `generate → db push → seed` — one-shot local setup. |

---

© Cosette Productions LLC. Built bold.
