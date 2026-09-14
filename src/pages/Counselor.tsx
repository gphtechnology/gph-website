import { useEffect, useState, type FormEvent } from "react";
import { Container } from "../components/Container";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { useSession } from "../lib/auth";
import { DAILY_SLOT_TIMES } from "../lib/booking";
import {
  fetchMyProfile,
  listAvailability,
  setAvailability,
  type Profile,
} from "../lib/counselorAvailability";

const DAYS = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 0, label: "Minggu" },
];

export function Counselor() {
  const { session, loading } = useSession();

  if (!isSupabaseConfigured) {
    return (
      <Container className="py-20">
        <p className="text-ink/70">Supabase belum dikonfigurasi.</p>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-20">
        <p className="text-ink/50">Memuat...</p>
      </Container>
    );
  }

  return session ? (
    <AvailabilityEditor userId={session.user.id} />
  ) : (
    <LoginForm />
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);
    if (error) setError(error.message);
  }

  return (
    <Container className="max-w-sm py-20">
      <h1 className="font-display text-2xl font-extrabold text-ink">
        Login Konselor
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Akun dibuat oleh tim GPH lewat Supabase Dashboard.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-semibold text-ink/80">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-ink/80">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-dark disabled:opacity-60"
        >
          {submitting ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </Container>
  );
}

function AvailabilityEditor({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null | "loading">(
    "loading",
  );
  const [availability, setAvailabilityState] = useState<Set<string>>(
    new Set(),
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    fetchMyProfile(userId).then(setProfile);
  }, [userId]);

  useEffect(() => {
    if (!profile || profile === "loading" || !profile.counselor_id) return;
    listAvailability(profile.counselor_id).then((rows) => {
      setAvailabilityState(
        new Set(rows.map((r) => `${r.day_of_week}-${r.slot_time}`)),
      );
    });
  }, [profile]);

  if (profile === "loading") {
    return (
      <Container className="max-w-3xl py-16">
        <p className="text-sm text-ink/50">Memuat...</p>
      </Container>
    );
  }

  if (!profile || profile.role !== "counselor" || !profile.counselor_id) {
    return (
      <Container className="max-w-md py-20 text-center">
        <p className="text-ink/70">
          Akun ini belum terhubung sebagai konselor. Hubungi tim GPH untuk
          mengatur akun kamu.
        </p>
        <button
          onClick={() => supabase!.auth.signOut()}
          className="mt-6 text-sm font-semibold text-ink/60 hover:text-ink"
        >
          Keluar
        </button>
      </Container>
    );
  }

  const counselorId = profile.counselor_id;

  async function toggle(dayOfWeek: number, slotTime: string, currentlyOn: boolean) {
    const key = `${dayOfWeek}-${slotTime}`;
    setBusyKey(key);
    try {
      await setAvailability(counselorId, dayOfWeek, slotTime, !currentlyOn);
      setAvailabilityState((prev) => {
        const next = new Set(prev);
        if (currentlyOn) next.delete(key);
        else next.add(key);
        return next;
      });
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <Container className="max-w-3xl py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Jadwal Ketersediaan
          </h1>
          <p className="mt-1 text-sm text-ink/60">{profile.counselor_name}</p>
        </div>
        <button
          onClick={() => supabase!.auth.signOut()}
          className="text-sm font-semibold text-ink/60 hover:text-ink"
        >
          Keluar
        </button>
      </div>

      <p className="mt-6 text-sm text-ink/60">
        Centang jam-jam kamu tersedia untuk konseling di tiap hari. Ini
        berlaku setiap minggu sampai kamu ubah lagi.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[600px] border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="text-left text-sm font-semibold text-ink/70">
                Jam
              </th>
              {DAYS.map((day) => (
                <th
                  key={day.value}
                  className="text-sm font-semibold text-ink/70"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAILY_SLOT_TIMES.map((slot) => (
              <tr key={slot}>
                <td className="text-sm font-medium text-ink/70">{slot}</td>
                {DAYS.map((day) => {
                  const key = `${day.value}-${slot}`;
                  const on = availability.has(key);
                  return (
                    <td key={day.value} className="text-center">
                      <button
                        type="button"
                        disabled={busyKey === key}
                        onClick={() => toggle(day.value, slot, on)}
                        className={`size-9 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 ${
                          on
                            ? "border-blue bg-blue text-white"
                            : "border-ink/15 text-ink/30 hover:border-blue"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
