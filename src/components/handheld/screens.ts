import { HOME_GRID, LIST_ROWS, THUMB_GRID, type App, type Glyph, type Item } from "./apps";

export const SCREEN_W = 1024;
export const SCREEN_H = 768;
/* the top screen fills the whole lid, so it is wider than 4:3 */
export const TOP_W = 1600;
export const TOP_H = 866;

/**
 * What the device is showing. app -1 is home. depth 1 is inside an item's children
 * (a playlist's tracks), with sub as the selection there. page pages long detail text.
 */
export type View = { app: number; tile: number; item: number; depth: 0 | 1; sub: number; page: number };

export type Media = HTMLImageElement | HTMLVideoElement;
export type Img = (src: string | null | undefined) => HTMLImageElement | null;
export type Vid = (src: string | null | undefined) => HTMLVideoElement | null;

/** the list currently on screen: an app's items, or the children of the selected item */
export function level(apps: App[], view: View) {
  const app = apps[view.app];
  if (view.depth === 1) {
    const parent = app.items[view.item];
    return { app, kind: "list" as const, title: parent?.title ?? app.label, items: parent?.children ?? [], sel: view.sub, empty: "Nothing here." };
  }
  return { app, kind: app.kind, title: app.label, items: app.items, sel: view.item, empty: app.empty };
}

const dims = (m: Media) =>
  m instanceof HTMLVideoElement ? { w: m.videoWidth, h: m.videoHeight } : { w: m.width, h: m.height };

const FOREST = "#14532d";
const GREEN = "#008751";
const INK = "#18181b";
const MUTED = "#71717a";
const FAINT = "#a1a1aa";
const FONT = `ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

/* ---------- helpers ---------- */

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
  return t + "…";
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** draw an image covering a box, clipped to a rounded rect */
function cover(ctx: CanvasRenderingContext2D, img: Media, x: number, y: number, w: number, h: number, r: number, contain = false) {
  const d = dims(img);
  if (!d.w || !d.h) return placeholder(ctx, x, y, w, h, r);
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  const s = contain ? Math.min(w / d.w, h / d.h) : Math.max(w / d.w, h / d.h);
  const dw = d.w * s;
  const dh = d.h * s;
  if (contain) {
    ctx.fillStyle = "#f4f4f5";
    ctx.fillRect(x, y, w, h);
  }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function placeholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = "#eef1ef";
  ctx.fill();
}

function glyph(ctx: CanvasRenderingContext2D, g: Glyph, cx: number, cy: number, s: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.085;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const h = s / 2;
  switch (g) {
    case "briefcase":
      rr(ctx, -h, -h * 0.45, s, h * 1.35, s * 0.1);
      ctx.stroke();
      rr(ctx, -h * 0.38, -h * 0.8, h * 0.76, h * 0.35, s * 0.06);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-h, h * 0.15);
      ctx.lineTo(h, h * 0.15);
      ctx.stroke();
      break;
    case "code":
      ctx.beginPath();
      ctx.moveTo(-h * 0.35, -h * 0.6);
      ctx.lineTo(-h, 0);
      ctx.lineTo(-h * 0.35, h * 0.6);
      ctx.moveTo(h * 0.35, -h * 0.6);
      ctx.lineTo(h, 0);
      ctx.lineTo(h * 0.35, h * 0.6);
      ctx.moveTo(h * 0.15, -h * 0.75);
      ctx.lineTo(-h * 0.15, h * 0.75);
      ctx.stroke();
      break;
    case "music":
      ctx.beginPath();
      ctx.moveTo(-h * 0.25, h * 0.55);
      ctx.lineTo(-h * 0.25, -h * 0.75);
      ctx.lineTo(h * 0.7, -h * 0.95);
      ctx.lineTo(h * 0.7, h * 0.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(-h * 0.5, h * 0.58, h * 0.28, h * 0.22, -0.3, 0, Math.PI * 2);
      ctx.ellipse(h * 0.45, h * 0.38, h * 0.28, h * 0.22, -0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "camera":
      rr(ctx, -h, -h * 0.5, s, h * 1.3, s * 0.12);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, h * 0.15, h * 0.38, 0, Math.PI * 2);
      ctx.stroke();
      rr(ctx, -h * 0.35, -h * 0.78, h * 0.7, h * 0.28, s * 0.05);
      ctx.fill();
      break;
    case "chip":
      rr(ctx, -h * 0.6, -h * 0.6, h * 1.2, h * 1.2, s * 0.08);
      ctx.stroke();
      rr(ctx, -h * 0.22, -h * 0.22, h * 0.44, h * 0.44, s * 0.03);
      ctx.fill();
      ctx.beginPath();
      for (const t of [-0.3, 0, 0.3]) {
        ctx.moveTo(t * h, -h * 0.6);
        ctx.lineTo(t * h, -h);
        ctx.moveTo(t * h, h * 0.6);
        ctx.lineTo(t * h, h);
        ctx.moveTo(-h * 0.6, t * h);
        ctx.lineTo(-h, t * h);
        ctx.moveTo(h * 0.6, t * h);
        ctx.lineTo(h, t * h);
      }
      ctx.stroke();
      break;
    case "person":
      ctx.beginPath();
      ctx.arc(0, -h * 0.35, h * 0.38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-h * 0.85, h * 0.9);
      ctx.quadraticCurveTo(-h * 0.8, h * 0.15, 0, h * 0.15);
      ctx.quadraticCurveTo(h * 0.8, h * 0.15, h * 0.85, h * 0.9);
      ctx.stroke();
      break;
    case "mail":
      rr(ctx, -h, -h * 0.65, s, h * 1.3, s * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-h * 0.85, -h * 0.45);
      ctx.lineTo(0, h * 0.15);
      ctx.lineTo(h * 0.85, -h * 0.45);
      ctx.stroke();
      break;
    case "doc":
      ctx.beginPath();
      ctx.moveTo(-h * 0.65, -h);
      ctx.lineTo(h * 0.3, -h);
      ctx.lineTo(h * 0.65, -h * 0.65);
      ctx.lineTo(h * 0.65, h);
      ctx.lineTo(-h * 0.65, h);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      for (const y of [-0.3, 0.1, 0.5]) {
        ctx.moveTo(-h * 0.35, y * h);
        ctx.lineTo(h * 0.35, y * h);
      }
      ctx.stroke();
      break;
  }
  ctx.restore();
}

/** small sound icon for films; the only thing drawn over media */
function speaker(ctx: CanvasRenderingContext2D, x: number, y: number, muted: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(30, 30, 34, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(10, 22);
  ctx.lineTo(20, 22);
  ctx.lineTo(32, 10);
  ctx.lineTo(32, 50);
  ctx.lineTo(20, 38);
  ctx.lineTo(10, 38);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (muted) {
    ctx.moveTo(40, 22);
    ctx.lineTo(54, 38);
    ctx.moveTo(54, 22);
    ctx.lineTo(40, 38);
  } else {
    ctx.arc(36, 30, 10, -0.9, 0.9);
    ctx.moveTo(36 + 18 * Math.cos(-0.9), 30 + 18 * Math.sin(-0.9));
    ctx.arc(36, 30, 18, -0.9, 0.9);
  }
  ctx.stroke();
  ctx.restore();
}

function playBadge(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x + 22, y + 22, 24, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 15, y + 10);
  ctx.lineTo(x + 34, y + 22);
  ctx.lineTo(x + 15, y + 34);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

/* ---------- bottom screen layout (shared by drawing and hit-testing) ---------- */

const PAD_X = 48;
const HEAD = 96;
const GAP = 24;

function homeTile(i: number) {
  const top = 92;
  const w = (SCREEN_W - PAD_X * 2 - GAP * (HOME_GRID.cols - 1)) / HOME_GRID.cols;
  const h = (SCREEN_H - top - 44 - GAP * (HOME_GRID.rows - 1)) / HOME_GRID.rows;
  const c = i % HOME_GRID.cols;
  const r = Math.floor(i / HOME_GRID.cols);
  return { x: PAD_X + c * (w + GAP), y: top + r * (h + GAP), w, h };
}

const BACK = { x: 24, y: 20, w: 168, h: 58 };
const ROW_TOP = HEAD + 12;
const ROW_H = (SCREEN_H - ROW_TOP - 16) / LIST_ROWS;

export function listStart(count: number, item: number) {
  return Math.max(0, Math.min(item - 2, count - LIST_ROWS));
}

function thumbRect(slot: number) {
  const top = ROW_TOP + 4;
  const w = (SCREEN_W - PAD_X * 2 - GAP * (THUMB_GRID.cols - 1)) / THUMB_GRID.cols;
  const h = (SCREEN_H - top - 56 - GAP * (THUMB_GRID.rows - 1)) / THUMB_GRID.rows;
  const c = slot % THUMB_GRID.cols;
  const r = Math.floor(slot / THUMB_GRID.cols);
  return { x: PAD_X + c * (w + GAP), y: top + r * (h + GAP), w, h };
}

const PER_PAGE = THUMB_GRID.cols * THUMB_GRID.rows;

export type Hit = { kind: "tile"; i: number } | { kind: "row"; i: number } | { kind: "back" } | null;

const inside = (x: number, y: number, r: { x: number; y: number; w: number; h: number }) =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/** uv from a raycast (origin bottom-left) to what was touched */
export function hitBottom(apps: App[], view: View, u: number, v: number): Hit {
  const x = u * SCREEN_W;
  const y = (1 - v) * SCREEN_H;
  if (view.app < 0) {
    for (let i = 0; i < apps.length; i++) if (inside(x, y, homeTile(i))) return { kind: "tile", i };
    return null;
  }
  if (inside(x, y, BACK)) return { kind: "back" };
  const lv = level(apps, view);
  if (lv.kind === "grid") {
    const page = Math.floor(lv.sel / PER_PAGE);
    for (let s = 0; s < PER_PAGE; s++) {
      const i = page * PER_PAGE + s;
      if (i < lv.items.length && inside(x, y, thumbRect(s))) return { kind: "row", i };
    }
    return null;
  }
  const start = listStart(lv.items.length, lv.sel);
  for (let k = 0; k < LIST_ROWS; k++) {
    const i = start + k;
    if (i >= lv.items.length) break;
    if (y >= ROW_TOP + k * ROW_H && y < ROW_TOP + (k + 1) * ROW_H && x > 16 && x < SCREEN_W - 16) return { kind: "row", i };
  }
  return null;
}

/* ---------- bottom screen ---------- */

function background(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  g.addColorStop(0, "#f6f8f7");
  g.addColorStop(1, "#ffffff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.fillStyle = "rgba(20,83,45,0.06)";
  for (let y = 24; y < SCREEN_H; y += 32) for (let x = 24; x < SCREEN_W; x += 32) ctx.fillRect(x, y, 3, 3);
}

function header(ctx: CanvasRenderingContext2D, title: string, right: string) {
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillRect(0, 0, SCREEN_W, HEAD);
  ctx.fillStyle = "rgba(0,0,0,0.07)";
  ctx.fillRect(0, HEAD - 2, SCREEN_W, 2);

  rr(ctx, BACK.x, BACK.y, BACK.w, BACK.h, 29);
  ctx.fillStyle = "#f1f3f2";
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = `600 30px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("‹  Back", BACK.x + BACK.w / 2, BACK.y + BACK.h / 2 + 1);
  ctx.font = `700 36px ${FONT}`;
  ctx.fillText(title, SCREEN_W / 2, HEAD / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = FAINT;
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText(right, SCREEN_W - 32, HEAD / 2);
  ctx.textAlign = "left";
}

export function drawBottom(ctx: CanvasRenderingContext2D, apps: App[], view: View, img: Img) {
  background(ctx);
  ctx.textBaseline = "middle";

  if (view.app < 0) {
    ctx.font = `600 28px ${FONT}`;
    ctx.fillStyle = FAINT;
    ctx.fillText("MENU", PAD_X, 50);
    ctx.textAlign = "right";
    ctx.fillText("✚ move   A open", SCREEN_W - PAD_X, 50);
    ctx.textAlign = "left";
    apps.forEach((app, i) => {
      const t = homeTile(i);
      const on = i === view.tile;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.10)";
      ctx.shadowBlur = on ? 26 : 12;
      ctx.shadowOffsetY = on ? 9 : 4;
      rr(ctx, t.x, t.y, t.w, t.h, 30);
      ctx.fillStyle = on ? FOREST : "#ffffff";
      ctx.fill();
      ctx.restore();
      if (!on) {
        rr(ctx, t.x + 1, t.y + 1, t.w - 2, t.h - 2, 29);
        ctx.strokeStyle = "rgba(0,0,0,0.07)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      glyph(ctx, app.glyph, t.x + t.w / 2, t.y + t.h * 0.42, t.h * 0.3, on ? "#ffffff" : GREEN);
      ctx.font = `600 28px ${FONT}`;
      ctx.fillStyle = on ? "#ffffff" : INK;
      ctx.textAlign = "center";
      ctx.fillText(app.label, t.x + t.w / 2, t.y + t.h * 0.8);
      ctx.textAlign = "left";
    });
    return;
  }

  const lv = level(apps, view);
  const items = lv.items;
  const sel = lv.sel;
  const n = items.length;
  header(ctx, fit(ctx, lv.title, 560), n ? `${sel + 1} / ${n}` : "");

  if (!n) {
    ctx.fillStyle = MUTED;
    ctx.font = `500 32px ${FONT}`;
    ctx.textAlign = "center";
    wrap(ctx, lv.empty ?? "Nothing here yet.", SCREEN_W - 200).forEach((l, k) =>
      ctx.fillText(l, SCREEN_W / 2, SCREEN_H / 2 + k * 44)
    );
    ctx.textAlign = "left";
    return;
  }

  if (lv.kind === "grid") {
    const page = Math.floor(sel / PER_PAGE);
    for (let s = 0; s < PER_PAGE; s++) {
      const i = page * PER_PAGE + s;
      if (i >= n) break;
      const r = thumbRect(s);
      const pic = img(items[i].image);
      if (pic) cover(ctx, pic, r.x, r.y, r.w, r.h, 20);
      else placeholder(ctx, r.x, r.y, r.w, r.h, 20);
      if (items[i].video) playBadge(ctx, r.x + r.w - 58, r.y + r.h - 58);
      if (i === sel) {
        rr(ctx, r.x - 6, r.y - 6, r.w + 12, r.h + 12, 26);
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 8;
        ctx.stroke();
      }
    }
    const pages = Math.ceil(n / PER_PAGE);
    for (let p = 0; p < pages; p++) {
      ctx.beginPath();
      ctx.arc(SCREEN_W / 2 + (p - (pages - 1) / 2) * 28, SCREEN_H - 28, 7, 0, Math.PI * 2);
      ctx.fillStyle = p === page ? GREEN : "#d4d4d8";
      ctx.fill();
    }
    return;
  }

  const start = listStart(n, sel);
  for (let k = 0; k < LIST_ROWS; k++) {
    const i = start + k;
    if (i >= n) break;
    const it = items[i];
    const y = ROW_TOP + k * ROW_H;
    const on = i === sel;
    if (on) {
      rr(ctx, 20, y + 6, SCREEN_W - 40, ROW_H - 12, 22);
      ctx.fillStyle = FOREST;
      ctx.fill();
    } else if (k > 0) {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(PAD_X, y, SCREEN_W - PAD_X * 2, 2);
    }
    let tx = PAD_X;
    const pic = img(it.image);
    if (it.image) {
      const s = ROW_H - 34;
      if (pic) cover(ctx, pic, tx, y + 17, s, s, 12, lv.app.id === "experience");
      else placeholder(ctx, tx, y + 17, s, s, 12);
      tx += s + 22;
    }
    ctx.font = `500 26px ${FONT}`;
    const meta = it.meta ?? "";
    const mw = meta ? ctx.measureText(meta).width + 28 : 0;
    ctx.textAlign = "right";
    ctx.fillStyle = on ? "rgba(255,255,255,0.7)" : FAINT;
    if (meta) ctx.fillText(meta, SCREEN_W - PAD_X, y + ROW_H / 2);
    ctx.textAlign = "left";
    const lineMax = SCREEN_W - PAD_X - tx - mw;
    if (it.subtitle) {
      ctx.font = `600 32px ${FONT}`;
      ctx.fillStyle = on ? "#ffffff" : INK;
      ctx.fillText(fit(ctx, it.title, lineMax), tx, y + ROW_H / 2 - 17);
      ctx.font = `500 25px ${FONT}`;
      ctx.fillStyle = on ? "rgba(255,255,255,0.7)" : MUTED;
      ctx.fillText(fit(ctx, it.subtitle, lineMax), tx, y + ROW_H / 2 + 20);
    } else {
      ctx.font = `600 32px ${FONT}`;
      ctx.fillStyle = on ? "#ffffff" : INK;
      ctx.fillText(fit(ctx, it.title, lineMax), tx, y + ROW_H / 2);
    }
  }
  // scroll indicator
  if (n > LIST_ROWS) {
    const track = SCREEN_H - ROW_TOP - 24;
    const h = Math.max(40, (track * LIST_ROWS) / n);
    const y = ROW_TOP + 8 + ((track - h) * start) / (n - LIST_ROWS);
    rr(ctx, SCREEN_W - 12, y, 5, h, 3);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fill();
  }
}

/* ---------- top screen ---------- */

const X = 96;

function status(ctx: CanvasRenderingContext2D, label: string, now: Date) {
  const g = ctx.createLinearGradient(0, 0, 0, TOP_H);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#f1f4f2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TOP_W, TOP_H);
  ctx.textBaseline = "middle";
  ctx.fillStyle = FAINT;
  ctx.font = `500 32px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(label.toUpperCase(), X, 72);
  ctx.textAlign = "right";
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  ctx.fillText(`${date}   ${time}`, TOP_W - X, 72);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(0,0,0,0.07)";
  ctx.fillRect(X, 114, TOP_W - X * 2, 2);
}

function footer(ctx: CanvasRenderingContext2D, parts: string[]) {
  ctx.fillStyle = "rgba(0,0,0,0.07)";
  ctx.fillRect(X, 768, TOP_W - X * 2, 2);
  ctx.font = `600 32px ${FONT}`;
  let x = X;
  for (const p of parts) {
    const [key, ...rest] = p.split(" ");
    const label = rest.join(" ");
    rr(ctx, x, 796, 46, 46, 23);
    ctx.fillStyle = key === "A" ? GREEN : "#3f3f46";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(key, x + 23, 820);
    ctx.textAlign = "left";
    ctx.fillStyle = MUTED;
    ctx.fillText(label, x + 62, 820);
    x += 62 + ctx.measureText(label).width + 56;
  }
}

function chips(ctx: CanvasRenderingContext2D, tags: string[], x0: number, y0: number, maxX: number, maxY: number) {
  ctx.font = `500 30px ${FONT}`;
  let x = x0;
  let y = y0;
  for (const t of tags) {
    const w = ctx.measureText(t).width + 40;
    if (x + w > maxX) {
      x = x0;
      y += 62;
    }
    if (y > maxY) break;
    rr(ctx, x, y - 25, w, 50, 25);
    ctx.fillStyle = "#eef3f0";
    ctx.fill();
    ctx.fillStyle = FOREST;
    ctx.fillText(t, x + 20, y + 1);
    x += w + 14;
  }
  return y + 62;
}

function home(ctx: CanvasRenderingContext2D, greeting: string, caret: boolean, face: HTMLImageElement | null) {
  const size = 560;
  const fy = 168;
  if (face) cover(ctx, face, X, fy, size, size, 48);
  else placeholder(ctx, X, fy, size, size, 48);
  rr(ctx, X, fy, size, size, 48);
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 3;
  ctx.stroke();

  const tx = X + size + 72;
  ctx.fillStyle = INK;
  ctx.font = `700 118px ${FONT}`;
  ctx.fillText(greeting, tx, 390);
  if (caret) {
    const x = tx + ctx.measureText(greeting).width + 12;
    ctx.fillStyle = GREEN;
    ctx.fillRect(x, 340, 11, 102);
  }
  ctx.fillStyle = MUTED;
  ctx.font = `500 44px ${FONT}`;
  ctx.fillText("Stanford CS.", tx, 496);
  ctx.fillText("Infrastructure and security.", tx, 552);
  ctx.fillStyle = FAINT;
  ctx.font = `500 32px ${FONT}`;
  ctx.fillText("Use the d-pad, or tap a tile below.", tx, 690);
}

/** home, with a tile selected: just the app's name, and how to open it */
function preview(ctx: CanvasRenderingContext2D, app: App) {
  ctx.fillStyle = INK;
  ctx.font = `700 168px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(app.label, TOP_W / 2, 430);
  ctx.textAlign = "left";
  footer(ctx, ["A Open"]);
}

/** returns how many pages the detail text needs, so the d-pad knows how far left/right can go */
function detail(ctx: CanvasRenderingContext2D, apps: App[], view: View, img: Img, vid: Vid, muted: boolean): number {
  const lv = level(apps, view);
  const it: Item | undefined = lv.items[lv.sel];
  if (!it) {
    ctx.fillStyle = FAINT;
    ctx.font = `500 40px ${FONT}`;
    ctx.fillText(lv.empty ?? "Nothing here yet.", X, 300);
    footer(ctx, ["B Back"]);
    return 1;
  }

  // gallery: the photo or film fills the whole screen, nothing on top of it
  if (lv.kind === "grid") {
    const v = it.video ? vid(it.video) : null;
    const media: Media | null = v && v.readyState >= 2 ? v : img(it.image);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, TOP_W, TOP_H);
    if (media) cover(ctx, media, 0, 0, TOP_W, TOP_H, 0);
    if (it.video) speaker(ctx, TOP_W - 92, TOP_H - 92, muted);
    return 1;
  }

  let tx = X;
  const pic = img(it.image);
  if (it.image) {
    const sz = 360;
    if (pic) cover(ctx, pic, X, 160, sz, sz, 32, lv.app.id === "experience");
    else placeholder(ctx, X, 160, sz, sz, 32);
    tx = X + sz + 64;
  }
  const maxW = TOP_W - X - tx;

  let y = 186;
  if (it.meta) {
    ctx.fillStyle = GREEN;
    ctx.font = `600 32px ${FONT}`;
    ctx.fillText(fit(ctx, it.meta, maxW), tx, y);
    y += 70;
  } else y += 30;
  ctx.fillStyle = INK;
  ctx.font = `700 76px ${FONT}`;
  ctx.fillText(fit(ctx, it.title, maxW), tx, y);
  y += 72;
  if (it.subtitle) {
    ctx.fillStyle = MUTED;
    ctx.font = `500 40px ${FONT}`;
    ctx.fillText(fit(ctx, it.subtitle, maxW), tx, y);
    y += 74;
  } else y += 20;

  // lay out body lines, then show the requested page of them
  const bottom = 740;
  const LH = 48;
  ctx.font = `400 34px ${FONT}`;
  const indent = it.bullets ? 34 : 0;
  type Line = { text: string; bullet: boolean; gap: number };
  const lines: Line[] = [];
  for (const para of it.body ?? []) {
    wrap(ctx, para, maxW - indent).forEach((text, k) => lines.push({ text, bullet: !!it.bullets && k === 0, gap: 0 }));
    if (lines.length) lines[lines.length - 1].gap = it.bullets ? 8 : 18;
  }
  const perPage = Math.max(1, Math.floor((bottom - y) / LH));
  const pages = Math.max(1, Math.ceil(lines.length / perPage) + (it.tags?.length && lines.length % perPage > perPage - 2 ? 1 : 0));
  const page = Math.min(view.page, pages - 1);
  const slice = lines.slice(page * perPage, (page + 1) * perPage);
  ctx.fillStyle = "#3f3f46";
  for (const l of slice) {
    if (l.bullet) {
      ctx.beginPath();
      ctx.arc(tx + 8, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = GREEN;
      ctx.fill();
      ctx.fillStyle = "#3f3f46";
    }
    ctx.fillText(l.text, tx + indent, y);
    y += LH + l.gap;
  }
  if (it.tags?.length && page === pages - 1 && y < bottom) chips(ctx, it.tags, tx, y + 14, TOP_W - X, bottom);

  const parts: string[] = [];
  if (it.children?.length) parts.push(`A ${it.childrenLabel ?? "Open"}`);
  else if (it.href) parts.push(`A ${it.hrefLabel ?? "Open"}`);
  parts.push("B Back");
  footer(ctx, parts);
  if (pages > 1) {
    ctx.font = `600 32px ${FONT}`;
    ctx.fillStyle = FAINT;
    ctx.textAlign = "right";
    ctx.fillText(`\u25C0  ${page + 1} / ${pages}  \u25B6`, TOP_W - X, 820);
    ctx.textAlign = "left";
  }
  return pages;
}

export function drawTop(
  ctx: CanvasRenderingContext2D,
  apps: App[],
  view: View,
  now: Date,
  greeting: string,
  caret: boolean,
  face: HTMLImageElement | null,
  img: Img,
  vid: Vid,
  muted: boolean
): number {
  if (view.app < 0) {
    const app = view.tile >= 0 ? apps[view.tile] : null;
    status(ctx, "Agam Iheanyi-Igwe", now);
    if (app) preview(ctx, app);
    else home(ctx, greeting, caret, face);
    return 1;
  }
  const app = apps[view.app];
  if (app.kind === "grid") return detail(ctx, apps, view, img, vid, muted);
  status(ctx, view.depth ? `${app.label}  \u203A  ${apps[view.app].items[view.item]?.title ?? ""}` : app.label, now);
  return detail(ctx, apps, view, img, vid, muted);
}
