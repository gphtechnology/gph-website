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
  payment_proof_path: string | null;
};

// Fixed daily template — which of these are actually bookable for a
// given counselor/date comes from their weekly availability (see
// listOpenSlots), set by the counselor at /counselor.
export const DAILY_SLOT_TIMES = [
  "08:00",
  "10:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
];

export const HOLD_SECONDS = 3 * 60;

export const SESSION_PRICE_IDR = 30000;

const PAYMENT_PROOF_BUCKET = "payment-proofs";

// PLACEHOLDER — replace with GPH's real bank account before going live.
export const BANK_TRANSFER_INFO = {
  bankName: "Bank Contoh",
  accountNumber: "1234567890",
  accountHolder: "Gigajo Psychological House",
};

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

/** Slots the counselor has marked available for this date that aren't
 * already taken/held by someone else. */
export async function listOpenSlots(
  counselorId: string,
  date: string,
): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("list_open_slots", {
    p_counselor_id: counselorId,
    p_date: date,
  });
  if (error) throw error;
  return (data ?? []).map((row: { slot_time: string }) => row.slot_time);
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

export async function uploadPaymentProof(
  bookingId: string,
  file: File,
): Promise<string> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const path = `${bookingId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(path, file);
  if (error) throw error;
  return path;
}

export async function markAwaitingConfirmation(
  bookingId: string,
  paymentProofPath: string,
): Promise<Booking> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await supabase.rpc(
    "mark_awaiting_payment_confirmation",
    { p_booking_id: bookingId, p_payment_proof_path: paymentProofPath },
  );
  if (error) throw error;
  return data as Booking;
}
