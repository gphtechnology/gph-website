import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { Logo } from "./Logo";
import { Container } from "./Container";

const navLinks = [
  { label: "Tentang Kami", href: "/#about" },
  { label: "Layanan", href: "/#services" },
  { label: "Event", href: "/events" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

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
            Book Counseling
          </Link>
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
              Book Counseling
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
