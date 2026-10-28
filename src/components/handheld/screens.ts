import { GRID, menu, type MenuGlyph } from "./menu";

export const SCREEN_W = 1024;
export const SCREEN_H = 768;
/* the top screen fills the whole lid, so it is wider than 4:3 */
export const TOP_W = 1600;
export const TOP_H = 866;

const FOREST = "#14532d";
const GREEN = "#008751";
const INK = "#18181b";
const FONT = `ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function glyph(ctx: CanvasRenderingContext2D, g: MenuGlyph, cx: number, cy: number, s: number, color: string) {
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
    case "sun":
      ctx.beginPath();
      ctx.arc(0, 0, h * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.moveTo(Math.cos(a) * h * 0.68, Math.sin(a) * h * 0.68);
        ctx.lineTo(Math.cos(a) * h * 0.95, Math.sin(a) * h * 0.95);
      }
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
  }
  ctx.restore();
}

/* Tile rects in canvas px, shared by drawing and hit-testing. */
const PAD_X = 64;
const PAD_TOP = 92;
const PAD_BOTTOM = 56;
const GAP = 32;

export function tileRect(i: number) {
  const w = (SCREEN_W - PAD_X * 2 - GAP * (GRID.cols - 1)) / GRID.cols;
  const h = (SCREEN_H - PAD_TOP - PAD_BOTTOM - GAP * (GRID.rows - 1)) / GRID.rows;
  const c = i % GRID.cols;
  const r = Math.floor(i / GRID.cols);
  return { x: PAD_X + c * (w + GAP), y: PAD_TOP + r * (h + GAP), w, h };
}

/** uv from a raycast (origin bottom-left) to a tile index, or -1. */
export function hitTile(u: number, v: number) {
  const x = u * SCREEN_W;
  const y = (1 - v) * SCREEN_H;
  for (let i = 0; i < menu.length; i++) {
    const t = tileRect(i);
    if (x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) return i;
  }
  return -1;
}

export function drawBottom(ctx: CanvasRenderingContext2D, hovered: number) {
  const g = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  g.addColorStop(0, "#f3f7f4");
  g.addColorStop(1, "#ffffff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // faint dot field
  ctx.fillStyle = "rgba(20,83,45,0.07)";
  for (let y = 24; y < SCREEN_H; y += 32) for (let x = 24; x < SCREEN_W; x += 32) ctx.fillRect(x, y, 3, 3);

  ctx.font = `600 30px ${FONT}`;
  ctx.fillStyle = "#71717a";
  ctx.textBaseline = "middle";
  ctx.fillText("MENU", PAD_X, 50);
  ctx.textAlign = "right";
  ctx.fillText(`${menu.length} sections`, SCREEN_W - PAD_X, 50);
  ctx.textAlign = "left";

  menu.forEach((item, i) => {
    const t = tileRect(i);
    const on = i === hovered;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.10)";
    ctx.shadowBlur = on ? 28 : 14;
    ctx.shadowOffsetY = on ? 10 : 5;
    rr(ctx, t.x, t.y, t.w, t.h, 34);
    ctx.fillStyle = on ? FOREST : "#ffffff";
    ctx.fill();
    ctx.restore();
    if (!on) {
      rr(ctx, t.x + 1, t.y + 1, t.w - 2, t.h - 2, 33);
      ctx.strokeStyle = "rgba(0,0,0,0.07)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    glyph(ctx, item.glyph, t.x + t.w / 2, t.y + t.h * 0.42, t.h * 0.34, on ? "#ffffff" : GREEN);
    ctx.font = `600 34px ${FONT}`;
    ctx.fillStyle = on ? "#ffffff" : INK;
    ctx.textAlign = "center";
    ctx.fillText(item.label, t.x + t.w / 2, t.y + t.h * 0.8);
    ctx.textAlign = "left";
  });
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "\u2026").width > max) t = t.slice(0, -1);
  return t + "\u2026";
}

export function drawTop(
  ctx: CanvasRenderingContext2D,
  selected: number,
  now: Date,
  greeting: string,
  caret: boolean,
  face: HTMLImageElement | null
) {
  const g = ctx.createLinearGradient(0, 0, 0, TOP_H);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#f1f4f2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TOP_W, TOP_H);

  const X = 96;
  ctx.textBaseline = "middle";

  // status bar
  ctx.fillStyle = "#a1a1aa";
  ctx.font = `500 34px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("AGAM IHEANYI-IGWE", X, 76);
  ctx.textAlign = "right";
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  ctx.fillText(`${date}   ${time}`, TOP_W - X, 76);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(0,0,0,0.07)";
  ctx.fillRect(X, 122, TOP_W - X * 2, 2);

  const item = selected >= 0 ? menu[selected] : null;

  if (!item) {
    // home: my face first, the greeting typing beside it
    const size = 560;
    const fy = 180;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(X, fy, size, size, 48);
    ctx.clip();
    if (face) {
      const s = Math.min(face.width, face.height);
      ctx.drawImage(face, (face.width - s) / 2, (face.height - s) / 2, s, s, X, fy, size, size);
    } else {
      ctx.fillStyle = "#e4e4e7";
      ctx.fillRect(X, fy, size, size);
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(X, fy, size, size, 48);
    ctx.stroke();

    const tx = X + size + 72;
    ctx.fillStyle = INK;
    ctx.font = `700 118px ${FONT}`;
    ctx.fillText(greeting, tx, 400);
    if (caret) {
      const x = tx + ctx.measureText(greeting).width + 12;
      ctx.fillStyle = GREEN;
      ctx.fillRect(x, 350, 11, 102);
    }
    ctx.fillStyle = "#71717a";
    ctx.font = `500 44px ${FONT}`;
    ctx.fillText("Stanford CS.", tx, 506);
    ctx.fillText("Infrastructure and security.", tx, 562);
    ctx.fillStyle = "#a1a1aa";
    ctx.font = `500 34px ${FONT}`;
    ctx.fillText("Use the d-pad or tap a tile below.", tx, 700);
    return;
  }

  // section preview: title and blurb on top, full-width rows below
  ctx.fillStyle = GREEN;
  ctx.font = `600 32px ${FONT}`;
  ctx.fillText(`${String(selected + 1).padStart(2, "0")} / ${String(menu.length).padStart(2, "0")}`, X, 196);
  ctx.fillStyle = INK;
  ctx.font = `700 100px ${FONT}`;
  ctx.fillText(item.label, X, 282);
  const tw = ctx.measureText(item.label).width;
  ctx.fillStyle = "#71717a";
  ctx.font = `500 44px ${FONT}`;
  ctx.fillText(fit(ctx, item.blurb, TOP_W - X * 2 - tw - 40), X + tw + 36, 292);

  const top = 392;
  const step = item.rows.length > 3 ? 82 : 100;
  item.rows.forEach(([primary, secondary], i) => {
    const y = top + i * step;
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(X, y - step / 2, TOP_W - X * 2, 2);
    ctx.font = `500 34px ${FONT}`;
    const sw = secondary ? ctx.measureText(secondary).width + 48 : 0;
    ctx.fillStyle = "#a1a1aa";
    ctx.textAlign = "right";
    if (secondary) ctx.fillText(secondary, TOP_W - X, y);
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = `600 42px ${FONT}`;
    ctx.fillText(fit(ctx, primary, TOP_W - X * 2 - sw), X, y);
  });

  ctx.fillStyle = FOREST;
  ctx.font = `600 36px ${FONT}`;
  ctx.fillText("Tap again or press A to open.  B to go back.", X, 790);
}
