import { Link } from "react-router-dom";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { useLanguage } from "../lib/i18n/context";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-ink text-cream/80">
      <Container className="grid gap-10 py-14 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo className="[&_.text-ink]:text-cream" />
          <p className="max-w-xs text-sm leading-relaxed text-cream/60">
            {t.footer.tagline}
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-cream">{t.footer.explore}</h3>
          <ul className="space-y-2 text-cream/60">
            <li>
              <Link to="/#about" className="hover:text-cream">
                {t.nav.about}
              </Link>
            </li>
            <li>
              <Link to="/#services" className="hover:text-cream">
                {t.nav.services}
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-cream">
                {t.nav.events}
              </Link>
            </li>
            <li>
              <Link to="/book-counseling" className="hover:text-cream">
                {t.nav.bookCounseling}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-cream">{t.footer.connect}</h3>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/gigajopsychologicalhouse/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram GPH"
              className="grid size-10 place-items-center rounded-full bg-cream/10 transition-colors hover:bg-blue"
            >
              <FaInstagram size={18} />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok GPH"
              className="grid size-10 place-items-center rounded-full bg-cream/10 transition-colors hover:bg-blue"
            >
              <FaTiktok size={18} />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp GPH"
              className="grid size-10 place-items-center rounded-full bg-cream/10 transition-colors hover:bg-blue"
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-cream/10 py-6 text-center text-xs text-cream/40">
        {t.footer.rights(new Date().getFullYear())}
      </div>
    </footer>
  );
}
