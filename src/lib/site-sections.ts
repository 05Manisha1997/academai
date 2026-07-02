export const SITE_TAGLINE = "Become AI smart";

export const LEARN_TOPICS = [
  {
    label: "AI Knowledge",
    title: "Know What AI Really Is",
    ctaLabel: "Know AI",
    description:
      "Not buzzwords — real knowledge about how AI learns, why it matters, and how to think about it clearly.",
    href: "/learn/modules/super-smart-puppy-intro",
    icon: "🧠",
    featured: true,
    bullets: [
      "The Super-Smart Puppy story — knowledge that actually sticks",
      "See how machines learn from examples, in plain language",
      "Readable beats you complete at your own pace",
    ],
  },
  {
    label: "Deepfakes & Fake News",
    title: "Spot the Deepfake",
    description: "Spot manipulated media and verify before you trust.",
    href: "/learn/modules/spot-the-deepfake",
    icon: "🎬",
    bullets: [
      "See it — what deepfakes look and sound like",
      "Touch it — compare real vs fake examples",
      "Tweak it — build habits to verify before you share",
    ],
  },
  {
    label: "Data Bias & Fairness",
    title: "Data Bias & Fairness",
    description: "See how training data shapes what AI says and shows.",
    href: "/learn/modules/spot-the-deepfake",
    icon: "⚖️",
    bullets: [
      "How training data shapes AI answers",
      "Spotting unfair assumptions in outputs",
      "Why human judgment still matters",
    ],
  },
  {
    label: "AI + Humans",
    title: "AI + Humans",
    description: "AI assists people — it does not replace judgment.",
    href: "/prevent",
    icon: "🤝",
    bullets: [
      "When to use AI and when to pause",
      "Guardrails and safe prompting",
      "Practice in Prompt Sandbox",
    ],
  },
] as const;
