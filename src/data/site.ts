export type Project = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  detail?: string;
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
      "Using AR wearables to rebuild Jarvis from Iron Man.",
    stack: [
      "Anthropic Claude",
      "ElevenLabs",
      "n8n",
      "MCP",
      "Hugging Face",
      "whisper.cpp",
      "Next.js",
      "SQLite",
    ],
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
      "Trace propagation across services, unified job timelines, and error reporting in the same view. Every system already had the data; the work was agreeing on an identifier and showing it in the order a person reasons about it.",
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
      "A relationship assistant that keeps a profile of everyone you talk to, so you don't have to. Picking a conversation back up, working out what to say, checking how compatible you actually are.",
    detail:
      "Screenshot a thread and it reads the signals in it, then says what it thinks is happening and what you might do next. Profiles build over time, so each new conversation is read against every one before it.",
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
    when: "Fall 2026",
    title: "Teaching Assistant, CS193T",
    org: "Stanford CS",
    logo: "/logos/stanford.webp",
    url: "https://web.stanford.edu/class/archive/cs/cs193t/cs193t.1272/",
    bullets: [
      "TA for Thinking with AI, where students spend the quarter building a portfolio-ready AI system for their own field.",
      "Track each student's project end to end as they build with frontier agents, from weekly model comparisons to accuracy safeguards.",
    ],
  },
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
    when: "2024 — Present",
    title: "Teaching Assistant, CS198",
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
  /** file in /public/out-of-office, or an Instagram permalink when type is "instagram" */
  src: string;
  type: "image" | "video" | "instagram";
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
  {
    src: "https://www.instagram.com/p/DWwo83Lj1BI/",
    type: "instagram",
    caption: "Yosemite",
  },
  {
    src: "https://www.instagram.com/p/DYefCiavsjE/",
    type: "instagram",
    caption: "Rio de Janeiro",
  },
  {
    src: "https://www.instagram.com/p/C9cys4ovSDQ/",
    type: "instagram",
    caption: "Seattle",
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

/** Shown when the Spotify API isn't reachable. Playlist ID is the part after /playlist/ in a share link. */
export const fallbackPlaylists = [
  { id: "0G2KJ70HBrdOCe1wJgSxec", name: "" },
];
