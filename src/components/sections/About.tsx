import { motion } from "framer-motion";
import { Container } from "../Container";

const stats = [
  { label: "Peer Counselor & Psikolog", value: "10+" },
  { label: "Sesi Konseling Terselenggara", value: "500+" },
  { label: "Event & Workshop", value: "20+" },
];

export function About() {
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
            Tentang Kami
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Gigajo Psychological House
          </h2>
          <p className="mt-6 leading-relaxed text-ink/70">
            GPH lahir dari Gigajo dengan satu misi: membuat dukungan
            kesehatan mental terasa lebih dekat, hangat, dan mudah diakses —
            khususnya untuk anak muda. Lewat private counseling, peer
            counselor, dan rangkaian workshop maupun booth komunitas, kami
            percaya bahwa setiap cerita layak didengar tanpa dihakimi.
          </p>
          <p className="mt-4 leading-relaxed text-ink/70">
            Sebagai trademark dari Gigajo, GPH berkomitmen menghadirkan
            layanan psikologis yang elegan, personal, dan berbasis empati —
            baik secara online maupun lewat kegiatan offline di komunitas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1"
        >
          {stats.map((stat) => (
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
