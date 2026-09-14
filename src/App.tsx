import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { BookCounseling } from "./pages/BookCounseling";
import { Events } from "./pages/Events";
import { Admin } from "./pages/Admin";
import { Counselor } from "./pages/Counselor";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/book-counseling" element={<BookCounseling />} />
          <Route path="/events" element={<Events />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
        <Route path="/counselor" element={<Counselor />} />
      </Routes>
    </>
  );
}

export default App;
