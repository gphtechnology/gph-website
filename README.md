# Gigajo Psychological House (GPH)

Landing page & company profile site for **Gigajo Psychological House**
(gigajopshhouse.com) — a trademark of [Gigajo](https://gigajo.com).

Built with **Vite + React + TypeScript + Tailwind CSS v4**, with
`react-router-dom` for routing, `framer-motion` for animation, and a
`@supabase/supabase-js` client pre-wired for the upcoming counseling
booking and admin-managed event announcement features.

## Getting started (WSL Ubuntu)

Requires Node.js 20+ (project was built/tested on Node 22).

```bash
npm install
npm run dev
```

This starts Vite's dev server (default: http://localhost:5173) with
hot reload.

Other scripts:

```bash
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
```

## Project structure

```
src/
  components/        Navbar, Footer, shared UI (Logo, Container)
  components/sections/  Landing page sections (Hero, About, Services, ...)
  pages/             Route-level pages (Home, BookCounseling, Events)
  data/              Placeholder content (events) — swap for Supabase reads
  lib/supabaseClient.ts  Supabase client, no-ops until env vars are set
```

## Roadmap / feature flags already scaffolded

- **Landing page & company profile** — done (this repo).
- **Book Counseling** (`/book-counseling`) — currently a "coming soon"
  lead-capture form. Once ready, point it at a `counseling_requests`
  table in Supabase (the insert call is already written in
  `src/pages/BookCounseling.tsx`, it just needs the env vars below).
- **Event announcements** (`/events`, plus a preview on the homepage)
  — currently reads static data from `src/data/events.ts`. Swap that
  for a Supabase query against an `events` table so admins can manage
  announcements without a code deploy.

## Connecting Supabase

Project: https://supabase.com/dashboard/project/botuofmfczbeyolcoeuc

1. Run `supabase/schema.sql` once in that project's **SQL Editor** — it
   creates the `events` table (public read, for announcements) and the
   `counseling_requests` table (public insert only, for the booking
   lead form), both with row-level security enabled.
2. Copy `.env.example` to `.env.local` and fill in:
   ```
   VITE_SUPABASE_URL=https://botuofmfczbeyolcoeuc.supabase.co
   VITE_SUPABASE_ANON_KEY=...   # Settings → API → Project API keys → anon/public
   ```
   Never use the `service_role` key here — the anon key is the only
   one meant to ship in frontend code.
3. `.env.local` is gitignored — for production builds via GitHub
   Actions, add the same two values as repository secrets
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); the deploy workflow
   already passes them through.
4. The site works fine as a static landing page with these unset —
   `isSupabaseConfigured` guards every place that touches the client,
   and `src/lib/events.ts` falls back to the placeholder list in
   `src/data/events.ts` until the `events` table has rows.

Once connected, managing event announcements is just adding rows to
the `events` table from the Supabase dashboard's Table Editor — no
code changes or redeploy needed. Counseling submissions land in
`counseling_requests` and are visible from the same dashboard.

### Admin page (`/admin`)

A lighter-weight alternative to the Table Editor: `/admin` is a
login-gated page (Supabase Auth) where the GPH team can add, edit, and
delete events without touching Supabase directly.

1. Run `supabase/002_admin_write_policies.sql` once in the SQL Editor
   — it adds the insert/update/delete policies the admin page needs
   (only `schema.sql`'s public *read* policy existed before).
2. Create admin accounts under **Authentication → Users → Add user**.
   Check **"Auto Confirm User"** so they can log in immediately. There
   is no public sign-up — accounts are only created this way.
3. Log in at `/admin` with that email/password.

There's intentionally no link to `/admin` in the site's nav — admins
just go there directly.

## Brand reference

- Colors: cream `#F7F2ED`, peach `#E8BFAF`, blue `#70b2cf` (defined as
  Tailwind tokens in `src/index.css`).
- Fonts: **Codec Pro** for the logo/display headings (licensed —
  add the font files under `src/assets/fonts` and uncomment the
  `@font-face` in `src/index.css` when available), **DM Sans** for
  body copy. Until Codec Pro is added, headings fall back to **Plus
  Jakarta Sans** (free, similar geometric feel).

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds the site and publishes it via
GitHub's official Pages actions on every push to `main`.

One-time setup:

1. In the repo, go to **Settings → Pages** and set **Source** to
   "GitHub Actions".
2. If you're pointing a custom domain here (e.g. from Hostinger) at
   this GitHub Pages site:
   - Add a `CNAME` file to `public/` containing just the domain, e.g.
     `gigajopshhouse.com` — Vite copies everything in `public/` into
     the build output, so it ends up in the published site
     automatically.
   - At Hostinger, point the domain's DNS at GitHub Pages (an `A`
     record set to GitHub's Pages IPs, or a `CNAME` record to
     `<your-github-username>.github.io` for a subdomain).
   - Re-enter the domain under **Settings → Pages → Custom domain** in
     GitHub so it issues an HTTPS certificate for it.
3. `vite.config.ts`'s `base` (and `main.tsx`'s router `basename`,
   which just reads `import.meta.env.BASE_URL`) is currently set to
   `'/gph-website/'` so the site previews correctly at the default
   `https://gphtechnology.github.io/gph-website/` URL. Once the
   Hostinger custom domain is connected, change `base` back to `'/'`
   (a custom domain serves from the root) and set `pathSegmentsToKeep`
   back to `0` in `public/404.html`.

Client-side routing (`/book-counseling`, `/events`) works on GitHub
Pages via the standard SPA fallback trick — see `public/404.html` and
the small inline script at the top of `index.html`'s `<body>`.
