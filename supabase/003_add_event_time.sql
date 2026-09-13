-- Run this once in the SQL Editor to store a time along with the
-- event date (previously `event_date` was date-only).
--
-- Uses `timestamp` (no timezone) rather than `timestamptz`: GPH events
-- are always WIB, so this just stores the wall-clock date+time as
-- typed in the admin form, with no timezone conversion to worry about
-- when displaying it back on the site.

alter table public.events
  alter column event_date type timestamp using event_date::timestamp;
