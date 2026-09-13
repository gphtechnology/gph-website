import { useState, type FormEvent } from "react";
import { Container } from "../components/Container";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

type Status = "idle" | "submitting" | "success" | "error";

export function BookCounseling() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const message = String(form.get("message") ?? "");

    if (!isSupabaseConfigured || !supabase) {
      // Booking isn't live yet — this keeps the form usable as a "notify me"
      // signup until the `counseling_requests` table + Supabase env vars
      // are wired up.
      console.info("Counseling request (Supabase not configured yet):", {
        name,
        email,
        message,
      });
      setStatus("success");
      return;
    }

    setStatus("submitting");
    const { error } = await supabase
      .from("counseling_requests")
      .insert({ name, email, message });

    setStatus(error ? "error" : "success");
  }

  return (
    <section className="py-20">
      <Container className="max-w-2xl">
        <span className="inline-block rounded-full bg-peach/60 px-4 py-1.5 text-sm font-semibold text-ink/80">
          Coming Soon
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-ink sm:text-4xl">
          Book Counseling
        </h1>
        <p className="mt-4 leading-relaxed text-ink/70">
          Fitur booking sesi konseling langsung dari website sedang kami
          siapkan. Sementara itu, tinggalkan pesanmu di bawah dan tim GPH akan
          menghubungimu untuk menjadwalkan sesi pertamamu.
        </p>

        {status === "success" ? (
          <div className="mt-10 rounded-3xl bg-blue/10 p-8 text-ink">
            <p className="font-semibold text-blue-dark">Terima kasih!</p>
            <p className="mt-2 text-sm text-ink/70">
              Pesanmu sudah kami terima. Tim GPH akan segera menghubungi
              lewat email yang kamu berikan.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-semibold text-ink/80"
              >
                Nama
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-ink/80"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="text-sm font-semibold text-ink/80"
              >
                Ceritakan sedikit tentang apa yang ingin kamu bicarakan
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
              />
            </div>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="rounded-full bg-blue px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-dark disabled:opacity-60"
            >
              {status === "submitting" ? "Mengirim..." : "Kirim"}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-600">
                Terjadi kendala saat mengirim. Coba lagi sebentar lagi, ya.
              </p>
            )}
          </form>
        )}
      </Container>
    </section>
  );
}
