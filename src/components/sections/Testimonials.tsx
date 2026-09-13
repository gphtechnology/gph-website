import { motion } from "framer-motion";
import { Container } from "../Container";

const quotes = [
  "Kepala penuh banget, bingung harus mulai cerita darimana.",
  "Aku cuma butuh didengar, bukan dihakimi.",
  "Ternyata boleh, kok, minta tolong duluan.",
];

export function Testimonials() {
  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-blue uppercase">
            Suara Mereka
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Kamu tidak sendirian
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {quotes.map((quote, index) => (
            <motion.div
              key={quote}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
              className="flex min-h-52 items-center rounded-3xl bg-gradient-to-br from-blue to-blue-dark p-8 text-white shadow-lg"
            >
              <p className="font-display text-xl leading-snug font-semibold">
                "{quote}"
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
