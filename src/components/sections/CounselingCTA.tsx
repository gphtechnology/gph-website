import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Container } from "../Container";

export function CounselingCTA() {
  return (
    <section className="py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="overflow-hidden rounded-[2.5rem] bg-blue px-8 py-16 text-center text-white sm:px-16"
        >
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Siap untuk mulai cerita?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Jadwalkan sesi konseling pertamamu bersama tim GPH. Ceritakan apa
            yang kamu rasakan — kami akan bantu carikan ruang dan orang yang
            tepat untuk mendengarkan.
          </p>
          <Link
            to="/book-counseling"
            className="mt-8 inline-block rounded-full bg-cream px-8 py-3.5 font-semibold text-ink transition-colors hover:bg-white"
          >
            Book Counseling
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
