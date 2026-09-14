-- Run this once in the SQL Editor. Changes:
--   - Hold duration: 90 seconds -> 3 minutes.
--   - Customers upload a payment proof screenshot (instead of just
--     self-reporting "sudah bayar") to a private Storage bucket, so
--     admin can actually see it before confirming.
--
-- The bucket is private: customers (anon) can only upload, never list
-- or read back — admin (is_admin()) is the only one who can read, via
-- a signed URL generated from /admin.

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

create policy "Anyone can upload a payment proof"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'payment-proofs');

create policy "Admins can read payment proofs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment-proofs' and is_admin());

alter table public.bookings
  add column if not exists payment_proof_path text;

-- Redefine with the new 3-minute hold (same signature, so existing
-- grants carry over).
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
  values (p_counselor_id, p_slot_datetime, p_user_name, p_user_email, 'holding', now() + interval '3 minutes')
  returning * into v_booking;

  return v_booking;
end;
$$;

-- Signature changes (adds the proof path), so drop the old one first.
drop function if exists public.mark_awaiting_payment_confirmation(uuid);

create or replace function public.mark_awaiting_payment_confirmation(
  p_booking_id uuid,
  p_payment_proof_path text
) returns public.bookings
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
    set status = 'awaiting_confirmation',
        payment_proof_path = p_payment_proof_path
    where id = p_booking_id
    returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.mark_awaiting_payment_confirmation(uuid, text) to anon, authenticated;
