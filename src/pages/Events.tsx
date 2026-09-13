import { HiOutlineMapPin, HiOutlineCalendar } from "react-icons/hi2";
import { Container } from "../components/Container";
import { useEvents, formatEventDateTime } from "../lib/events";

export function Events() {
  const { events, loading } = useEvents();

  return (
    <section className="py-20">
      <Container>
        <span className="text-sm font-semibold tracking-wide text-blue uppercase">
          Event GPH
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
          Semua kegiatan & pengumuman
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">
          Daftar ini dikelola langsung oleh tim GPH lewat Supabase, jadi
          selalu menampilkan event terbaru.
        </p>

        {loading ? (
          <p className="mt-12 text-sm text-ink/50">Memuat event...</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-3xl bg-peach/20 p-7 ring-1 ring-black/5"
              >
                <h2 className="font-display text-lg font-bold text-ink">
                  {event.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  {event.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium text-ink/60">
                  <span className="flex items-center gap-1.5">
                    <HiOutlineCalendar className="text-blue-dark" />
                    {formatEventDateTime(event.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HiOutlineMapPin className="text-blue-dark" />
                    {event.location}
                  </span>
                </div>
                {event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-block font-semibold text-blue-dark hover:text-blue"
                  >
                    Daftar sekarang →
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
