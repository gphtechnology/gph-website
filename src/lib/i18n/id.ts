export const id = {
  nav: {
    about: "Tentang Kami",
    services: "Layanan",
    events: "Event",
    bookCounseling: "Book Counseling",
  },
  hero: {
    badge: "Gigajo Psychological House",
    title: "Rumah aman untuk cerita, sembuh, dan bertumbuh.",
    subtitle:
      "Kepala penuh banget, bingung harus mulai cerita darimana? GPH hadir sebagai ruang aman untuk konseling, workshop, dan komunitas yang mendukung kesehatan mentalmu.",
    ctaBook: "Booking Sesi",
    ctaServices: "Lihat Layanan",
    quote: "Jangan dipendam sendiri.",
  },
  about: {
    eyebrow: "Tentang Kami",
    title: "Gigajo Psychological House",
    paragraph1:
      "GPH lahir dari Gigajo dengan satu misi: membuat dukungan kesehatan mental terasa lebih dekat, hangat, dan mudah diakses — khususnya untuk anak muda. Lewat private counseling, peer counselor, dan rangkaian workshop maupun booth komunitas, kami percaya bahwa setiap cerita layak didengar tanpa dihakimi.",
    paragraph2:
      "Sebagai trademark dari Gigajo, GPH berkomitmen menghadirkan layanan psikologis yang elegan, personal, dan berbasis empati — baik secara online maupun lewat kegiatan offline di komunitas.",
    stats: [
      { value: "10+", label: "Peer Counselor & Psikolog" },
      { value: "500+", label: "Sesi Konseling Terselenggara" },
      { value: "20+", label: "Event & Workshop" },
    ],
  },
  services: {
    eyebrow: "Layanan",
    title: "Cara kami menemani ceritamu",
    items: [
      {
        title: "Private Counseling",
        description:
          "Sesi konseling one-on-one bersama psikolog dan behavioral therapist berpengalaman, dalam ruang yang rahasia dan aman.",
      },
      {
        title: "Peer Counselor",
        description:
          "Ngobrol santai dengan peer counselor terlatih — teman cerita yang siap mendengarkan tanpa menghakimi.",
      },
      {
        title: "Workshop & Series",
        description:
          "Rangkaian kelas dan diskusi seperti 'Single Era: The Series' untuk belajar memahami diri dan hubungan yang sehat.",
      },
      {
        title: "Community Event",
        description:
          "Booth dan kolaborasi offline di berbagai festival serta komunitas untuk memperluas ruang cerita yang aman.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Suara Mereka",
    title: "Kamu tidak sendirian",
    quotes: [
      "Kepala penuh banget, bingung harus mulai cerita darimana.",
      "Aku cuma butuh didengar, bukan dihakimi.",
      "Ternyata boleh, kok, minta tolong duluan.",
    ],
  },
  eventsPreview: {
    eyebrow: "Event Terbaru",
    title: "Ikuti kegiatan GPH",
    viewAll: "Lihat semua event →",
  },
  counselingCTA: {
    title: "Siap untuk mulai cerita?",
    subtitle:
      "Jadwalkan sesi konseling pertamamu bersama tim GPH. Ceritakan apa yang kamu rasakan — kami akan bantu carikan ruang dan orang yang tepat untuk mendengarkan.",
    cta: "Book Counseling",
  },
  footer: {
    tagline:
      "Gigajo Psychological House — ruang aman untuk cerita, konseling, dan tumbuh bersama. A trademark of Gigajo.",
    explore: "Jelajahi",
    connect: "Terhubung",
    rights: (year: number) =>
      `© ${year} Gigajo Psychological House. A trademark of Gigajo.`,
  },
  eventsPage: {
    eyebrow: "Event GPH",
    title: "Semua kegiatan & pengumuman",
    subtitle:
      "Daftar ini dikelola langsung oleh tim GPH lewat Supabase, jadi selalu menampilkan event terbaru.",
    loading: "Memuat event...",
    registerNow: "Daftar sekarang →",
  },
  bookCounseling: {
    title: "Book Counseling",
    policyNote:
      "Booking sesi konseling hanya bisa dilakukan untuk besok atau setelahnya (H+1), supaya tim GPH bisa menyiapkan sesi terbaikmu.",
    labelCounselor: "Konselor",
    labelDate: "Tanggal",
    labelTime: "Jam (WIB)",
    labelName: "Nama",
    labelEmail: "Email",
    emailHint:
      "Link Zoom akan dikirim ke email ini setelah pembayaran dikonfirmasi.",
    submitting: "Memproses...",
    submitWithPrice: (price: string) => `Lanjut ke Pembayaran — Rp${price}`,
    holdingTitle: "Selesaikan pembayaran dalam",
    holdingSubtitle: "Slot ini dikunci khusus untukmu selama waktu berjalan.",
    scanPrefix: "Scan QRIS di atas, transfer tepat",
    paidButton: "Saya Sudah Bayar",
    awaitingTitle: "Menunggu konfirmasi tim GPH",
    awaitingPrefix:
      "Slotmu sudah diamankan. Setelah pembayaran kami verifikasi, link Zoom akan dikirim ke",
    awaitingSuffix: ".",
    expiredTitle: "Waktu habis",
    expiredSubtitle:
      "Slot dilepas kembali karena pembayaran tidak diselesaikan dalam 90 detik.",
    retry: "Coba Lagi",
    errorLoadCounselors: "Gagal memuat daftar konselor.",
    errorSlotTaken: "Slot ini baru saja diambil orang lain. Coba pilih slot lain.",
    errorH1Only: "Booking hanya bisa dilakukan untuk besok atau setelahnya.",
    errorGeneric: "Gagal membuat booking. Coba lagi sebentar.",
    errorHoldExpired: "Waktu hold sudah habis. Silakan booking ulang.",
    notConfigured: "Supabase belum dikonfigurasi.",
  },
};
