import { useEffect, useState, type FormEvent } from "react";
import { Container } from "../components/Container";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/context";
import {
  HOLD_SECONDS,
  SESSION_PRICE_IDR,
  BANK_TRANSFER_INFO,
  getMinBookingDate,
  listCounselors,
  listOpenSlots,
  requestBookingHold,
  uploadPaymentProof,
  markAwaitingConfirmation,
  type Counselor,
  type Booking,
} from "../lib/booking";

type Phase = "form" | "holding" | "awaiting_confirmation" | "expired";

const priceLabel = SESSION_PRICE_IDR.toLocaleString("id-ID");

export function BookCounseling() {
  const { t } = useLanguage();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [counselorId, setCounselorId] = useState("");
  const [date, setDate] = useState(getMinBookingDate());
  const [openSlots, setOpenSlots] = useState<string[]>([]);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [phase, setPhase] = useState<Phase>("form");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    listCounselors()
      .then((rows) => {
        setCounselors(rows);
        if (rows.length > 0) setCounselorId(rows[0].id);
      })
      .catch(() => setError(t.bookCounseling.errorLoadCounselors));
  }, []);

  useEffect(() => {
    if (!counselorId || !date) return;
    setTime(null);
    listOpenSlots(counselorId, date)
      .then(setOpenSlots)
      .catch(() => setOpenSlots([]));
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
        setError(t.bookCounseling.errorSlotTaken);
        listOpenSlots(counselorId, date).then(setOpenSlots);
        setTime(null);
      } else if (message.includes("h1_only")) {
        setError(t.bookCounseling.errorH1Only);
      } else {
        setError(t.bookCounseling.errorGeneric);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitProof() {
    if (!booking) return;
    if (!proofFile) {
      setError(t.bookCounseling.errorNoProof);
      return;
    }
    setSubmitting(true);
    setError(null);

    let proofPath: string;
    try {
      proofPath = await uploadPaymentProof(booking.id, proofFile);
    } catch {
      setError(t.bookCounseling.errorUploadFailed);
      setSubmitting(false);
      return;
    }

    try {
      const updated = await markAwaitingConfirmation(booking.id, proofPath);
      setBooking(updated);
      setPhase("awaiting_confirmation");
    } catch {
      setError(t.bookCounseling.errorHoldExpired);
      setPhase("expired");
    } finally {
      setSubmitting(false);
    }
  }

  function resetToForm() {
    setPhase("form");
    setBooking(null);
    setTime(null);
    setProofFile(null);
    setError(null);
    listOpenSlots(counselorId, date).then(setOpenSlots);
  }

  if (!isSupabaseConfigured) {
    return (
      <Container className="max-w-2xl py-20">
        <p className="text-ink/70">{t.bookCounseling.notConfigured}</p>
      </Container>
    );
  }

  return (
    <section className="py-20">
      <Container className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
          {t.bookCounseling.title}
        </h1>
        <p className="mt-4 leading-relaxed text-ink/70">
          {t.bookCounseling.policyNote}
        </p>

        {phase === "form" && (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="text-sm font-semibold text-ink/80">
                {t.bookCounseling.labelCounselor}
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
                {t.bookCounseling.labelDate}
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
                {t.bookCounseling.labelTime}
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {openSlots.length === 0 ? (
                  <p className="text-sm text-ink/50">
                    {t.bookCounseling.noSlotsAvailable}
                  </p>
                ) : (
                  openSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        time === slot
                          ? "border-blue bg-blue text-white"
                          : "border-ink/15 text-ink/80 hover:border-blue"
                      }`}
                    >
                      {slot}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-ink/80">
                {t.bookCounseling.labelName}
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
                {t.bookCounseling.labelEmail}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
              />
              <p className="mt-1 text-xs text-ink/50">
                {t.bookCounseling.emailHint}
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={!time || submitting}
              className="w-full rounded-full bg-blue px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-dark disabled:opacity-50"
            >
              {submitting
                ? t.bookCounseling.submitting
                : t.bookCounseling.submitWithPrice(priceLabel)}
            </button>
          </form>
        )}

        {phase === "holding" && booking && (
          <div className="mt-10 rounded-3xl bg-peach/20 p-8 text-center">
            <p className="font-semibold text-ink">
              {t.bookCounseling.holdingTitle}
            </p>
            <p className="mt-2 font-display text-4xl font-extrabold text-blue-dark">
              {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              {t.bookCounseling.holdingSubtitle}
            </p>

            <img
              src={`${import.meta.env.BASE_URL}qris.jpeg`}
              alt="QRIS GPH"
              className="mx-auto mt-6 w-56 rounded-2xl bg-white p-3"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p className="mt-4 text-sm text-ink/70">
              {t.bookCounseling.scanPrefix}{" "}
              <span className="font-semibold">Rp{priceLabel}</span>.
            </p>

            <div className="mt-4 rounded-2xl bg-cream/60 p-4 text-left text-sm text-ink/70">
              <p className="font-semibold text-ink/80">
                {t.bookCounseling.orTransferManual}
              </p>
              <p className="mt-1">
                {t.bookCounseling.bankLabel}: {BANK_TRANSFER_INFO.bankName}
              </p>
              <p>
                {t.bookCounseling.accountNumberLabel}:{" "}
                <span className="font-mono">
                  {BANK_TRANSFER_INFO.accountNumber}
                </span>
              </p>
              <p>
                {t.bookCounseling.accountHolderLabel}:{" "}
                {BANK_TRANSFER_INFO.accountHolder}
              </p>
            </div>

            <div className="mt-4 text-left">
              <label className="text-sm font-semibold text-ink/80">
                {t.bookCounseling.uploadLabel}
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-blue"
              />
              <p className="mt-1 text-xs text-ink/50">
                {t.bookCounseling.uploadHint}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmitProof}
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-blue px-7 py-3.5 font-semibold text-white transition-colors hover:bg-blue-dark disabled:opacity-50"
            >
              {submitting ? t.bookCounseling.submitting : t.bookCounseling.paidButton}
            </button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        )}

        {phase === "awaiting_confirmation" && (
          <div className="mt-10 rounded-3xl bg-blue/10 p-8 text-center">
            <p className="font-semibold text-blue-dark">
              {t.bookCounseling.awaitingTitle}
            </p>
            <p className="mt-2 text-sm text-ink/70">
              {t.bookCounseling.awaitingPrefix} <strong>{email}</strong>
              {t.bookCounseling.awaitingSuffix}
            </p>
          </div>
        )}

        {phase === "expired" && (
          <div className="mt-10 rounded-3xl bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-700">
              {t.bookCounseling.expiredTitle}
            </p>
            <p className="mt-2 text-sm text-ink/70">
              {t.bookCounseling.expiredSubtitle}
            </p>
            <button
              type="button"
              onClick={resetToForm}
              className="mt-6 rounded-full bg-blue px-7 py-3 font-semibold text-white hover:bg-blue-dark"
            >
              {t.bookCounseling.retry}
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
