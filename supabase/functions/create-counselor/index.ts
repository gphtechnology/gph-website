// Supabase Edge Function: create-counselor
//
// Called from /admin ("Tambah Konselor Baru") by an authenticated
// admin. Creates the counselor's login (Supabase Auth), their row in
// `counselors`, and the `profiles` row linking the two — all three in
// one call so the admin never needs the SQL Editor for this.
//
// Deployed with default JWT verification on (do NOT deploy with
// --no-verify-jwt). On top of that, this function checks the caller's
// own `profiles.role` is 'admin' before doing anything — a valid
// logged-in counselor account must NOT be able to call this.
//
// No extra secrets needed beyond what confirm-booking-payment already
// uses — SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided
// automatically by the Edge Functions runtime.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify the caller is a logged-in admin before doing anything.
    const jwt = (req.headers.get("Authorization") ?? "").replace(
      "Bearer ",
      "",
    );
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(jwt);
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (callerProfile?.role !== "admin") {
      return json({ error: "Forbidden: admin only" }, 403);
    }

    const { name, title, email, password } = await req.json();
    if (!name || !title || !email || !password) {
      return json({ error: "name, title, email, and password are required" }, 400);
    }

    const { data: newUser, error: createUserError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (createUserError || !newUser.user) {
      return json(
        { error: createUserError?.message ?? "Failed to create login" },
        500,
      );
    }

    const { data: counselor, error: counselorError } = await admin
      .from("counselors")
      .insert({ name, title })
      .select()
      .single();

    if (counselorError) {
      await admin.auth.admin.deleteUser(newUser.user.id);
      return json({ error: counselorError.message }, 500);
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: newUser.user.id,
      role: "counselor",
      counselor_id: counselor.id,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(newUser.user.id);
      await admin.from("counselors").delete().eq("id", counselor.id);
      return json({ error: profileError.message }, 500);
    }

    return json({ ok: true, counselor_id: counselor.id, user_id: newUser.user.id });
  } catch (err) {
    console.error(err);
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
