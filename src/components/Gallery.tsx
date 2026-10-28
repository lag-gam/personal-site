import fs from "node:fs";
import path from "node:path";
import { galleryCaptions, type GalleryCategory } from "@/data/site";
import { GalleryTabs, type GalleryImage } from "./GalleryTabs";

const EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

function titleFromFile(file: string) {
  return file
    .replace(EXT, "")
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function read(category: GalleryCategory): GalleryImage[] {
  const dir = path.join(process.cwd(), "public", "gallery", category);
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => EXT.test(f)).sort();
  } catch {
    return [];
  }
  return files.map((file) => {
    const meta = galleryCaptions[file];
    return {
      src: `/gallery/${category}/${file}`,
      caption: meta?.caption ?? titleFromFile(file),
      place: meta?.place,
    };
  });
}

/* Server half: lists whatever is on disk at build time. No embeds, no third-party scripts. */
export function Gallery({ defaultTab = "creative" }: { defaultTab?: GalleryCategory }) {
  const creative = read("creative");
  const technical = read("technical");
  if (!creative.length && !technical.length && process.env.NODE_ENV === "production") return null;
  return <GalleryTabs creative={creative} technical={technical} defaultTab={defaultTab} />;
}
