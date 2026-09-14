import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import type { Booking } from "./booking";

export type PendingBooking = Booking & {
  counselor_name: string;
  proof_url: string | null;
};

const PAYMENT_PROOF_BUCKET = "payment-proofs";
const PROOF_URL_TTL_SECONDS = 60 * 60; // 1 hour, plenty for one review session

export async function listAwaitingConfirmation(): Promise<PendingBooking[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("*, counselors(name)")
    .eq("status", "awaiting_confirmation")
    .order("slot_datetime");
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (row) => {
      let proofUrl: string | null = null;
      if (row.payment_proof_path) {
        const { data: signed } = await supabase!.storage
          .from(PAYMENT_PROOF_BUCKET)
          .createSignedUrl(row.payment_proof_path, PROOF_URL_TTL_SECONDS);
        proofUrl = signed?.signedUrl ?? null;
      }
      return {
        ...row,
        counselor_name: row.counselors?.name ?? "-",
        proof_url: proofUrl,
      };
    }),
  );
}

export async function cancelBooking(id: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
}

export type ConfirmPaymentResult = {
  ok: true;
  join_url: string;
  email_sent: boolean;
  email_error: string | null;
};

export async function confirmBookingPayment(
  id: string,
): Promise<ConfirmPaymentResult> {
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
  return data as ConfirmPaymentResult;
}
