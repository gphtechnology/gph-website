import { useEffect, useState, type FormEvent } from "react";
import { Container } from "../components/Container";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import {
  DAILY_SLOT_TIMES,
  HOLD_SECONDS,
  SESSION_PRICE_IDR,
  getMinBookingDate,
  listCounselors,
  listTakenSlots,
  requestBookingHold,
  markAwaitingConfirmation,
  type Counselor,
  type Booking,
} from "../lib/booking";

type Phase = "form" | "holding" | "awaiting_confirmation" | "expired";

const priceLabel = SESSION_PRICE_IDR.toLocaleString("id-ID");

export function BookCounseling() {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [counselorId, setCounselorId] = useState("");
  const [date, setDate] = useState(getMinBookingDate());
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [phase, setPhase] = useState<Phase>("form");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);

  useEffect(() => {
    listCounselors()
      .then((rows) => {
        setCounselors(rows);
        if (rows.length > 0) setCounselorId(rows[0].id);
      })
      .catch(() => setError("Gagal memuat daftar konselor."));
  }, []);

  useEffect(() => {
    if (!counselorId || !date) return;
    setTime(null);
    listTakenSlots(counselorId, date)
      .then(setTakenSlots)
      .catch(() => setTakenSlots([]));
  }, [counselorId, date]);

  useEffect(() => {
    if (phase !== "holding" || !booking?.held_until) return;

    const tick = () => {
      const remaining = Math.round(
        (new Date(booking.held_until!).getTime() - Date.now()) / 1000,
      );
      setSecondsLeft(Math.max(0, remaining));
      if (remaining <= 0) setPhase("expired");
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, booking]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!counselorId || !time) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = await requestBookingHold({
        counselorId,
        slotDatetime: `${date}T${time}:00`,
        userName: name,
        userEmail: email,
      });
      setBooking(result);
      setPhase("holding");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("slot_taken")) {
        setError("Slot ini baru saja diambil orang lain. Coba pilih slot lain.");
        listTakenSlots(counselorId, date).then(setTakenSlots);
        setTime(null);
      } else if (message.includes("h1_only")) {
        setError("Booking hanya bisa dilakukan untuk besok atau setelahnya.");
      } else {
        setError("Gagal membuat booking. Coba lagi sebentar.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePaid() {
    if (!booking) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await markAwaitingConfirmation(booking.id);
      setBooking(updated);
      setPhase("awaiting_confirmation");
    } catch {
      setError("Waktu hold sudah habis. Silakan booking ulang.");
      setPhase("expired");
    } finally {
      setSubmitting(false);
    }
  }

  function resetToForm() {
    setPhase("form");
    setBooking(null);
    setTime(null);
    setError(null);
    listTakenSlots(counselorId, date).then(setTakenSlots);
  }

  if (!isSupabaseConfigured) {
    return (
      <Container className="max-w-2xl py-20">
        <p className="text-ink/70">Supabase belum dikonfigurasi.</p>
      </Container>
    );
  }

  return (
    <section className="py-20">
      <Container className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
          Book Counseling
        </h1>
        <p className="mt-4 leading-relaxed text-ink/70">
          Booking sesi konseling hanya bisa dilakukan untuk besok atau
          setelahnya (H+1), supaya tim GPH bisa menyiapkan sesi terbaikmu.
        </p>

        {phase === "form" && (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="text-sm font-semibold text-ink/80">
                Konselor
              </label>
              <select
                value={counselorId}
                onChange={(e) => setCounselorId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
              >
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-ink/80">
                Tanggal
              </label>
              <input
                type="date"
                required
                min={getMinBookingDate()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-ink/80">
                Jam (WIB)
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAILY_SLOT_TIMES.map((slot) => {
                  const taken = takenSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={taken}
                      onClick={() => setTime(slot)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        taken
                          ? "cursor-not-allowed border-ink/10 text-ink/30 line-through"
                          : time === slot
                            ? "border-blue bg-blue text-white"
                            : "border-ink/15 text-ink/80 hover:border-blue"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-ink/80">
                Nama
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-ink/80">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
              />
              <p className="mt-1 text-xs text-ink/50">
                Link Zoom akan dikirim ke email ini setelah pembayaran
                dikonfirmasi.
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={!time || submitting}
              className="w-full rounded-full bg-blue px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-dark disabled:opacity-50"
            >
              {submitting
                ? "Memproses..."
                : `Lanjut ke Pembayaran — Rp${priceLabel}`}
            </button>
          </form>
        )}

        {phase === "holding" && booking && (
          <div className="mt-10 rounded-3xl bg-peach/20 p-8 text-center">
            <p className="font-semibold text-ink">
              Selesaikan pembayaran dalam
            </p>
            <p className="mt-2 font-display text-4xl font-extrabold text-blue-dark">
              {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              Slot ini dikunci khusus untukmu selama waktu berjalan.
            </p>

            <img
              src="/qris.png"
              alt="QRIS GPH"
              className="mx-auto mt-6 w-56 rounded-2xl bg-white p-3"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p className="mt-4 text-sm text-ink/70">
              Scan QRIS di atas, transfer tepat{" "}
              <span className="font-semibold">Rp{priceLabel}</span>.
            </p>

            <button
              type="button"
              onClick={handlePaid}
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-blue px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-dark disabled:opacity-50"
            >
              {submitting ? "Memproses..." : "Saya Sudah Bayar"}
            </button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        )}

        {phase === "awaiting_confirmation" && (
          <div className="mt-10 rounded-3xl bg-blue/10 p-8 text-center">
            <p className="font-semibold text-blue-dark">
              Menunggu konfirmasi tim GPH
            </p>
            <p className="mt-2 text-sm text-ink/70">
              Slotmu sudah diamankan. Setelah pembayaran kami verifikasi,
              link Zoom akan dikirim ke <strong>{email}</strong>.
            </p>
          </div>
        )}

        {phase === "expired" && (
          <div className="mt-10 rounded-3xl bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-700">Waktu habis</p>
            <p className="mt-2 text-sm text-ink/70">
              Slot dilepas kembali karena pembayaran tidak diselesaikan
              dalam 90 detik.
            </p>
            <button
              type="button"
              onClick={resetToForm}
              className="mt-6 rounded-full bg-blue px-7 py-3 font-semibold text-white hover:bg-blue-dark"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
