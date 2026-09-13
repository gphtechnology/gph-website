-- Run this once in the SQL Editor — adds the write policies needed by
-- the new /admin page (schema.sql already ran and only had a public
-- read policy on `events`). Safe to run even though schema.sql already
-- executed; this only adds the three policies below.

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
