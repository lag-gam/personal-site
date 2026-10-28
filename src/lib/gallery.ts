import fs from "node:fs";
import path from "node:path";
import { galleryCaptions, type GalleryCategory } from "@/data/site";

const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;
const VIDEO = /\.(mp4|webm)$/i;
const POSTER = /\.poster\.(jpe?g|png|webp)$/i;

function titleFromFile(file: string) {
  return file
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Lists /public/gallery/<category> at build time, sorted by filename (prefix 01-, 02- to order).
 * A video uses <name>.poster.jpg as its still.
 */
export function readGallery(category: GalleryCategory) {
  const dir = path.join(process.cwd(), "public", "gallery", category);
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).sort();
  } catch {
    return [];
  }
  const url = (f: string) => `/gallery/${category}/${f}`;
  return files
    .filter((f) => (IMAGE.test(f) && !POSTER.test(f)) || VIDEO.test(f))
    .map((file) => {
      const meta = galleryCaptions[file];
      const base = { caption: meta?.caption ?? titleFromFile(file), place: meta?.place };
      if (!VIDEO.test(file)) return { ...base, src: url(file) };
      const stem = file.replace(VIDEO, "");
      const poster = files.find((f) => f.startsWith(`${stem}.poster.`));
      return { ...base, src: poster ? url(poster) : "", video: url(file) };
    });
}
