// Supabase Edge Function: confirm-booking-payment
//
// Called from /admin (BookingManager, "Konfirmasi Pembayaran") by an
// authenticated admin after they've manually checked the QRIS transfer
// landed. Creates the Zoom meeting for the booking, emails the join
// link to the customer, then marks the booking as paid.
//
// Deployed with default JWT verification on (do NOT deploy with
// --no-verify-jwt) — Supabase only lets requests through with a valid
// user access token, and there's no public sign-up, so only GPH admins
// can ever call this.
//
// Required secrets (set via `supabase secrets set KEY=value`, never
// committed to git):
//   ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET — Server-to-Server
//     OAuth app credentials from the Zoom Marketplace
//   ZOOM_HOST_EMAIL     — email of the licensed Zoom user (on the same
//     account as the S2S app) that will host these sessions
//   RESEND_API_KEY      — https://resend.com API key
//   RESEND_FROM_EMAIL   — sender address on a domain verified in Resend
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically
// by the Edge Functions runtime.

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
    const { booking_id } = await req.json();
    if (!booking_id) return json({ error: "booking_id required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*, counselors(name)")
      .eq("id", booking_id)
      .single();

    if (fetchError || !booking) return json({ error: "Booking not found" }, 404);

    const zoomMeeting = await createZoomMeeting(booking);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "paid",
        zoom_join_url: zoomMeeting.join_url,
        zoom_meeting_id: String(zoomMeeting.id),
      })
      .eq("id", booking_id);

    if (updateError) throw updateError;

    // Zoom meeting + "paid" status are the parts that matter; don't let
    // an email hiccup (e.g. Resend sandbox mode, domain not verified
    // yet) make this look like a total failure when it mostly worked.
    let emailError: string | null = null;
    try {
      await sendConfirmationEmail(booking, zoomMeeting.join_url);
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Unknown email error";
      console.error("Email send failed (booking still marked paid):", emailError);
    }

    return json({
      ok: true,
      join_url: zoomMeeting.join_url,
      email_sent: emailError === null,
      email_error: emailError,
    });
  } catch (err) {
    console.error(err);
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});

async function getZoomAccessToken(): Promise<string> {
  const accountId = Deno.env.get("ZOOM_ACCOUNT_ID")!;
  const clientId = Deno.env.get("ZOOM_CLIENT_ID")!;
  const clientSecret = Deno.env.get("ZOOM_CLIENT_SECRET")!;
  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    { method: "POST", headers: { Authorization: `Basic ${basicAuth}` } },
  );

  if (!res.ok) throw new Error(`Zoom OAuth failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

type BookingRow = {
  slot_datetime: string;
  user_name: string;
  user_email: string;
  counselors?: { name: string };
};

async function createZoomMeeting(
  booking: BookingRow,
): Promise<{ id: number; join_url: string }> {
  const accessToken = await getZoomAccessToken();
  const hostEmail = Deno.env.get("ZOOM_HOST_EMAIL")!;

  const res = await fetch(
    `https://api.zoom.us/v2/users/${encodeURIComponent(hostEmail)}/meetings`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: `Sesi Konseling GPH bersama ${booking.counselors?.name ?? "Konselor"}`,
        type: 2, // scheduled meeting
        // slot_datetime is a naive WIB wall-clock string ("2026-10-05T19:00:00");
        // pairing it with timezone below tells Zoom to interpret it as WIB.
        start_time: booking.slot_datetime,
        timezone: "Asia/Jakarta",
        duration: 60,
        settings: { join_before_host: false, waiting_room: true },
      }),
    },
  );

  if (!res.ok) throw new Error(`Zoom create meeting failed: ${await res.text()}`);
  return res.json();
}

async function sendConfirmationEmail(booking: BookingRow, joinUrl: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY")!;
  const from = Deno.env.get("RESEND_FROM_EMAIL")!;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: booking.user_email,
      subject: "Link Zoom Sesi Konseling GPH Kamu",
      html: `
        <p>Halo ${booking.user_name},</p>
        <p>Pembayaran kamu sudah kami konfirmasi. Berikut link Zoom untuk sesi konselingmu:</p>
        <p><a href="${joinUrl}">${joinUrl}</a></p>
        <p>Sampai jumpa di sesi konseling!</p>
        <p>— Tim Gigajo Psychological House</p>
      `,
    }),
  });

  if (!res.ok) throw new Error(`Resend email failed: ${await res.text()}`);
}
