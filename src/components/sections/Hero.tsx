import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Container } from "../Container";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-peach/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-32 size-80 rounded-full bg-blue/20 blur-3xl"
      />

      <Container className="relative grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-block rounded-full bg-peach/60 px-4 py-1.5 text-sm font-semibold text-ink/80">
            Gigajo Psychological House
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight font-extrabold text-ink sm:text-5xl lg:text-6xl">
            Your safe home to talk, heal, and grow.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/70">
            Kepala penuh banget, bingung harus mulai cerita darimana? GPH
            hadir sebagai ruang aman untuk konseling, workshop, dan komunitas
            yang mendukung kesehatan mentalmu.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/book-counseling"
              className="rounded-full bg-blue px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue/20 transition-colors hover:bg-blue-dark"
            >
              Book a Session
            </Link>
            <a
              href="#services"
              className="rounded-full border border-ink/15 px-7 py-3.5 font-semibold text-ink transition-colors hover:border-blue hover:text-blue"
            >
              Lihat Layanan
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          <div className="absolute inset-6 rounded-[3rem] bg-blue/90" />
          <div className="absolute inset-0 flex items-center justify-center rounded-[3rem] border-2 border-peach bg-cream/40 backdrop-blur-sm">
            <p className="max-w-[70%] text-center font-display text-2xl font-semibold text-ink">
              "Don't keep it all yourself."
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
