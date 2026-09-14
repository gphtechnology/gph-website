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
  pages/             Route-level pages (Home, BookCounseling, Events, Admin)
  data/              Placeholder content (events fallback)
  lib/supabaseClient.ts  Supabase client, no-ops until env vars are set
  lib/auth.ts            Admin session hook (Supabase Auth)
  lib/events.ts          Public event reads + date formatting
  lib/adminEvents.ts     Admin CRUD for events
  lib/booking.ts         Public booking flow (slots, hold, confirm)
  lib/adminBookings.ts   Admin booking confirmation/cancellation
  lib/adminCounselors.ts Admin: create counselor accounts
  lib/i18n/              ID/EN translations + language context

supabase/
  schema.sql, 00N_*.sql  Migrations, run in order in the SQL Editor
  functions/             Edge Functions (Deno), deployed via Supabase CLI
```

## Language (ID/EN)

The public-facing pages (everything except `/admin`, which is an
internal tool for the GPH team) support Indonesian and English via a
lightweight custom context — no i18n library, just plain dictionaries:

- `src/lib/i18n/id.ts` / `en.ts` — the two translation dictionaries.
  `en.ts` is typed as `typeof id`, so TypeScript catches a missing key
  in either language at build time.
- `src/lib/i18n/context.tsx` — `LanguageProvider` (wraps the app in
  `main.tsx`) and the `useLanguage()` hook, which returns
  `{ language, setLanguage, t }`. `t` is the current dictionary.
- The switcher lives in the navbar; the choice persists in
  `localStorage` (defaults to Indonesian).

To add a new piece of text: add the key to `id.ts` first, then `en.ts`
— TypeScript will error if `en.ts` is missing anything `id.ts` has, so
the two can't drift out of sync silently.

## Roadmap / feature flags already scaffolded

- **Landing page & company profile** — done (this repo).
- **Book Counseling** (`/book-counseling`) — done, see
  [Booking counseling system](#booking-counseling-system) below.
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
2. Run `supabase/003_add_event_time.sql` — changes `event_date` from
   date-only to date+time (naive, always WIB — see the file's
   comment) so events can show a start time, not just a day.
3. Create admin accounts under **Authentication → Users → Add user**.
   Check **"Auto Confirm User"** so they can log in immediately. There
   is no public sign-up — accounts are only created this way.
4. Log in at `/admin` with that email/password.

There's intentionally no link to `/admin` in the site's nav — admins
just go there directly.

## Booking counseling system

`/book-counseling` lets a customer pick a counselor, a date (**H+1
only** — today or same-day booking is blocked, enforced in the
database, not just the UI), and a time slot from a fixed daily
template (`DAILY_SLOT_TIMES` in `src/lib/booking.ts`). Picking a slot
**holds it for 90 seconds** (`HOLD_SECONDS`) while a static QRIS image
is shown; nobody else can grab that slot until the hold expires. This
is all enforced by the three Postgres functions in
`supabase/004_booking_system.sql` (`request_booking_hold`,
`mark_awaiting_payment_confirmation`, `list_taken_slots`), which use
`pg_advisory_xact_lock` so two people can't win the same slot in a
race. No cron job is needed — an expired hold is cleaned up lazily,
the next time anyone tries to book that exact slot again.

**No payment gateway is wired in.** Getting real, API-driven QRIS
requires a licensed payment aggregator (Xendit, Midtrans, etc.), which
needs business verification — a blocker for now. Instead:

1. Customer scans a **static QRIS image** you provide (from a bank's
   merchant app like BRI Merchant/Merchant BCA, or GoBiz/DANA Bisnis)
   and transfers manually.
2. Customer clicks "Saya Sudah Bayar" → booking status becomes
   `awaiting_confirmation` (slot stays reserved).
3. An admin checks the actual transfer landed, then clicks **"Konfirmasi
   Pembayaran"** on `/admin` — this calls the
   `confirm-booking-payment` Edge Function, which creates the Zoom
   meeting and emails the join link, fully automatically.

This can be swapped for a real payment webhook later without changing
the booking/hold logic — only step 2-3 would become automatic.

### Setup

1. Run `supabase/004_booking_system.sql` in the SQL Editor — creates
   `counselors` (seeded with 3 example counselors — edit via Table
   Editor) and `bookings`, plus the three functions above.
2. Add `public/qris.jpeg` — your static QRIS image (from whichever
   bank or e-wallet merchant account you register). The booking page
   references it directly; if the file is missing it just hides the
   broken image rather than crashing.
3. Deploy the Edge Function (needs the
   [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   supabase link --project-ref botuofmfczbeyolcoeuc
   supabase functions deploy confirm-booking-payment
   ```
   Leave JWT verification **on** (the default) — that's what restricts
   this function to logged-in admins.
4. Set the function's secrets (never committed to git):
   ```bash
   supabase secrets set \
     ZOOM_ACCOUNT_ID=... \
     ZOOM_CLIENT_ID=... \
     ZOOM_CLIENT_SECRET=... \
     ZOOM_HOST_EMAIL=you@example.com \
     RESEND_API_KEY=... \
     RESEND_FROM_EMAIL="GPH <noreply@yourdomain.com>"
   ```
   - Zoom credentials come from a **Server-to-Server OAuth** app in the
     [Zoom Marketplace](https://marketplace.zoom.us/) with the
     `meeting:write:meeting:admin` scope. `ZOOM_HOST_EMAIL` is the
     email of the licensed Zoom user (on that same account) who will
     host the generated meetings.
   - [Resend](https://resend.com) sends the confirmation email;
     `RESEND_FROM_EMAIL` needs a domain verified in their dashboard.
   - **If any of these credentials were ever shared somewhere
     unsecured (a screenshot, a chat, etc.), regenerate them before
     going live** — treat a shared secret as compromised.

### Counselor availability (`/counselor`)

Each counselor logs in separately from `/admin` to set which weekday +
time slots (from the fixed `DAILY_SLOT_TIMES` template — currently
08:00, 10:00, 14:00, 16:00, 18:00, 20:00) they're available for. The
booking page only ever shows a customer slots the counselor has
actually turned on for that weekday, checked against what's already
taken.

1. Run `supabase/005_counselor_availability.sql` — adds `profiles`
   (role + counselor link), `counselor_availability`, and the
   `list_open_slots()` function the booking page reads from.
   **This also tightens `events`/`bookings` RLS to admin-only** — a
   necessary change now that counselor accounts share the same
   Supabase Auth pool as admins (previously "logged in" and "admin"
   were the same thing). Existing admin accounts need a `profiles` row
   too after this runs (`role = 'admin'`, `counselor_id` left null) —
   without one, `is_admin()` returns false and they lose access to
   managing events/bookings:
   ```sql
   insert into public.profiles (id, role) values ('<admin-user-uid>', 'admin');
   ```
   (find the UID under Authentication → Users).
2. Run `supabase/006_admin_read_profiles.sql` — lets an admin see
   which counselors already have a login, so `/admin` knows who still
   needs one (covers the 3 seed counselors from
   `004_booking_system.sql`, which have no login yet).
3. Deploy the `create-counselor` Edge Function the same way as
   `confirm-booking-payment` (dashboard editor or CLI) — same secrets,
   no new ones needed.
4. From then on, `/admin` handles both cases without the SQL Editor:
   - **New counselor**: the "Tambah Konselor Baru" form creates their
     `counselors` row, Supabase Auth login, and `profiles` row in one
     call.
   - **Existing counselor with no login yet**: their row in the list
     shows a **"Buat Login"** button — fill in email + password and
     it links a new login to that existing `counselors` row instead
     of creating a duplicate.
   Either way it shows a temporary password to hand the counselor, who
   logs in at `/counselor` and checks off which slots they work each
   weekday.

   (The old manual path — Authentication → Users → Add user, then a
   matching `profiles` row by hand — still works if you ever need it,
   e.g. bypassing the form for scripted bulk setup.)

## Brand reference

- Colors: cream `#F7F2ED`, peach `#E8BFAF`, blue `#70b2cf` (defined as
  Tailwind tokens in `src/index.css`).
- Fonts: **Codec Pro** for the logo/display headings (licensed —
  add the font files under `src/assets/fonts` and uncomment the
  `@font-face` in `src/index.css` when available), **DM Sans** for
  body copy. Until Codec Pro is added, headings fall back to **Exo
  2** — the closest free match found (82% similarity per a font
  comparison tool) among Google Fonts.

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
