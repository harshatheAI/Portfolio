# 🐻 Brother Bear Moving

A complete, customer-friendly website for a local moving company that automates the
entire journey — from **customer acquisition** to **instant quoting**, **online booking &
payment**, and **real-time move tracking**.

> Built with Next.js 16 (App Router), Prisma 7 + SQLite, NextAuth v5, and Tailwind v4.

---

## What it does

| Stage | Feature |
| --- | --- |
| **Acquire** | Conversion-focused marketing site — hero, services, transparent pricing, reviews, service areas, FAQ. |
| **Quote instantly** | A 4-step wizard where the customer describes items and **uploads photos**. An AI vision analyzer (Claude) or a deterministic heuristic estimates volume, crew size and hours, then the pricing engine returns an **itemized quote with three service tiers** in seconds. |
| **Book & pay** | Pick a date + arrival window from a live **availability engine**, create an account, and pay a **refundable deposit** (mock checkout) to lock it in. A crew is auto-assigned. |
| **Track** | A public **live tracking** page with a route map, ETA, crew details, and a stage timeline (Confirmed → Crew assigned → En route → Loading → In transit → Unloading → Complete). |
| **Manage** | Customer **dashboard** (upcoming/past moves, saved quotes) and an **admin operations** panel (dispatch board + editable **pricing guidelines**). |

## The pricing guidelines are editable

Everything the quote engine charges — base fee, labor/mile/volume rates, surcharges,
add-ons, deposit %, and tier multipliers — lives in a `PricingConfig` record and is
editable from **`/admin`**. New quotes recalculate against it immediately. (Defaults live
in `src/lib/pricing.ts` and are used before the DB is seeded.)

## Works with zero secrets

- **No `ANTHROPIC_API_KEY`?** The quote analyzer falls back to a deterministic heuristic
  estimator, so the full flow works offline. Add a key to enable real photo analysis.
- **Payments** use a clearly-labeled demo checkout (no real charge). A card starting with
  `0000` simulates a decline.
- **Tracking** simulates crew progress; wire a GPS feed into `src/lib/tracking.ts` for real data.

---

## Getting started

```bash
npm install
cp .env.example .env          # defaults work out of the box
npx prisma migrate dev        # create the SQLite database
npm run db:seed               # load demo data
npm run dev                   # http://localhost:3000
```

### Demo accounts (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@brotherbearmoving.com` | `movingbears` |
| Customer | `jordan@example.com` | `movingbears` |

The seed also creates a move that's **in transit** so you can watch live tracking right away
(the reference is printed at the end of `npm run db:seed`).

## Deploy to Railway

This repo is container-ready for [Railway](https://railway.com), which keeps the SQLite
setup as-is on a persistent volume — no database migration needed.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new)

**One-time setup (~3 minutes):**

1. **New Project → Deploy from GitHub repo** → pick this repository and the
   `claude/movers-website-redesign-uyqv7z` branch. Railway reads `railway.json` and
   builds the `Dockerfile` automatically.
2. **Add a Volume** to the service (service → **Variables/Settings → Volumes → New Volume**)
   and set the **mount path to `/data`**. This is where the SQLite database lives so your
   data survives redeploys.
3. **Set environment variables** (service → **Variables**):
   | Variable | Value |
   | --- | --- |
   | `AUTH_SECRET` | a random string — `openssl rand -base64 32` |
   | `NEXTAUTH_SECRET` | the same value as `AUTH_SECRET` |
   | `DATABASE_URL` | `file:/data/prod.db` |
   | `ANTHROPIC_API_KEY` | *(optional)* enables AI photo estimates |

   `PORT` is provided by Railway automatically — don't set it.
4. **Generate a domain** (service → **Settings → Networking → Generate Domain**) to get
   your public `https://…up.railway.app` URL.

On first boot the container runs `prisma migrate deploy` and seeds demo data (only if the
database is empty — redeploys never wipe it). Sign in with the demo admin account above to
tune pricing, or register as a new customer and book a move.

> **Scaling note:** SQLite on one volume means a single instance. If you need multiple
> replicas or autoscaling, switch Prisma's datasource to Postgres (Railway offers a managed
> Postgres plugin) — the schema is portable.

To run the production image locally:

```bash
docker build -t brother-bear .
docker run -p 3000:3000 -e AUTH_SECRET=dev -e NEXTAUTH_SECRET=dev \
  -e DATABASE_URL="file:/data/prod.db" -v "$PWD/data:/data" brother-bear
```

## Project layout

```
src/
  app/
    (marketing)/        Home, quote wizard, quote result, booking, confirmation, tracking
    (app)/              Authenticated dashboard + admin
    (auth)/             Sign in / sign up
    api/                quote · availability · bookings · tracking · admin/pricing · auth
  components/           ui kit, site chrome, quote/booking/tracking/admin features
  lib/
    pricing.ts          pricing engine + default guidelines
    ai/quote.ts         Claude vision analysis + heuristic fallback
    availability.ts     bookable days & arrival windows
    tracking.ts         move lifecycle + simulated progress
    brand.ts            company profile (name, phone, service areas, add-ons)
prisma/
    schema.prisma       User · Quote · Booking · Payment · Crew · TrackingEvent · PricingConfig
    seed.ts             demo data
```

## Making it the real company's site

1. Update `src/lib/brand.ts` with the real name, phone, email, address, license and service areas.
2. Sign in as an admin and tune the pricing guidelines at `/admin`.
3. Add `ANTHROPIC_API_KEY` for AI photo estimates, swap the mock checkout for a real
   payment provider, and connect a GPS feed for live tracking.
