import { GRID, menu, type MenuGlyph } from "./menu";

export const SCREEN_W = 1024;
export const SCREEN_H = 768;

const FOREST = "#14532d";
const GREEN = "#008751";
const INK = "#18181b";
const FONT = `ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

/* Feather from /public/feather-mark.svg, as Path2D in its 100x100 box. */
const VANE =
  "M77 17 C 62 19, 45 31, 39 52 L 45 50.5 L 37.5 59 C 36.8 61, 36.4 63, 36.2 65 C 52 63, 68 50, 74 32 L 67.5 35 L 75.5 26 C 76.4 23, 76.9 20, 77 17 Z";

export function drawFeather(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fg: string, cut: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.fillStyle = fg;
  ctx.fill(new Path2D(VANE));
  ctx.lineCap = "round";
  ctx.strokeStyle = cut;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(74.5, 20.5);
  ctx.lineTo(38.5, 63.5);
  ctx.stroke();
  ctx.strokeStyle = fg;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(40, 61.5);
  ctx.lineTo(27, 77);
  ctx.stroke();
  ctx.restore();
}

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

export function drawTop(
  ctx: CanvasRenderingContext2D,
  hovered: number,
  now: Date,
  greeting: string,
  caret: boolean
) {
  const g = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
  g.addColorStop(0, "#0f3d26");
  g.addColorStop(1, "#06261a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // soft light bloom, top right
  const r = ctx.createRadialGradient(SCREEN_W * 0.85, SCREEN_H * 0.1, 10, SCREEN_W * 0.85, SCREEN_H * 0.1, SCREEN_W * 0.7);
  r.addColorStop(0, "rgba(0,135,81,0.45)");
  r.addColorStop(1, "rgba(0,135,81,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  drawFeather(ctx, 56, 34, 96, "#ffffff", "#0f3d26");

  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `500 34px ${FONT}`;
  ctx.textAlign = "right";
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  ctx.fillText(`${date}   ${time}`, SCREEN_W - 64, 82);
  ctx.textAlign = "left";

  // typed greeting with a caret
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 120px ${FONT}`;
  ctx.fillText(greeting, 64, 320);
  if (caret) {
    const x = 64 + ctx.measureText(greeting).width + 10;
    ctx.fillStyle = "#3ddc97";
    ctx.fillRect(x, 268, 10, 104);
  }
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `500 44px ${FONT}`;
  ctx.fillText("Agam Iheanyi-Igwe \u00b7 Stanford CS", 64, 420);

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(64, 520, SCREEN_W - 128, 2);

  const item = hovered >= 0 ? menu[hovered] : null;
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 48px ${FONT}`;
  ctx.fillText(item ? item.label : "Pick a section below.", 64, 600);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `400 38px ${FONT}`;
  ctx.fillText(item ? item.blurb : "Tap a tile on the bottom screen.", 64, 670);
}
