import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { Logo } from "./Logo";
import { Container } from "./Container";
import { useLanguage } from "../lib/i18n/context";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { label: t.nav.about, href: "/#about" },
    { label: t.nav.services, href: "/#services" },
    { label: t.nav.events, href: "/events" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-cream/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className="font-medium text-ink/80 transition-colors hover:text-blue"
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/book-counseling"
            className="rounded-full bg-blue px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-dark"
          >
            {t.nav.bookCounseling}
          </Link>
          <div className="flex rounded-full border border-ink/15 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLanguage("id")}
              className={`rounded-full px-2.5 py-1 transition-colors ${language === "id" ? "bg-blue text-white" : "text-ink/60 hover:text-ink"}`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-2.5 py-1 transition-colors ${language === "en" ? "bg-blue text-white" : "text-ink/60 hover:text-ink"}`}
            >
              EN
            </button>
          </div>
        </nav>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <HiOutlineX size={26} /> : <HiOutlineMenu size={26} />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-black/5 bg-cream md:hidden">
          <Container className="flex flex-col gap-4 py-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="font-medium text-ink/80"
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/book-counseling"
              onClick={() => setOpen(false)}
              className="rounded-full bg-blue px-5 py-2.5 text-center font-semibold text-white"
            >
              {t.nav.bookCounseling}
            </Link>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${language === "id" ? "border-blue bg-blue text-white" : "border-ink/15 text-ink/60"}`}
              >
                Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${language === "en" ? "border-blue bg-blue text-white" : "border-ink/15 text-ink/60"}`}
              >
                English
              </button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
