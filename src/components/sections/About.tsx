import { motion } from "framer-motion";
import { Container } from "../Container";
import { useLanguage } from "../../lib/i18n/context";

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24">
      <Container className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-sm font-semibold tracking-wide text-blue uppercase">
            {t.about.eyebrow}
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {t.about.title}
          </h2>
          <p className="mt-6 leading-relaxed text-ink/70">
            {t.about.paragraph1}
          </p>
          <p className="mt-4 leading-relaxed text-ink/70">
            {t.about.paragraph2}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1"
        >
          {t.about.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl bg-peach/40 p-6 text-center lg:text-left"
            >
              <p className="font-display text-3xl font-extrabold text-blue-dark">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-ink/70">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
