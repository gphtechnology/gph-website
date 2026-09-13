import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import type { Booking } from "./booking";

export type PendingBooking = Booking & { counselor_name: string };

export async function listAwaitingConfirmation(): Promise<PendingBooking[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("*, counselors(name)")
    .eq("status", "awaiting_confirmation")
    .order("slot_datetime");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    counselor_name: row.counselors?.name ?? "-",
  }));
}

export async function cancelBooking(id: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
}

export async function confirmBookingPayment(id: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await supabase.functions.invoke(
    "confirm-booking-payment",
    { body: { booking_id: id } },
  );
  if (error) {
    // FunctionsHttpError's .message is just "non-2xx status code" — the
    // function's actual { error: "..." } body is on .context (a Response).
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      throw new Error(body?.error ?? error.message);
    }
    throw error;
  }
  return data;
}
