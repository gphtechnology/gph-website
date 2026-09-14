import { useEffect, useState, type FormEvent } from "react";
import { Container } from "../components/Container";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { useSession } from "../lib/auth";
import { formatEventDateTime } from "../lib/events";
import {
  listEventRecords,
  createEventRecord,
  updateEventRecord,
  deleteEventRecord,
  type EventRecord,
  type EventInput,
} from "../lib/adminEvents";
import {
  listAwaitingConfirmation,
  cancelBooking,
  confirmBookingPayment,
  type PendingBooking,
} from "../lib/adminBookings";
import {
  listCounselorsWithAccountStatus,
  generateTempPassword,
  createCounselorAccount,
  createLoginForCounselor,
  type CounselorWithAccount,
} from "../lib/adminCounselors";

const emptyForm: EventInput = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  registration_url: "",
};

export function Admin() {
  const { session, loading } = useSession();

  if (!isSupabaseConfigured) {
    return (
      <Container className="py-20">
        <p className="text-ink/70">
          Supabase belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan
          VITE_SUPABASE_ANON_KEY untuk mengakses halaman admin.
        </p>
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

  return session ? <Dashboard /> : <LoginForm />;
}

function Dashboard() {
  return (
    <Container className="max-w-4xl py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Admin GPH
        </h1>
        <button
          onClick={() => supabase!.auth.signOut()}
          className="text-sm font-semibold text-ink/60 hover:text-ink"
        >
          Keluar
        </button>
      </div>

      <div className="mt-10">
        <BookingManager />
      </div>

      <div className="mt-16">
        <CounselorManager />
      </div>

      <div className="mt-16">
        <EventManager />
      </div>
    </Container>
  );
}

function CounselorManager() {
  const [counselors, setCounselors] = useState<CounselorWithAccount[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generateTempPassword());
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const [loginTargetId, setLoginTargetId] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState(generateTempPassword());
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  async function refresh() {
    setLoadingList(true);
    try {
      setCounselors(await listCounselorsWithAccountStatus());
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setLastCreated(null);
    try {
      await createCounselorAccount({ name, title, email, password });
      setLastCreated({ email, password });
      setName("");
      setTitle("");
      setEmail("");
      setPassword(generateTempPassword());
      await refresh();
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `Gagal menambah konselor: ${err.message}`
          : "Gagal menambah konselor.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startLoginFor(counselorId: string) {
    setLoginTargetId(counselorId);
    setLoginEmail("");
    setLoginPassword(generateTempPassword());
    setStatus(null);
  }

  async function handleCreateLogin(event: FormEvent) {
    event.preventDefault();
    if (!loginTargetId) return;
    setLoginSubmitting(true);
    setStatus(null);
    setLastCreated(null);
    try {
      await createLoginForCounselor({
        counselorId: loginTargetId,
        email: loginEmail,
        password: loginPassword,
      });
      setLastCreated({ email: loginEmail, password: loginPassword });
      setLoginTargetId(null);
      await refresh();
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `Gagal membuat login: ${err.message}`
          : "Gagal membuat login.",
      );
    } finally {
      setLoginSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink">
        Tambah Konselor Baru
      </h2>
      <p className="mt-1 text-sm text-ink/60">
        Ini otomatis bikin akun login konselor sekaligus — mereka bisa
        langsung masuk ke <code>/counselor</code> untuk atur jadwal
        ketersediaan.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-3xl bg-peach/20 p-6"
      >
        <input
          type="text"
          placeholder="Nama (mis. Joice Benedicta, S.Psi)"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
        />
        <input
          type="text"
          placeholder="Peran (mis. Peer Counselor)"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
        />
        <input
          type="email"
          placeholder="Email login"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
        />
        <div>
          <label className="text-xs font-semibold text-ink/50">
            Password sementara (bagikan ke konselor)
          </label>
          <input
            type="text"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 font-mono outline-none focus:border-blue"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-blue px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-dark disabled:opacity-50"
        >
          {submitting ? "Memproses..." : "Tambah Konselor"}
        </button>
        {status && <p className="text-sm text-red-600">{status}</p>}
      </form>

      {lastCreated && (
        <div className="mt-4 rounded-2xl bg-blue/10 p-5 text-sm text-ink/80">
          <p className="font-semibold text-blue-dark">
            Akun berhasil dibuat! Bagikan info login ini ke konselornya:
          </p>
          <p className="mt-2">
            Email: <span className="font-mono">{lastCreated.email}</span>
          </p>
          <p>
            Password:{" "}
            <span className="font-mono">{lastCreated.password}</span>
          </p>
          <p className="mt-2 text-xs text-ink/60">
            Mereka login di <code>/counselor</code> untuk atur jadwal.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {loadingList ? (
          <p className="text-sm text-ink/50">Memuat...</p>
        ) : (
          counselors.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-cream p-4 text-sm ring-1 ring-black/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-ink">{c.name}</span>
                  <span className="text-ink/60"> — {c.title}</span>
                </div>
                {c.hasAccount ? (
                  <span className="shrink-0 text-xs font-semibold text-blue-dark">
                    Sudah punya login
                  </span>
                ) : loginTargetId === c.id ? null : (
                  <button
                    type="button"
                    onClick={() => startLoginFor(c.id)}
                    className="shrink-0 rounded-full border border-blue px-3 py-1 text-xs font-semibold text-blue-dark hover:bg-blue hover:text-white"
                  >
                    Buat Login
                  </button>
                )}
              </div>

              {loginTargetId === c.id && (
                <form
                  onSubmit={handleCreateLogin}
                  className="mt-3 space-y-2 border-t border-black/5 pt-3"
                >
                  <input
                    type="email"
                    placeholder="Email login"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-blue"
                  />
                  <input
                    type="text"
                    placeholder="Password sementara"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-blue"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loginSubmitting}
                      className="rounded-full bg-blue px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-dark disabled:opacity-50"
                    >
                      {loginSubmitting ? "Memproses..." : "Simpan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginTargetId(null)}
                      className="rounded-full border border-ink/20 px-4 py-1.5 text-xs font-semibold text-ink/70"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BookingManager() {
  const [bookings, setBookings] = useState<PendingBooking[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function refresh() {
    setLoadingList(true);
    try {
      setBookings(await listAwaitingConfirmation());
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleConfirm(id: string) {
    setBusyId(id);
    setStatus(null);
    try {
      const result = await confirmBookingPayment(id);
      setStatus(
        result.email_sent
          ? "Pembayaran dikonfirmasi, Zoom + email terkirim."
          : `Zoom meeting dibuat, tapi email gagal terkirim (${result.email_error}). ` +
            `Kirim link ini manual ke customer: ${result.join_url}`,
      );
      await refresh();
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `Gagal konfirmasi: ${err.message}`
          : "Gagal konfirmasi pembayaran.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Batalkan booking ini?")) return;
    setBusyId(id);
    try {
      await cancelBooking(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink">
        Booking Menunggu Konfirmasi
      </h2>
      <p className="mt-1 text-sm text-ink/60">
        Cek mutasi transfer QRIS secara manual, lalu konfirmasi di sini —
        Zoom meeting dan email ke customer dikirim otomatis.
      </p>

      {status && <p className="mt-3 text-sm text-ink/70">{status}</p>}

      <div className="mt-6 space-y-4">
        {loadingList ? (
          <p className="text-sm text-ink/50">Memuat...</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-ink/50">
            Tidak ada booking yang menunggu konfirmasi.
          </p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col gap-3 rounded-2xl bg-peach/20 p-5 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-ink">
                  {formatEventDateTime(booking.slot_datetime)} ·{" "}
                  {booking.counselor_name}
                </p>
                <p className="text-sm text-ink/60">
                  {booking.user_name} — {booking.user_email}
                </p>
                {booking.proof_url ? (
                  <a
                    href={booking.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block"
                  >
                    <img
                      src={booking.proof_url}
                      alt="Bukti pembayaran"
                      className="h-24 w-24 rounded-lg border border-ink/15 object-cover"
                    />
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-red-600">
                    Belum ada bukti pembayaran diupload.
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-3 text-sm font-semibold">
                <button
                  onClick={() => handleConfirm(booking.id)}
                  disabled={busyId === booking.id}
                  className="rounded-full bg-blue px-4 py-2 text-white hover:bg-blue-dark disabled:opacity-50"
                >
                  {busyId === booking.id ? "Memproses..." : "Konfirmasi Pembayaran"}
                </button>
                <button
                  onClick={() => handleCancel(booking.id)}
                  disabled={busyId === booking.id}
                  className="rounded-full border border-ink/20 px-4 py-2 text-ink/70 hover:border-red-400 hover:text-red-600"
                >
                  Batalkan
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
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
        Admin Login
      </h1>
      <p className="mt-2 text-sm text-ink/60">Khusus tim GPH.</p>
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

function EventManager() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [form, setForm] = useState<EventInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  async function refresh() {
    setLoadingList(true);
    const data = await listEventRecords();
    setEvents(data);
    setLoadingList(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function startEdit(event: EventRecord) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      // Supabase returns "YYYY-MM-DDTHH:mm:ss"; <input type="datetime-local">
      // needs it trimmed to the minute.
      event_date: event.event_date.slice(0, 16),
      location: event.location,
      registration_url: event.registration_url ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    try {
      const payload: EventInput = {
        ...form,
        registration_url: form.registration_url || null,
      };
      if (editingId) {
        await updateEventRecord(editingId, payload);
        setStatus("Event diperbarui.");
      } else {
        await createEventRecord(payload);
        setStatus("Event ditambahkan.");
      }
      resetForm();
      await refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus event ini?")) return;
    await deleteEventRecord(id);
    await refresh();
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink">
        Kelola Event GPH
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-3xl bg-peach/20 p-6"
      >
        <h3 className="font-semibold text-ink">
          {editingId ? "Edit Event" : "Tambah Event Baru"}
        </h3>
        <input
          type="text"
          placeholder="Judul"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
        />
        <textarea
          placeholder="Deskripsi"
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <input
              type="datetime-local"
              required
              value={form.event_date}
              onChange={(e) =>
                setForm({ ...form, event_date: e.target.value })
              }
              className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
            />
            <p className="mt-1 text-xs text-ink/50">Jam dalam WIB</p>
          </div>
          <input
            type="text"
            placeholder="Lokasi"
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
          />
        </div>
        <input
          type="url"
          placeholder="Link pendaftaran (opsional)"
          value={form.registration_url ?? ""}
          onChange={(e) =>
            setForm({ ...form, registration_url: e.target.value })
          }
          className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-blue"
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-blue px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-dark"
          >
            {editingId ? "Simpan Perubahan" : "Tambah Event"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-ink/20 px-6 py-2.5 font-semibold text-ink/70"
            >
              Batal
            </button>
          )}
        </div>
        {status && <p className="text-sm text-ink/70">{status}</p>}
      </form>

      <div className="mt-10 space-y-4">
        {loadingList ? (
          <p className="text-sm text-ink/50">Memuat event...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-ink/50">Belum ada event.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between gap-4 rounded-2xl bg-cream p-5 ring-1 ring-black/5"
            >
              <div>
                <p className="font-semibold text-ink">{event.title}</p>
                <p className="text-sm text-ink/60">
                  {formatEventDateTime(event.event_date)} · {event.location}
                </p>
              </div>
              <div className="flex shrink-0 gap-3 text-sm font-semibold">
                <button
                  onClick={() => startEdit(event)}
                  className="text-blue-dark hover:text-blue"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
