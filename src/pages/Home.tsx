import { Hero } from "../components/sections/Hero";
import { About } from "../components/sections/About";
import { Services } from "../components/sections/Services";
import { EventsPreview } from "../components/sections/EventsPreview";
import { Testimonials } from "../components/sections/Testimonials";
import { CounselingCTA } from "../components/sections/CounselingCTA";

export function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <EventsPreview />
      <Testimonials />
      <CounselingCTA />
    </>
  );
}
