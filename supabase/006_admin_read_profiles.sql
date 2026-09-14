-- Run this once in the SQL Editor. Lets an admin see which counselors
-- already have a login account (profiles row), so /admin can offer
-- "Buat Login" only for the ones that don't yet — needed for the 3
-- seed counselors from 004_booking_system.sql, which were inserted
-- directly with no matching auth/profiles row.

create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (is_admin());
