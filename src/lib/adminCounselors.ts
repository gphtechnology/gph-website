import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export type CounselorRow = {
  id: string;
  name: string;
  title: string;
};

export type CounselorWithAccount = CounselorRow & { hasAccount: boolean };

/** Counselors plus whether they already have a login (profiles row) —
 * lets /admin offer "Buat Login" only where it's actually missing,
 * covering counselors that were seeded directly into the table
 * without an account (see 004_booking_system.sql). */
export async function listCounselorsWithAccountStatus(): Promise<
  CounselorWithAccount[]
> {
  if (!supabase) return [];
  const [{ data: counselors, error: counselorsError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase.from("counselors").select("id, name, title").order("name"),
      supabase.from("profiles").select("counselor_id").eq("role", "counselor"),
    ]);
  if (counselorsError) throw counselorsError;
  if (profilesError) throw profilesError;

  const linked = new Set((profiles ?? []).map((p) => p.counselor_id));
  return (counselors ?? []).map((c) => ({ ...c, hasAccount: linked.has(c.id) }));
}

/** Random, easy-to-read temporary password to hand the counselor. */
export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export type CreateCounselorResult = {
  ok: true;
  counselor_id: string;
  user_id: string;
};

async function invokeCreateCounselor(body: object): Promise<CreateCounselorResult> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await supabase.functions.invoke(
    "create-counselor",
    { body },
  );
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const responseBody = await error.context.json().catch(() => null);
      throw new Error(responseBody?.error ?? error.message);
    }
    throw error;
  }
  return data as CreateCounselorResult;
}

export function createCounselorAccount(input: {
  name: string;
  title: string;
  email: string;
  password: string;
}): Promise<CreateCounselorResult> {
  return invokeCreateCounselor(input);
}

/** For a counselor row that already exists but has no login yet. */
export function createLoginForCounselor(input: {
  counselorId: string;
  email: string;
  password: string;
}): Promise<CreateCounselorResult> {
  return invokeCreateCounselor({
    counselor_id: input.counselorId,
    email: input.email,
    password: input.password,
  });
}
