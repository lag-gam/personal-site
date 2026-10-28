export type MenuGlyph = "briefcase" | "code" | "camera" | "chip" | "sun" | "mail";

export type MenuItem = {
  label: string;
  blurb: string;
  href: string;
  glyph: MenuGlyph;
};

/* The six tiles on the bottom screen, left to right, top to bottom. */
export const menu: MenuItem[] = [
  { label: "Experience", blurb: "Where I've worked.", href: "/#experience", glyph: "briefcase" },
  { label: "Projects", blurb: "Things I've built on my own.", href: "/projects", glyph: "code" },
  { label: "Creative", blurb: "Photos, travel, and making.", href: "/#creative", glyph: "camera" },
  { label: "Technical", blurb: "Hardware, rigs, and builds.", href: "/#technical", glyph: "chip" },
  { label: "Off hours", blurb: "Music, campus, everything else.", href: "/#out-of-office", glyph: "sun" },
  { label: "Contact", blurb: "Say hi.", href: "/#contact", glyph: "mail" },
];

export const GRID = { cols: 3, rows: 2 };
