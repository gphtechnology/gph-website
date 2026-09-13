-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- for https://botuofmfczbeyolcoeuc.supabase.co
--
-- Sets up the two tables the site needs:
--   - events: admin-managed event announcements (public read-only)
--   - counseling_requests: leads from the "Book Counseling" page
--     (public can insert, only an authenticated admin can read)

create extension if not exists "pgcrypto";

-- Events -----------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_date date not null,
  location text not null,
  registration_url text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Anyone can read events"
  on public.events for select
  using (true);

-- Writing events (creating/editing announcements) is left to
-- authenticated admins via the Supabase dashboard or Table Editor for
-- now — add an "authenticated write" policy here once an admin login
-- flow exists in the app.

-- Counseling requests ------------------------------------------------

create table if not exists public.counseling_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.counseling_requests enable row level security;

create policy "Anyone can submit a counseling request"
  on public.counseling_requests for insert
  with check (true);

-- No select policy for anon/public: submissions are only readable
-- from the Supabase dashboard (or a future admin panel using a
-- service role / authenticated policy).
