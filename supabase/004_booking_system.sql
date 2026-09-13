-- Run this once in the SQL Editor. Adds the counseling booking system:
--   - counselors: public read-only list shown on the booking page
--   - bookings: one row per booking attempt (holding -> awaiting_confirmation
--     -> paid, or expired/cancelled)
--
-- Booking rules enforced here (not just in the frontend):
--   - H+1 only: a slot can't be for today or earlier.
--   - A slot is "held" for 90 seconds once someone starts booking it;
--     nobody else can take it until that hold expires.
--   - pg_advisory_xact_lock serializes concurrent attempts on the same
--     (counselor, slot) pair so two people can't both grab it at once.
--
-- No payment gateway is wired in yet — this assumes a static QRIS image
-- shown during the hold, with the customer self-reporting payment and
-- an admin confirming it manually from /admin (see
-- supabase/functions/confirm-booking-payment).

create table if not exists public.counselors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.counselors enable row level security;

create policy "Anyone can read active counselors"
  on public.counselors for select
  using (active);

insert into public.counselors (name, title) values
  ('Joice Benedicta, S.Psi', 'Founder GPH, Peer Counselor'),
  ('Fitri Mardiyanah, S.Psi', 'Behavioral Therapist'),
  ('Sarah Simatupang, S.Psi', 'Ex-Assistant Psychologist');

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  counselor_id uuid not null references public.counselors(id),
  -- Naive WIB wall-clock, same convention as events.event_date.
  slot_datetime timestamp not null,
  user_name text not null,
  user_email text not null,
  status text not null default 'holding'
    check (status in ('holding', 'awaiting_confirmation', 'paid', 'expired', 'cancelled')),
  held_until timestamptz,
  zoom_join_url text,
  zoom_meeting_id text,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- No policies for anon here on purpose: all public interaction goes
-- through the SECURITY DEFINER functions below, so customer name/email
-- is never directly select-able or insertable from the browser.

create policy "Authenticated users can read bookings"
  on public.bookings for select
  to authenticated
  using (true);

create policy "Authenticated users can update bookings"
  on public.bookings for update
  to authenticated
  using (true)
  with check (true);

-- Public: which slots are already taken for a counselor/date, without
-- exposing any customer's name or email.
create or replace function public.list_taken_slots(p_counselor_id uuid, p_date date)
returns table(slot_datetime timestamp)
language sql
security definer
set search_path = public
as $$
  select b.slot_datetime
  from public.bookings b
  where b.counselor_id = p_counselor_id
    and b.slot_datetime::date = p_date
    and (
      b.status in ('awaiting_confirmation', 'paid')
      or (b.status = 'holding' and b.held_until >= now())
    );
$$;

grant execute on function public.list_taken_slots(uuid, date) to anon, authenticated;

-- Public: start a booking. Holds the slot for 90 seconds.
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
  -- Serialize concurrent attempts on the exact same slot.
  perform pg_advisory_xact_lock(hashtextextended(p_counselor_id::text || p_slot_datetime::text, 0));

  if p_slot_datetime::date < (v_now_wib::date + 1) then
    raise exception 'h1_only';
  end if;

  -- Release any hold on this slot that has expired.
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

-- Public: customer says they've paid. Only valid while their own hold
-- hasn't expired yet; keeps the slot reserved indefinitely after this
-- until an admin confirms or cancels it.
create or replace function public.mark_awaiting_payment_confirmation(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;

  if not found then
    raise exception 'booking_not_found';
  end if;

  if v_booking.status <> 'holding' or v_booking.held_until < now() then
    raise exception 'hold_expired';
  end if;

  update public.bookings
    set status = 'awaiting_confirmation'
    where id = p_booking_id
    returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.mark_awaiting_payment_confirmation(uuid) to anon, authenticated;
