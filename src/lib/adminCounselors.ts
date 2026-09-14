import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export type CounselorRow = {
  id: string;
  name: string;
  title: string;
};

export async function listAllCounselors(): Promise<CounselorRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("counselors")
    .select("id, name, title")
    .order("name");
  if (error) throw error;
  return data ?? [];
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

export async function createCounselorAccount(input: {
  name: string;
  title: string;
  email: string;
  password: string;
}): Promise<CreateCounselorResult> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await supabase.functions.invoke(
    "create-counselor",
    { body: input },
  );
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      throw new Error(body?.error ?? error.message);
    }
    throw error;
  }
  return data as CreateCounselorResult;
}
