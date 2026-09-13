import { motion } from "framer-motion";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { Container } from "../Container";

const services = [
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: "Private Counseling",
    description:
      "Sesi konseling one-on-one bersama psikolog dan behavioral therapist berpengalaman, dalam ruang yang rahasia dan aman.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Peer Counselor",
    description:
      "Ngobrol santai dengan peer counselor terlatih — teman cerita yang siap mendengarkan tanpa menghakimi.",
  },
  {
    icon: HiOutlineAcademicCap,
    title: "Workshop & Series",
    description:
      "Rangkaian kelas dan diskusi seperti 'Single Era: The Series' untuk belajar memahami diri dan hubungan yang sehat.",
  },
  {
    icon: HiOutlineCalendarDays,
    title: "Community Event",
    description:
      "Booth dan kolaborasi offline di berbagai festival serta komunitas untuk memperluas ruang cerita yang aman.",
  },
];

export function Services() {
  return (
    <section id="services" className="bg-peach/20 py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-blue uppercase">
            Layanan
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Cara kami menemani ceritamu
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
              className="rounded-3xl bg-cream p-7 shadow-sm ring-1 ring-black/5"
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-blue/15 text-blue-dark">
                <service.icon size={24} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
