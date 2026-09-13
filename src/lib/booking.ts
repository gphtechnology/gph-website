import { supabase } from "./supabaseClient";

export type Counselor = {
  id: string;
  name: string;
  title: string;
};

export type BookingStatus =
  | "holding"
  | "awaiting_confirmation"
  | "paid"
  | "expired"
  | "cancelled";

export type Booking = {
  id: string;
  counselor_id: string;
  slot_datetime: string;
  user_name: string;
  user_email: string;
  status: BookingStatus;
  held_until: string | null;
  zoom_join_url: string | null;
};

// Fixed daily template for now — move to a real per-counselor
// availability table later if schedules need to differ.
export const DAILY_SLOT_TIMES = ["10:00", "13:00", "16:00", "19:00"];

export const HOLD_SECONDS = 90;

export const SESSION_PRICE_IDR = 30000;

/** Earliest bookable date (WIB), as YYYY-MM-DD — bookings are H+1 only. */
export function getMinBookingDate(): string {
  const wibNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
  wibNow.setDate(wibNow.getDate() + 1);
  return wibNow.toISOString().slice(0, 10);
}

export async function listCounselors(): Promise<Counselor[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("counselors")
    .select("id, name, title")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function listTakenSlots(
  counselorId: string,
  date: string,
): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("list_taken_slots", {
    p_counselor_id: counselorId,
    p_date: date,
  });
  if (error) throw error;
  return (data ?? []).map((row: { slot_datetime: string }) =>
    row.slot_datetime.slice(11, 16),
  );
}

export async function requestBookingHold(input: {
  counselorId: string;
  slotDatetime: string;
  userName: string;
  userEmail: string;
}): Promise<Booking> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await supabase.rpc("request_booking_hold", {
    p_counselor_id: input.counselorId,
    p_slot_datetime: input.slotDatetime,
    p_user_name: input.userName,
    p_user_email: input.userEmail,
  });
  if (error) throw error;
  return data as Booking;
}

export async function markAwaitingConfirmation(
  bookingId: string,
): Promise<Booking> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await supabase.rpc(
    "mark_awaiting_payment_confirmation",
    { p_booking_id: bookingId },
  );
  if (error) throw error;
  return data as Booking;
}
