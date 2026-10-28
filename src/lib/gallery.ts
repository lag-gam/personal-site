import fs from "node:fs";
import path from "node:path";
import { galleryCaptions, type GalleryCategory } from "@/data/site";

const EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

function titleFromFile(file: string) {
  return file
    .replace(EXT, "")
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Lists /public/gallery/<category> at build time, sorted by filename (prefix 01-, 02- to order). */
export function readGallery(category: GalleryCategory) {
  const dir = path.join(process.cwd(), "public", "gallery", category);
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => EXT.test(f)).sort();
  } catch {
    return [];
  }
  return files.map((file) => {
    const meta = galleryCaptions[file];
    return { src: `/gallery/${category}/${file}`, caption: meta?.caption ?? titleFromFile(file), place: meta?.place };
  });
}
