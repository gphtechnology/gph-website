import type { id } from "./id";

export const en: typeof id = {
  nav: {
    about: "About Us",
    services: "Services",
    events: "Events",
    bookCounseling: "Book Counseling",
  },
  hero: {
    badge: "Gigajo Psychological House",
    title: "Your safe home to talk, heal, and grow.",
    subtitle:
      "Head feeling too full, not sure where to even start? GPH is a safe space for counseling, workshops, and a community that supports your mental health.",
    ctaBook: "Book a Session",
    ctaServices: "View Services",
    quote: "Don't keep it all yourself.",
  },
  about: {
    eyebrow: "About Us",
    title: "Gigajo Psychological House",
    paragraph1:
      "GPH was born from Gigajo with one mission: to make mental health support feel closer, warmer, and more accessible — especially for young people. Through private counseling, peer counselors, and a series of workshops and community booths, we believe every story deserves to be heard without judgment.",
    paragraph2:
      "As a trademark of Gigajo, GPH is committed to delivering psychological services that are elegant, personal, and rooted in empathy — both online and through offline community activities.",
    stats: [
      { value: "10+", label: "Peer Counselors & Psychologists" },
      { value: "500+", label: "Counseling Sessions Held" },
      { value: "20+", label: "Events & Workshops" },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "How we accompany your story",
    items: [
      {
        title: "Private Counseling",
        description:
          "One-on-one counseling sessions with experienced psychologists and behavioral therapists, in a confidential and safe space.",
      },
      {
        title: "Peer Counselor",
        description:
          "Chat casually with trained peer counselors — a friend to talk to who's ready to listen without judgment.",
      },
      {
        title: "Workshop & Series",
        description:
          "A series of classes and discussions like 'Single Era: The Series' to learn about yourself and healthy relationships.",
      },
      {
        title: "Community Event",
        description:
          "Offline booths and collaborations at various festivals and communities to widen the safe space for stories.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Their Voices",
    title: "You are not alone",
    quotes: [
      "My head feels so full, I don't even know where to start.",
      "I just need to be heard, not judged.",
      "Turns out it's okay to ask for help first.",
    ],
  },
  eventsPreview: {
    eyebrow: "Latest Events",
    title: "Join GPH's activities",
    viewAll: "View all events →",
  },
  counselingCTA: {
    title: "Ready to start your story?",
    subtitle:
      "Schedule your first counseling session with the GPH team. Tell us what you're feeling — we'll help find the right space and person to listen.",
    cta: "Book Counseling",
  },
  footer: {
    tagline:
      "Gigajo Psychological House — a safe space to talk, get counseling, and grow together. A trademark of Gigajo.",
    explore: "Explore",
    connect: "Connect",
    rights: (year: number) =>
      `© ${year} Gigajo Psychological House. A trademark of Gigajo.`,
  },
  eventsPage: {
    eyebrow: "GPH Events",
    title: "All activities & announcements",
    subtitle:
      "This list is managed directly by the GPH team via Supabase, so it always shows the latest events.",
    loading: "Loading events...",
    registerNow: "Register now →",
  },
  bookCounseling: {
    title: "Book Counseling",
    policyNote:
      "Counseling sessions can only be booked for tomorrow onward (H+1), so the GPH team can prepare your best session.",
    labelCounselor: "Counselor",
    labelDate: "Date",
    labelTime: "Time (WIB)",
    noSlotsAvailable: "This counselor has no open slots on this date. Try another date.",
    labelName: "Name",
    labelEmail: "Email",
    emailHint:
      "The Zoom link will be sent to this email once payment is confirmed.",
    submitting: "Processing...",
    submitWithPrice: (price: string) => `Continue to Payment — Rp${price}`,
    holdingTitle: "Complete payment within",
    holdingSubtitle: "This slot is locked exclusively for you while the timer runs.",
    scanPrefix: "Scan the QRIS above, transfer exactly",
    orTransferManual: "Or transfer manually to this account:",
    bankLabel: "Bank",
    accountNumberLabel: "Account No.",
    accountHolderLabel: "Account Holder",
    uploadLabel: "Upload Payment Proof",
    uploadHint: "Screenshot of your transfer/payment (JPG/PNG).",
    paidButton: "Send Payment Proof",
    errorNoProof: "Upload payment proof before continuing.",
    errorUploadFailed: "Failed to upload payment proof. Please try again.",
    awaitingTitle: "Waiting for GPH team confirmation",
    awaitingPrefix:
      "Your slot is secured. Once we verify your payment, the Zoom link will be sent to",
    awaitingSuffix: ".",
    expiredTitle: "Time's up",
    expiredSubtitle:
      "The slot was released because payment wasn't completed within 3 minutes.",
    retry: "Try Again",
    errorLoadCounselors: "Failed to load counselor list.",
    errorSlotTaken: "This slot was just taken by someone else. Please pick another slot.",
    errorH1Only: "Booking can only be made for tomorrow onward.",
    errorGeneric: "Failed to create booking. Please try again shortly.",
    errorHoldExpired: "The hold has expired. Please book again.",
    notConfigured: "Supabase is not configured yet.",
  },
};
