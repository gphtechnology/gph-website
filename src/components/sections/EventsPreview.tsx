import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiOutlineMapPin, HiOutlineCalendar } from "react-icons/hi2";
import { Container } from "../Container";
import { useEvents, formatEventDateTime } from "../../lib/events";
import { useLanguage } from "../../lib/i18n/context";

export function EventsPreview() {
  const { events } = useEvents();
  const { language, t } = useLanguage();
  const upcoming = events.slice(0, 2);

  return (
    <section id="events" className="bg-peach/20 py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-sm font-semibold tracking-wide text-blue uppercase">
              {t.eventsPreview.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              {t.eventsPreview.title}
            </h2>
          </div>
          <Link
            to="/events"
            className="font-semibold text-blue-dark hover:text-blue"
          >
            {t.eventsPreview.viewAll}
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {upcoming.map((event, index) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
              className="rounded-3xl bg-cream p-7 shadow-sm ring-1 ring-black/5"
            >
              <h3 className="font-display text-lg font-bold text-ink">
                {event.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {event.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium text-ink/60">
                <span className="flex items-center gap-1.5">
                  <HiOutlineCalendar className="text-blue-dark" />
                  {formatEventDateTime(event.date, language)}
                </span>
                <span className="flex items-center gap-1.5">
                  <HiOutlineMapPin className="text-blue-dark" />
                  {event.location}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
