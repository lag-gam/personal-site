export type Project = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  detail: string;
  stack: string[];
  github?: string;
  link?: { label: string; href: string };
  /** drop a file in /public/projects and reference it here, e.g. "/projects/omni.png" */
  image?: string;
  /** used for the placeholder frame until a screenshot exists */
  mock: "terminal" | "phone" | "desk" | "bar";
};

export const projects: Project[] = [
  {
    slug: "prediction-desk",
    title: "Prediction Desk",
    kicker: "Personal · 2026",
    summary:
      "A research terminal for Polymarket and Kalshi. It finds mispricings, backtests them against real probability history, and then tries hard to prove the edge isn't real.",
    detail:
      "Every strategy runs three defences before it is believed: out-of-sample on a frozen 70/30 split, a cost sweep to 800bps against the market's real spread, and a luck test against 300 random-entry strategies matched on trade count. The statistical engine is a separate module with no React in it at all, and the agent's tools return both thin JSON for the model and real cards for the person.",
    stack: ["React", "TypeScript", "Vite", "Tailwind", "framer-motion", "recharts", "vitest"],
    github: "https://github.com/lag-gam/prediction-desk",
    mock: "desk",
  },
  {
    slug: "omni",
    title: "Omni",
    kicker: "Personal · In progress",
    summary:
      "A single input that remembers things and answers things. No modes, no buttons — Omni infers whether what you said is worth keeping or is a question about what you already told it.",
    detail:
      "Local-first: notes live in SQLite on your own machine and nothing leaves it except the model calls needed to classify intent and search. Throwaway input is caught by a local pre-filter before any API call. Ask about something it has nothing on and it falls back to general knowledge instead of coming up empty. Wake-word capture over a Raspberry Pi is next.",
    stack: ["Next.js", "TypeScript", "SQLite", "shadcn/ui", "Claude API", "Hugging Face"],
    github: "https://github.com/lag-gam/omni",
    mock: "bar",
  },
  {
    slug: "godela",
    title: "Godela Diagnostics",
    kicker: "Contract work · 2026",
    summary:
      "Contract observability and tracing tooling for Godela (YC X25), a physics-AI simulation platform. On-call engineers were opening five consoles to answer one question; now a job ID answers it.",
    detail:
      "Trace propagation across service boundaries, unified job timelines, and error reporting wired into the same view rather than a separate tool nobody checks. The hard half was never collection — every system already had the data. It was agreeing on an identifier and presenting the result in the order a person reasons about it.",
    stack: ["Python", "Kubernetes", "AWS", "Terraform", "Grafana / Loki", "Sentry"],
    mock: "terminal",
  },
  {
    slug: "neon",
    title: "Neon: Money Talks",
    kicker: "Neon · Winter 2026",
    summary:
      "Frontend and reliability work on a consumer app that pays people for anonymized call data. Peaked at #4 overall in the US App Store with 300K+ downloads.",
    detail:
      "Screens across the auth, onboarding, call and profile flows on Expo Router, with React Query for server state and Reanimated for motion. The interesting bugs on a real-time app are never in the UI — they are in permissions, backgrounding, and what happens when the network drops mid-call.",
    stack: ["React Native", "Expo SDK 54", "React Query", "Reanimated", "i18next", "Daily"],
    mock: "phone",
  },
  {
    slug: "askdolph",
    title: "AskDolph",
    kicker: "Personal · Summer 2025",
    summary:
      "An emotional intelligence app for ambiguous conversations. Upload a screenshot of a thread and it reads the signals in it, then says what it thinks is happening and what you might do next.",
    detail:
      "Output is deliberately fixed at two or three short insights, an optional forecast, and one suggestion — an assistant that answers at essay length is one nobody opens twice. Persistent memory means a new screenshot is read in the context of the ones before it, which was the hardest part to keep bounded.",
    stack: ["React Native", "Expo", "NativeWind", "Supabase", "OpenAI"],
    mock: "phone",
  },
];

export type Role = {
  when: string;
  title: string;
  org: string;
  /** file in /public/logos — swap or add your own */
  logo?: string;
  /** makes the org name a link */
  url?: string;
  bullets: string[];
};

export const roles: Role[] = [
  {
    when: "Jun 2026 — Sep 2026",
    title: "SWE Intern, Infrastructure",
    org: "LinkedIn",
    logo: "/logos/linkedin.png",
    bullets: [
      "Worked on network infrastructure at ring-0 reliability requirements, with CDN and WAF providers, defending the platform against attacks enabled by frontier AI models.",
      "Built observability and agentic integration for infrastructure services alongside the DDoS and Edge & Traffic teams.",
    ],
  },
  {
    when: "Jun 2025 — Aug 2025",
    title: "Software & Product Engineering Intern",
    org: "LinkedIn",
    logo: "/logos/linkedin.png",
    bullets: [
      "Built a tier selection system segmenting users by spending patterns and budget constraints, feeding optimized pricing.",
      "Low-latency backend services in Scala for high-volume tier decisions on the Jobs platform.",
    ],
  },
  {
    when: "Mar 2025 — Present",
    title: "Software Engineer",
    org: "Burton Algorithms",
    logo: "/logos/burton.jpg",
    url: "https://burtonalgorithms.com/",
    bullets: [
      "Contract work building security and observability infrastructure for early-stage startups.",
      "Built observability and tracing tooling across AWS, Kubernetes and Grafana/Loki for Godela (YC X25), a physics-AI simulation platform.",
    ],
  },
  {
    when: "Fall 2026",
    title: "Undergraduate Teaching Assistant, CS193T",
    org: "Stanford CS",
    logo: "/logos/stanford.webp",
    url: "https://web.stanford.edu/class/archive/cs/cs193t/cs193t.1272/",
    bullets: [
      "TA for Thinking with AI, where students spend the quarter building a portfolio-ready AI system for their own field.",
      "Track each student's project end to end as they build with frontier agents, from weekly model comparisons to accuracy safeguards.",
    ],
  },
  {
    when: "2024 — Present",
    title: "Undergraduate Teaching Assistant, CS198",
    org: "Stanford CS",
    logo: "/logos/stanford.webp",
    url: "https://cs198.stanford.edu/web",
    bullets: [
      "TA Stanford's introductory programming and data structures sequence, supporting 900+ students in Python and C++.",
      "Run weekly sections and office hours, and work with faculty on lesson plans, assignments and exams.",
    ],
  },
  {
    when: "Summer 2024",
    title: "Software Development Intern",
    org: "Amazon",
    logo: "/logos/amazon.png",
    bullets: [
      "Eliminated recurring 6-hour processing delays for on-call engineers by detecting, throttling and rerouting large customer orders.",
      "20% increase in large-order processing efficiency, deployed to 100% of customers in all production regions.",
    ],
  },
  {
    when: "Summer 2023",
    title: "AMP Fellow",
    org: "Jane Street",
    logo: "/logos/janestreet.png",
    bullets: [
      "Five-week program in quantitative trading: probability, statistics, game theory, combinatorics and number theory.",
    ],
  },
];

export const site = {
  name: "Agam Iheanyi-Igwe",
  email: "agamnelechim@gmail.com",
  github: "https://github.com/lag-gam",
  linkedin: "https://www.linkedin.com/in/agamiheanyiigwe",
  resume: "/resume.pdf",
  instagram: "",
};

export type MediaItem = {
  /** file in /public/out-of-office */
  src: string;
  type: "image" | "video";
  /** poster frame for videos — also a file in /public/out-of-office */
  poster?: string;
  caption: string;
  place?: string;
};

/**
 * Drop photos and clips into /public/out-of-office and list them here.
 * Anything missing from disk is skipped at render time rather than breaking.
 */
export const gallery: MediaItem[] = [
  { src: "/out-of-office/rio-1.jpg", type: "image", caption: "Rio de Janeiro", place: "Brazil" },
  { src: "/out-of-office/houston-1.jpg", type: "image", caption: "Texas Greek Picnic", place: "Houston" },
  { src: "/out-of-office/sf-1.jpg", type: "image", caption: "Thrifting downtown", place: "San Francisco" },
  { src: "/out-of-office/climb-1.jpg", type: "image", caption: "Midweek climbing session", place: "Bay Area" },
  {
    src: "/out-of-office/travel-vlog-1.mp4",
    type: "video",
    poster: "/out-of-office/travel-vlog-1.jpg",
    caption: "Travel vlog",
  },
];

export type Involvement = {
  role: string;
  org: string;
  when?: string;
};

export const involvements: Involvement[] = [
  { role: "Co-President", org: "NSBE + Black in CS", when: "2023 — Present" },
  { role: "Secretary", org: "Alpha Phi Alpha, Nu Sigma Chapter", when: "2026 — Present" },
  { role: "Section Leader", org: "CS106 / CS198", when: "2024 — Present" },
  { role: "Member", org: "Stanford Robotics Club", when: "2023 — Present" },
  { role: "Ujaama Scholar", org: "Stanford University" },
  { role: "Fellow", org: "Management Leadership for Tomorrow" },
];

export const interests = [
  "Prediction markets",
  "Rock climbing",
  "Thrifting",
  "Vinyl hunting",
  "Manga",
  "Travel vlogs",
  "Venture capital",
];
