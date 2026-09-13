import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { placeholderEvents, type GphEvent } from "../data/events";

type EventRow = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  registration_url: string | null;
  image_url: string | null;
};

function mapRow(row: EventRow): GphEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.event_date,
    location: row.location,
    registrationUrl: row.registration_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

/**
 * Reads from the `events` table (see supabase/schema.sql) so admins can
 * manage announcements from the Supabase dashboard without a code
 * deploy. Falls back to the static placeholder list until Supabase is
 * configured, or if the table is empty/unreachable.
 */
export async function fetchEvents(): Promise<GphEvent[]> {
  if (!isSupabaseConfigured || !supabase) return placeholderEvents;

  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, event_date, location, registration_url, image_url")
    .order("event_date", { ascending: true });

  if (error || !data || data.length === 0) return placeholderEvents;

  return data.map(mapRow);
}

export function useEvents() {
  const [events, setEvents] = useState<GphEvent[]>(placeholderEvents);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    fetchEvents().then((result) => {
      if (!cancelled) {
        setEvents(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { events, loading };
}
