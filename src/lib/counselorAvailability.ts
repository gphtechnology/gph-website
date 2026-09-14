import { supabase } from "./supabaseClient";

export type Profile = {
  role: "admin" | "counselor";
  counselor_id: string | null;
  counselor_name?: string;
};

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("role, counselor_id, counselors(name)")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  // Supabase's untyped client infers the embedded relation as an array
  // even though profiles.counselor_id -> counselors.id is many-to-one.
  const counselor = Array.isArray(data.counselors)
    ? data.counselors[0]
    : data.counselors;
  return {
    role: data.role,
    counselor_id: data.counselor_id,
    counselor_name: counselor?.name,
  };
}

export type AvailabilitySlot = { day_of_week: number; slot_time: string };

export async function listAvailability(
  counselorId: string,
): Promise<AvailabilitySlot[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("counselor_availability")
    .select("day_of_week, slot_time")
    .eq("counselor_id", counselorId);
  if (error) throw error;
  return data ?? [];
}

export async function setAvailability(
  counselorId: string,
  dayOfWeek: number,
  slotTime: string,
  enabled: boolean,
) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  if (enabled) {
    const { error } = await supabase
      .from("counselor_availability")
      .insert({ counselor_id: counselorId, day_of_week: dayOfWeek, slot_time: slotTime });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("counselor_availability")
      .delete()
      .eq("counselor_id", counselorId)
      .eq("day_of_week", dayOfWeek)
      .eq("slot_time", slotTime);
    if (error) throw error;
  }
}
