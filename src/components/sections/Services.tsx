import { motion } from "framer-motion";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { Container } from "../Container";
import { useLanguage } from "../../lib/i18n/context";

const icons = [
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineCalendarDays,
];

export function Services() {
  const { t } = useLanguage();

  return (
    <section id="services" className="bg-peach/20 py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-blue uppercase">
            {t.services.eyebrow}
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {t.services.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.services.items.map((service, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
                className="rounded-3xl bg-cream p-7 shadow-sm ring-1 ring-black/5"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-blue/15 text-blue-dark">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
