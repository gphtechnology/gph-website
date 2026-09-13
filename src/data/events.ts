export type GphEvent = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO datetime, wall-clock WIB (no timezone offset)
  location: string; // e.g. "Online via Zoom" or a venue name
  registrationUrl?: string;
  imageUrl?: string;
};

/**
 * Placeholder events shown until the `events` table in Supabase is
 * connected (see src/lib/supabaseClient.ts). Once wired up, replace
 * this with a fetch from Supabase so admins can manage announcements
 * without a code change.
 */
export const placeholderEvents: GphEvent[] = [
  {
    id: "single-era-3",
    title: "Single Era: The Series Part 3 — How to Choose the Right Partner?",
    description:
      "Sesi bareng GPH untuk belajar mengevaluasi hubungan yang sehat dan memilih pasangan dengan lebih sadar diri.",
    date: "2026-10-04T19:00:00",
    location: "Online via Zoom",
  },
  {
    id: "hear-me-out-fest",
    title: "Offline Booth at Hear Me Out Fest",
    description:
      "GPH hadir dengan booth konsultasi singkat bareng Amanat Research Institute — jangan dipendam sendiri, yuk cerita.",
    date: "2026-09-20T13:00:00",
    location: "Hear Me Out Fest",
  },
];
