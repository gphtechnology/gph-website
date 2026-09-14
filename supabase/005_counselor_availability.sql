-- Run this once in the SQL Editor. Adds:
--   - profiles: links a Supabase Auth user to a role ('admin' or
--     'counselor') and, for counselors, to their counselors row.
--   - counselor_availability: which weekday + slot_time combinations
--     each counselor works (a recurring weekly pattern, not per-date).
--   - list_open_slots(): what's actually bookable for a counselor on a
--     given date (their weekly availability minus already-taken slots).
--
-- IMPORTANT — security change: until now, "to authenticated" on events
-- and bookings effectively meant "any logged-in admin", because admins
-- were the only accounts that could log in. Now that counselors also
-- get Supabase Auth accounts, those policies are tightened to require
-- is_admin() specifically, so a counselor account can only touch its
-- own availability — not events or other people's bookings.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'counselor')),
  counselor_id uuid references public.counselors(id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.my_counselor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select counselor_id from public.profiles
  where id = auth.uid() and role = 'counselor';
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_counselor_id() to authenticated;

-- Tighten events/bookings policies to admin-only ---------------------

drop policy if exists "Authenticated users can insert events" on public.events;
drop policy if exists "Authenticated users can update events" on public.events;
drop policy if exists "Authenticated users can delete events" on public.events;

create policy "Admins can insert events"
  on public.events for insert to authenticated with check (is_admin());

create policy "Admins can update events"
  on public.events for update to authenticated
  using (is_admin()) with check (is_admin());

create policy "Admins can delete events"
  on public.events for delete to authenticated using (is_admin());

drop policy if exists "Authenticated users can read bookings" on public.bookings;
drop policy if exists "Authenticated users can update bookings" on public.bookings;

create policy "Admins can read bookings"
  on public.bookings for select to authenticated using (is_admin());

create policy "Admins can update bookings"
  on public.bookings for update to authenticated
  using (is_admin()) with check (is_admin());

-- Counselor availability ---------------------------------------------

create table if not exists public.counselor_availability (
  id uuid primary key default gen_random_uuid(),
  counselor_id uuid not null references public.counselors(id) on delete cascade,
  -- 0 = Sunday ... 6 = Saturday, matching JS Date#getDay() and
  -- Postgres's extract(dow from ...).
  day_of_week smallint not null check (day_of_week between 0 and 6),
  -- "HH:MI" 24-hour, e.g. "08:00" — one of the fixed daily slot times.
  slot_time text not null,
  unique (counselor_id, day_of_week, slot_time)
);

alter table public.counselor_availability enable row level security;

create policy "Anyone can read counselor availability"
  on public.counselor_availability for select
  using (true);

create policy "Counselors manage their own availability"
  on public.counselor_availability for all
  to authenticated
  using (is_admin() or counselor_id = my_counselor_id())
  with check (is_admin() or counselor_id = my_counselor_id());

-- Redefine request_booking_hold to also reject a slot the counselor
-- hasn't marked available for that weekday (defense in depth beyond
-- the frontend only ever offering open slots).
create or replace function public.request_booking_hold(
  p_counselor_id uuid,
  p_slot_datetime timestamp,
  p_user_name text,
  p_user_email text
) returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now_wib timestamp := (now() at time zone 'Asia/Jakarta');
  v_booking public.bookings;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_counselor_id::text || p_slot_datetime::text, 0));

  if p_slot_datetime::date < (v_now_wib::date + 1) then
    raise exception 'h1_only';
  end if;

  if not exists (
    select 1 from public.counselor_availability
    where counselor_id = p_counselor_id
      and day_of_week = extract(dow from p_slot_datetime::date)::smallint
      and slot_time = to_char(p_slot_datetime, 'HH24:MI')
  ) then
    raise exception 'slot_not_available';
  end if;

  update public.bookings
    set status = 'expired'
    where counselor_id = p_counselor_id
      and slot_datetime = p_slot_datetime
      and status = 'holding'
      and held_until < now();

  if exists (
    select 1 from public.bookings
    where counselor_id = p_counselor_id
      and slot_datetime = p_slot_datetime
      and status in ('holding', 'awaiting_confirmation', 'paid')
  ) then
    raise exception 'slot_taken';
  end if;

  insert into public.bookings (counselor_id, slot_datetime, user_name, user_email, status, held_until)
  values (p_counselor_id, p_slot_datetime, p_user_name, p_user_email, 'holding', now() + interval '90 seconds')
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.request_booking_hold(uuid, timestamp, text, text) to anon, authenticated;

-- Public: which slots are actually bookable for a counselor on a date
-- (their weekly availability, minus anything already taken/held).
create or replace function public.list_open_slots(p_counselor_id uuid, p_date date)
returns table(slot_time text)
language sql
stable
security definer
set search_path = public
as $$
  select ca.slot_time
  from public.counselor_availability ca
  where ca.counselor_id = p_counselor_id
    and ca.day_of_week = extract(dow from p_date)::smallint
    and not exists (
      select 1 from public.bookings b
      where b.counselor_id = p_counselor_id
        and b.slot_datetime = (p_date::timestamp + ca.slot_time::time)
        and (
          b.status in ('awaiting_confirmation', 'paid')
          or (b.status = 'holding' and b.held_until >= now())
        )
    )
  order by ca.slot_time;
$$;

grant execute on function public.list_open_slots(uuid, date) to anon, authenticated;
