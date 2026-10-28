import { interests, projects, roles, site } from "@/data/site";

export type MenuGlyph = "briefcase" | "code" | "camera" | "chip" | "sun" | "mail";

export type MenuItem = {
  label: string;
  blurb: string;
  href: string;
  glyph: MenuGlyph;
  /** rows shown on the top screen while this tile is selected: [primary, secondary] */
  rows: [string, string][];
};

const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

/* The six tiles on the bottom screen, left to right, top to bottom. */
export const menu: MenuItem[] = [
  {
    label: "Experience",
    blurb: "Where I've worked.",
    href: "/#experience",
    glyph: "briefcase",
    rows: roles.slice(0, 4).map((r) => [`${r.title}, ${r.org}`, r.when]),
  },
  {
    label: "Projects",
    blurb: "Things I've built on my own.",
    href: "/projects",
    glyph: "code",
    rows: projects.slice(0, 4).map((p) => [p.title, p.kicker]),
  },
  {
    label: "Creative",
    blurb: "Photos, travel, and making.",
    href: "/#creative",
    glyph: "camera",
    rows: [
      ["Creative Works", "Gallery"],
      ["Travel and photography", ""],
    ],
  },
  {
    label: "Technical",
    blurb: "Hardware, rigs, and builds.",
    href: "/#technical",
    glyph: "chip",
    rows: [
      ["Technical Works", "Gallery"],
      ["Builds, boards, and setups", ""],
    ],
  },
  {
    label: "Off hours",
    blurb: "Music, campus, everything else.",
    href: "/#out-of-office",
    glyph: "sun",
    rows: [
      ["What I'm listening to", "Spotify"],
      ["On campus", "NSBE, Alpha Phi Alpha"],
      [interests.slice(0, 4).join(", "), ""],
    ],
  },
  {
    label: "Contact",
    blurb: "Say hi.",
    href: "/#contact",
    glyph: "mail",
    rows: [
      [site.email, "Email"],
      [handle(site.linkedin), "LinkedIn"],
      [handle(site.github), "GitHub"],
    ],
  },
];

export const GRID = { cols: 3, rows: 2 };
