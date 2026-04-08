const MALLOW_WHATSAPP_PHONE = "919990709988";
const MALLOW_WHATSAPP_INTRO_LINK =
  `https://wa.me/${MALLOW_WHATSAPP_PHONE}?text=${encodeURIComponent(
    "Hello, I would like to learn more about MallowMauve collections. Kindly assist.",
  )}`;

window.MALLOW_SITE_CONFIG = {
  whatsappPhone: MALLOW_WHATSAPP_PHONE,
  whatsappIntroLink: MALLOW_WHATSAPP_INTRO_LINK,
  content: {
    collections: "/public/src/content/collections.json",
    productsBase: "/public/src/content/products",
  },
  masterHero: {
    image: "/public/collections/master-hero.jpg",
    alt: "A softly lit interior with embroidered cushions and layered textiles.",
    eyebrow: "Collections",
    title: "A Curation of Quiet Luxury",
    description:
      "Textiles for rooms, rituals, and quieter living, composed with warmth, craftsmanship, and a slower sense of home.",
    primaryCta: {
      label: "Explore Collections",
      href: "#collections",
    },
    secondaryCta: {
      label: "Connect on WhatsApp",
      href: MALLOW_WHATSAPP_INTRO_LINK,
    },
    position: "center center",
  },
  craftIntro: {
    media: {
      type: "video",
      video: "/public/media/videos/mallowmauve-craft.mp4",
      poster: "",
      alt: "A mapped craft film showing Kashmiri textile work in progress.",
      position: "58% 42%",
      playbackRate: 0.72,
      approved: true,
    },
    pendingText: "Mapped craft film required to complete this section.",
  },
};
