import { interests, involvements, projects, roles, site } from "@/data/site";

export type Glyph = "briefcase" | "code" | "music" | "camera" | "image" | "chip" | "person" | "mail" | "doc";

/** One row in an app's list (bottom screen) and its detail page (top screen). */
export type Item = {
  title: string;
  /** small line under the title on the top screen */
  subtitle?: string;
  /** right-aligned on the list row, eyebrow on the detail page */
  meta?: string;
  /** paragraphs or bullets on the detail page */
  body?: string[];
  bullets?: boolean;
  tags?: string[];
  /** square art on the detail page, or the whole picture for gallery apps */
  image?: string | null;
  /** gallery clips: plays on the top screen; image is its poster */
  video?: string;
  /** A opens this; external links go to a new tab */
  href?: string;
  hrefLabel?: string;
  /** A steps into these (a playlist's tracks); B steps back out */
  children?: Item[];
  childrenLabel?: string;
};

export type App = {
  id: string;
  label: string;
  blurb: string;
  glyph: Glyph;
  /** list = rows; grid = photo thumbnails; link = the tile itself opens href; camera = live webcam */
  kind: "list" | "grid" | "link" | "camera";
  href?: string;
  items: Item[];
  empty?: string;
};

export type GalleryPhoto = { src: string; caption: string; place?: string; video?: string };

export type NowPlaying = {
  playing: boolean;
  name: string;
  artists: string;
  album: string;
  url: string;
  image: string | null;
} | null;

export type Playlist = {
  id: string;
  name: string;
  description: string;
  url: string;
  image: string | null;
  total: number | null;
  tracks: { name: string; artists: string; album?: string; image?: string | null; url?: string; duration_ms?: number }[];
};

const mmss = (ms?: number) =>
  ms == null ? "" : `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

/* Spotify covers come through Next's image optimizer so they're same-origin and safe to draw into WebGL. */
export const proxied = (url: string | null | undefined, w = 384) =>
  !url ? null : url.startsWith("/") ? url : `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;

export function buildApps(data: {
  creative: GalleryPhoto[];
  playlists: Playlist[];
  now: NowPlaying;
  musicLoaded: boolean;
}): App[] {
  const photo = (p: GalleryPhoto): Item => ({
    title: p.caption,
    meta: p.place,
    image: p.src || null,
    video: p.video,
  });

  const music: Item[] = [];
  if (data.now) {
    music.push({
      title: data.now.name,
      subtitle: data.now.artists,
      meta: data.now.playing ? "Now playing" : "Last played",
      body: [data.now.album],
      image: proxied(data.now.image),
      href: data.now.url,
      hrefLabel: "Open in Spotify",
    });
  }
  for (const p of data.playlists) {
    const tracks: Item[] = p.tracks.map((t) => ({
      title: t.name,
      subtitle: t.artists,
      meta: mmss(t.duration_ms),
      body: t.album ? [t.album] : undefined,
      image: proxied(t.image, 256),
      href: t.url ?? p.url,
      hrefLabel: "Play in Spotify",
    }));
    music.push({
      title: p.name,
      subtitle: p.description || undefined,
      meta: p.total != null ? `${p.total} songs` : "Playlist",
      body: p.tracks.slice(0, 6).map((t) => `${t.name}  ·  ${t.artists}`),
      bullets: true,
      image: proxied(p.image),
      href: p.url,
      hrefLabel: "Open in Spotify",
      children: tracks.length ? tracks : undefined,
      childrenLabel: "See tracks",
    });
  }

  return [
    {
      id: "experience",
      label: "Experience",
      blurb: "Where I've worked.",
      glyph: "briefcase",
      kind: "list",
      items: roles.map((r) => ({
        title: r.title,
        subtitle: r.org,
        meta: r.when,
        body: r.bullets,
        bullets: true,
        image: r.logo,
        href: r.url,
        hrefLabel: r.url ? `Visit ${r.org}` : undefined,
      })),
    },
    {
      id: "music",
      label: "Music",
      blurb: "What I'm listening to.",
      glyph: "music",
      kind: "list",
      items: music,
      empty: data.musicLoaded ? "Couldn\u2019t reach Spotify right now." : "Loading playlists\u2026",
    },
    {
      id: "creative",
      label: "Creative",
      blurb: "Creative Works. Photos and films.",
      glyph: "image",
      kind: "grid",
      items: data.creative.map(photo),
      empty: "No photos yet. Add them to /public/gallery/creative.",
    },
    {
      id: "technical",
      label: "Technical",
      blurb: "Technical Works. Things I've built.",
      glyph: "code",
      kind: "list",
      items: projects.map((p) => ({
        title: p.title,
        subtitle: p.kicker,
        meta: p.kicker.split(" · ")[1] ?? "",
        body: [p.summary, ...(p.detail ? [p.detail] : [])],
        tags: p.stack,
        image: p.image,
        href: p.github ?? p.link?.href,
        hrefLabel: p.github ? "View on GitHub" : p.link?.label,
      })),
    },
    {
      id: "about",
      label: "About",
      blurb: "Campus, and everything else.",
      glyph: "person",
      kind: "list",
      items: [
        ...involvements.map((i) => ({ title: i.role, subtitle: i.org, meta: i.when ?? "" })),
        { title: "Otherwise", subtitle: "What I do for fun", tags: interests },
      ],
    },
    {
      id: "contact",
      label: "Contact",
      blurb: "Say hi.",
      glyph: "mail",
      kind: "list",
      items: [
        { title: "Email", subtitle: site.email, href: `mailto:${site.email}`, hrefLabel: "Write an email" },
        { title: "LinkedIn", subtitle: handle(site.linkedin), href: site.linkedin, hrefLabel: "Open LinkedIn" },
        { title: "GitHub", subtitle: handle(site.github), href: site.github, hrefLabel: "Open GitHub" },
      ],
    },
    {
      id: "resume",
      label: "Resume",
      blurb: "The one-page version.",
      glyph: "doc",
      kind: "link",
      href: site.resume,
      items: [],
    },
    {
      id: "camera",
      label: "Camera",
      blurb: "Say cheese.",
      glyph: "camera",
      kind: "camera",
      items: [],
    },
  ];
}

export const HOME_GRID = { cols: 4, rows: 2 };
export const LIST_ROWS = 6;
export const THUMB_GRID = { cols: 3, rows: 2 };
