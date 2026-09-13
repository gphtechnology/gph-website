import { supabase } from "./supabaseClient";

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  registration_url: string | null;
};

export type EventInput = Omit<EventRecord, "id">;

export async function listEventRecords(): Promise<EventRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, event_date, location, registration_url")
    .order("event_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createEventRecord(input: EventInput) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { error } = await supabase.from("events").insert(input);
  if (error) throw error;
}

export async function updateEventRecord(id: string, input: EventInput) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { error } = await supabase.from("events").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteEventRecord(id: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
