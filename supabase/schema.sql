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
  -- No timezone: GPH events are always WIB, stored as the wall-clock
  -- date+time typed into the admin form (see 003_add_event_time.sql
  -- for the migration on a database that already ran this file).
  event_date timestamp not null,
  location text not null,
  registration_url text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Anyone can read events"
  on public.events for select
  using (true);

-- Only signed-in admins (via the /admin page, or the Supabase
-- dashboard) can create, edit, or delete events. Create admin
-- accounts under Authentication → Users → Add user (check "Auto
-- Confirm User") — there's no public sign-up.

create policy "Authenticated users can insert events"
  on public.events for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update events"
  on public.events for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete events"
  on public.events for delete
  to authenticated
  using (true);

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
