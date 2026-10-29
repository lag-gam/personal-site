"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { HOME_GRID, THUMB_GRID, type App } from "./apps";
import { taglines } from "@/data/site";
import { MONO_FAMILY, SCREEN_H, SCREEN_W, TOP_H, TOP_W, cameraFrame, drawBottom, drawTop, level, type CamStatus, type View } from "./screens";

/*
  An original dual-screen clamshell, and the whole site lives on it.
  Scroll progress drives the opening:
    0.00 – 0.12  closed, lid up, slow turn toward the viewer
    0.12 – 0.70  lid swings open, screens power on, camera drops to the front
    0.70 – 1.00  open and still; the device is live
  Then: d-pad or arrows move, A or Enter opens, B or Esc goes back, taps work everywhere.
*/

const W = 2.6; // width
const D = 1.5; // depth of each half
const BASE_T = 0.15;
const LID_T = 0.11;
const OPEN_DEG = 112;
const FLAT_DEG = 180;

const SHELL = "#b8161f"; // matte red
const INNER = "#121314"; // glossy black bezel
const DARK = "#1d1e20";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

function useScreenTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, deps: unknown[]) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }, [w, h]);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const redraw = useCallback(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawRef.current(ctx);
    texture.needsUpdate = true;
  }, [canvas, texture]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(redraw, deps);
  return { texture, redraw };
}

/** one muted, looping <video> per clip; only the selected one plays */
function useVideos() {
  const cache = useRef(new Map<string, HTMLVideoElement>());
  const [, bump] = useState(0);
  const vid = useCallback((src: string | null | undefined) => {
    if (!src) return null;
    let v = cache.current.get(src);
    if (!v) {
      v = document.createElement("video");
      v.src = src;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = "auto";
      v.addEventListener("loadeddata", () => bump((n) => n + 1), { once: true });
      cache.current.set(src, v);
    }
    return v;
  }, []);
  const playOnly = useCallback((src: string | null, muted: boolean) => {
    cache.current.forEach((v, k) => {
      if (k === src) {
        v.muted = muted;
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }, []);
  return { vid, playOnly };
}

/** lazy image cache; bumps a version whenever something finishes loading so screens redraw */
function useImages() {
  const cache = useRef(new Map<string, HTMLImageElement | "loading" | "failed">());
  const [version, setVersion] = useState(0);
  const img = useCallback((src: string | null | undefined) => {
    if (!src) return null;
    const hit = cache.current.get(src);
    if (hit instanceof HTMLImageElement) return hit;
    if (!hit) {
      cache.current.set(src, "loading");
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        cache.current.set(src, im);
        setVersion((v) => v + 1);
      };
      im.onerror = () => cache.current.set(src, "failed");
      im.src = src;
    }
    return null;
  }, []);
  return { img, version };
}

/** the computer's camera, only while the Camera app is open; stopped the moment you leave */
function useCamera(active: boolean) {
  const [status, setStatus] = useState<CamStatus>("off");
  const video = useMemo(() => {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    return v;
  }, []);
  useEffect(() => {
    if (!active) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    let alive = true;
    let stream: MediaStream | null = null;
    setStatus("starting");
    navigator.mediaDevices
      .getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }, audio: false })
      .then((s) => {
        if (!alive) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        video.srcObject = s;
        return video.play().then(() => alive && setStatus("live"));
      })
      .catch(() => alive && setStatus("denied"));
    return () => {
      alive = false;
      stream?.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
      setStatus("off");
    };
  }, [active, video]);
  return { video, status };
}

const GREETING = "Hi, I’m Agam";

function useCross() {
  return useMemo(() => {
    const a = 0.052; // arm half-width
    const L = 0.16; // arm half-length
    const s = new THREE.Shape();
    s.moveTo(-a, -L);
    s.lineTo(a, -L);
    s.lineTo(a, -a);
    s.lineTo(L, -a);
    s.lineTo(L, a);
    s.lineTo(a, a);
    s.lineTo(a, L);
    s.lineTo(-a, L);
    s.lineTo(-a, a);
    s.lineTo(-L, a);
    s.lineTo(-L, -a);
    s.lineTo(-a, -a);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.026,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.008,
      bevelSegments: 4,
      curveSegments: 4,
    });
    g.rotateX(-Math.PI / 2); // extrude upward
    return g;
  }, []);
}

function Device({
  progress,
  apps,
  onOpen,
  reduced,
}: {
  progress: MotionValue<number>;
  apps: App[];
  onOpen: (href: string) => void;
  reduced: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const topMat = useRef<THREE.MeshBasicMaterial>(null);
  const botMat = useRef<THREE.MeshBasicMaterial>(null);
  const smooth = useRef(progress.get());
  const live = useRef(false);
  const { camera, pointer, size, gl } = useThree();
  const { img, version } = useImages();
  const cross = useCross();

  const HOME: View = { app: -1, tile: -1, item: 0, depth: 0, sub: 0, page: 0 };
  const [view, setView] = useState<View>(HOME);
  const { vid, playOnly } = useVideos();
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const pagesRef = useRef(1);

  const camOn = view.app >= 0 && apps[view.app]?.kind === "camera";
  const cam = useCamera(camOn);
  const camRef = useRef(cam);
  camRef.current = cam;
  const flashAt = useRef(-1e9);
  const [shots, setShots] = useState<HTMLCanvasElement[]>([]);
  const snap = () => {
    if (camRef.current.status !== "live") return;
    const src = cameraFrame();
    const c = document.createElement("canvas");
    c.width = src.width;
    c.height = src.height;
    c.getContext("2d")!.drawImage(src, 0, 0);
    flashAt.current = performance.now();
    setShots((s) => [c, ...s].slice(0, 4));
  };
  const viewRef = useRef(view);
  viewRef.current = view;
  const appsRef = useRef(apps);
  appsRef.current = apps;

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // greeting types out on the top screen once it powers on
  const [typed, setTyped] = useState(reduced ? GREETING.length : 0);
  const [started, setStarted] = useState(reduced);
  const startedRef = useRef(reduced);
  useEffect(() => {
    if (!started || typed >= GREETING.length) return;
    const id = setTimeout(() => setTyped((t) => t + 1), typed === 0 ? 350 : 95);
    return () => clearTimeout(id);
  }, [typed, started]);
  // under the greeting: type a tagline, hold, backspace, next one, forever (only while the greeting is showing)
  const onGreeting = view.app < 0 && view.tile < 0;
  const greetingDone = typed >= GREETING.length;
  const [tag, setTag] = useState({ i: 0, n: reduced ? taglines[0].length : 0, del: false });
  useEffect(() => {
    if (!onGreeting || !greetingDone || !taglines.length) return;
    const word = taglines[tag.i % taglines.length];
    let delay: number;
    let next: typeof tag;
    if (reduced) {
      delay = 2600;
      const i = (tag.i + 1) % taglines.length;
      next = { i, n: taglines[i].length, del: false };
    } else if (!tag.del) {
      if (tag.n < word.length) [delay, next] = [65 + Math.random() * 50, { ...tag, n: tag.n + 1 }];
      else [delay, next] = [1700, { ...tag, del: true }];
    } else if (tag.n > 0) [delay, next] = [32, { ...tag, n: tag.n - 1 }];
    else [delay, next] = [320, { i: (tag.i + 1) % taglines.length, n: 0, del: false }];
    const id = setTimeout(() => setTag(next), delay);
    return () => clearTimeout(id);
  }, [tag, onGreeting, greetingDone, reduced]);
  const tagText = taglines.length ? taglines[tag.i % taglines.length].slice(0, tag.n) : "";
  const tagHolding = !tag.del && tag.n === (taglines[tag.i % taglines.length]?.length ?? 0);

  const [blink, setBlink] = useState(true);
  useEffect(() => {
    if (typed < GREETING.length) return;
    const id = setInterval(() => setBlink((b) => !b), 550);
    return () => clearInterval(id);
  }, [typed]);

  const face = img("/headshot.jpg");

  // canvas text only uses a web font once it has loaded, so load every weight we draw with, then redraw
  const [fontsReady, setFontsReady] = useState(0);
  useEffect(() => {
    if (!document.fonts) return;
    Promise.all(["400", "700"].map((w) => document.fonts.load(`${w} 40px "${MONO_FAMILY}"`)))
      .then(() => setFontsReady((n) => n + 1))
      .catch(() => {});
  }, []);

  const top = useScreenTexture(
    TOP_W,
    TOP_H,
    (ctx) => {
      pagesRef.current = drawTop(
        ctx,
        apps,
        view,
        now,
        GREETING.slice(0, typed),
        !greetingDone,
        face,
        img,
        vid,
        muted,
        { video: cam.video, status: cam.status, flash: performance.now() - flashAt.current },
        { text: tagText, caret: greetingDone && (!tagHolding || blink) }
      );
    },
    [apps, view, now, typed, blink, version, muted, fontsReady, cam.status, tagText, tagHolding]
  );
  const bottom = useScreenTexture(SCREEN_W, SCREEN_H, (ctx) => drawBottom(ctx, apps, view, img, shots), [apps, view, version, fontsReady, shots]);
  const topTex = top.texture;
  const botTex = bottom.texture;

  // the selected clip in a gallery plays on the top screen; everything else pauses
  const activeVideo = (() => {
    if (view.app < 0) return null;
    const lv = level(apps, view);
    return lv.kind === "grid" ? lv.items[lv.sel]?.video ?? null : null;
  })();
  useEffect(() => playOnly(activeVideo, muted), [activeVideo, muted, playOnly]);
  const lastFrame = useRef(0);

  /* ---------- navigation ---------- */

  const padRef = useRef<THREE.Group>(null);
  const padPress = useRef({ dx: 0, dz: 0, t: -1e9 });
  const btnRefs = useRef<(THREE.Group | null)[]>([]);
  const btnPress = useRef<number[]>([-1e9, -1e9]);
  const press = (k: number) => (btnPress.current[k] = performance.now());

  const enter = (i: number) => {
    const app = appsRef.current[i];
    if (!app) return;
    if (app.kind === "link") {
      if (app.href) onOpen(app.href);
      setView((v) => ({ ...v, tile: i }));
    } else setView({ ...HOME, app: i, tile: i });
  };

  const move = (dx: number, dy: number) => {
    padPress.current = { dx, dz: dy, t: performance.now() };
    setView((v) => {
      if (v.app < 0) {
        if (v.tile < 0) return { ...v, tile: 0 };
        const c = (v.tile % HOME_GRID.cols + dx + HOME_GRID.cols) % HOME_GRID.cols;
        const r = (Math.floor(v.tile / HOME_GRID.cols) + dy + HOME_GRID.rows) % HOME_GRID.rows;
        return { ...v, tile: Math.min(r * HOME_GRID.cols + c, appsRef.current.length - 1) };
      }
      const lv = level(appsRef.current, v);
      const n = lv.items.length;
      if (!n) return v;
      // long detail text: left/right turn pages
      if (lv.kind !== "grid" && dx && pagesRef.current > 1) return { ...v, page: clamp(v.page + dx, 0, pagesRef.current - 1) };
      const step = lv.kind === "grid" ? dx + dy * THUMB_GRID.cols : dy || dx;
      const next = clamp(lv.sel + step, 0, n - 1);
      return v.depth ? { ...v, sub: next, page: 0 } : { ...v, item: next, page: 0 };
    });
  };

  const activate = () => {
    if (!live.current) return;
    const v = viewRef.current;
    if (v.app < 0) {
      if (v.tile >= 0) enter(v.tile);
      else setView({ ...v, tile: 0 });
      return;
    }
    if (appsRef.current[v.app]?.kind === "camera") return snap();
    const lv = level(appsRef.current, v);
    const it = lv.items[lv.sel];
    if (!it) return;
    if (!v.depth && it.children?.length) setView({ ...v, depth: 1, sub: 0, page: 0 });
    else if (it.video) setMuted((m) => !m);
    else if (it.href) onOpen(it.href);
  };

  const back = () =>
    setView((v) =>
      v.depth ? { ...v, depth: 0, page: 0 } : v.app >= 0 ? { ...HOME, tile: v.app } : { ...v, tile: -1 }
    );

  // keys work anywhere once the device is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!live.current || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "ArrowLeft") move(-1, 0);
      else if (k === "ArrowRight") move(1, 0);
      else if (k === "ArrowUp") move(0, -1);
      else if (k === "ArrowDown") move(0, 1);
      else if (k === "Enter" || k === "a" || k === "A") {
        press(1);
        activate();
      } else if (k === "Escape" || k === "Backspace" || k === "b" || k === "B") {
        press(0);
        back();
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cursor = (on: boolean) => (gl.domElement.style.cursor = on ? "pointer" : "grab");

  const pad = (e: ThreeEvent<MouseEvent>) => {
    if (!live.current || !padRef.current || e.delta > 6) return; // a drag that started here rotates, not presses
    e.stopPropagation();
    const p = padRef.current.worldToLocal(e.point.clone());
    if (Math.abs(p.x) > Math.abs(p.z)) move(p.x > 0 ? 1 : -1, 0);
    else move(0, p.z > 0 ? 1 : -1);
  };
  const hoverable = {
    onPointerOver: () => live.current && cursor(true),
    onPointerOut: () => cursor(false),
  };

  const labels = useMemo(
    () =>
      ["B", "A"].map((ch) => {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const x = c.getContext("2d")!;
        x.fillStyle = "rgba(255,255,255,0.85)";
        x.font = `700 72px ui-sans-serif, -apple-system, "Inter", sans-serif`;
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText(ch, 64, 70);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      }),
    []
  );

  /* ---------- animation ---------- */

  const look = useMemo(() => new THREE.Vector3(), []);
  // three camera stops: closed, open, and flat (looking straight down at both screens)
  const camClosed = useMemo(() => new THREE.Vector3(0, 4.0, 2.4), []);
  const camOpen = useMemo(() => new THREE.Vector3(0, 1.72, 3.18), []);
  const camFlat = useMemo(() => new THREE.Vector3(0, 5.55, -0.2), []);
  const lookClosed = useMemo(() => new THREE.Vector3(0, 0.1, 0.15), []);
  const lookOpen = useMemo(() => new THREE.Vector3(0, 0.5, -0.3), []);
  const lookFlat = useMemo(() => new THREE.Vector3(0, 0, -0.75), []);
  const tmp2 = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.get(), 7, dt);
    const p = smooth.current;
    const open = ease(range(p, 0.1, 0.55));
    const flat = ease(range(p, 0.72, 0.97));
    const turn = ease(range(p, 0, 0.3));
    const power = ease(range(p, 0.32, 0.52));
    live.current = p > 0.5;
    if (!startedRef.current && power > 0.6) {
      startedRef.current = true;
      setStarted(true);
    }

    if (lid.current)
      lid.current.rotation.x = -THREE.MathUtils.degToRad(OPEN_DEG * open + (FLAT_DEG - OPEN_DEG) * flat);

    if (root.current) {
      const px = pointer.x * (0.04 + 0.06 * open) * (1 - 0.7 * flat);
      const py = pointer.y * 0.03 * open * (1 - 0.7 * flat);
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.55 * (1 - turn) + px, 5, dt);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -py, 5, dt);
      root.current.position.y = 0.04 * Math.sin(performance.now() / 1400) * (1 - open * 0.6);
    }

    const aspect = size.width / size.height;
    // narrow screens pull the camera back along its line of sight
    const fit = Math.max(1, 1.6 / aspect);
    look.lerpVectors(lookClosed, lookOpen, open).lerp(lookFlat, flat);
    tmp.lerpVectors(camClosed, camOpen, open).lerp(camFlat, flat);
    tmp2.subVectors(tmp, look).multiplyScalar(fit);
    camera.position.copy(look).add(tmp2);
    camera.lookAt(look);

    // press feedback: pad tips toward the arm pressed, buttons sink
    const t = performance.now();
    const kp = Math.max(0, 1 - (t - padPress.current.t) / 180);
    if (padRef.current) {
      padRef.current.rotation.z = -padPress.current.dx * 0.14 * kp;
      padRef.current.rotation.x = padPress.current.dz * 0.14 * kp;
    }
    btnRefs.current.forEach((g, k) => {
      if (g) g.position.y = BASE_T - 0.014 * Math.max(0, 1 - (t - btnPress.current[k]) / 160);
    });

    if ((activeVideo || camRef.current.status === "live") && t - lastFrame.current > 33) {
      lastFrame.current = t;
      top.redraw();
    }

    const c = 0.05 + 0.96 * power;
    topMat.current?.color.setScalar(c);
    botMat.current?.color.setScalar(c);
  });

  /* ---------- materials ---------- */

  // matte red: a satin finish with a little metal in it, soft highlights instead of mirror ones
  const shell = (
    <meshPhysicalMaterial color={SHELL} metalness={0.35} roughness={0.58} clearcoat={0.12} clearcoatRoughness={0.7} envMapIntensity={0.9} />
  );
  const inner = <meshPhysicalMaterial color={INNER} roughness={0.62} metalness={0.05} clearcoat={0.1} clearcoatRoughness={0.8} />;
  const dark = <meshPhysicalMaterial color={DARK} roughness={0.55} metalness={0.1} clearcoat={0.15} clearcoatRoughness={0.7} />;

  return (
    <group ref={root}>
      {/* base */}
      <RoundedBox args={[W, BASE_T, D]} radius={0.06} smoothness={5} position={[0, BASE_T / 2, 0]} castShadow receiveShadow>
        {shell}
      </RoundedBox>
      {/* bottom screen bezel and glass */}
      <RoundedBox args={[1.64, 0.012, 1.25]} radius={0.005} smoothness={2} position={[0, BASE_T + 0.004, 0.02]} receiveShadow>
        {inner}
      </RoundedBox>
      <mesh
        position={[0, BASE_T + 0.0115, 0.02]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.52, 1.14]} />
        <meshBasicMaterial ref={botMat} map={botTex} toneMapped={false} />
      </mesh>

      {/* d-pad: one extruded cross, so there are no overlapping faces to flicker */}
      <mesh position={[-1.07, BASE_T + 0.003, 0.05]} receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.006, 48]} />
        {inner}
      </mesh>
      <group ref={padRef} position={[-1.07, BASE_T + 0.012, 0.05]} onClick={pad} {...hoverable}>
        <mesh geometry={cross} castShadow>
          {dark}
        </mesh>
      </group>

      {/* A and B */}
      {[
        { x: 0.98, z: 0.1, label: "B" },
        { x: 1.15, z: -0.06, label: "A" },
      ].map((btn, k) => (
        <group
          key={btn.label}
          ref={(g) => {
            btnRefs.current[k] = g;
          }}
          position={[btn.x, BASE_T, btn.z]}
          onClick={(e) => {
            e.stopPropagation();
            if (e.delta > 6) return;
            press(k);
            if (btn.label === "A") activate();
            else back();
          }}
          {...hoverable}
        >
          <mesh position={[0, 0.0175, 0]} castShadow>
            <cylinderGeometry args={[0.072, 0.072, 0.035, 40]} />
            {dark}
          </mesh>
          <mesh position={[0, 0.0356, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshBasicMaterial map={labels[k]} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[1.07, BASE_T + 0.008, 0.5]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.18, 0.012, 0.05]} />
        {dark}
      </mesh>

      {/* hinge barrel, with the camera, mic and status lights set into its face */}
      <mesh position={[0, BASE_T + 0.035, -D / 2 + 0.02]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.085, 0.085, W - 0.5, 40]} />
        {shell}
      </mesh>
      <group position={[0, BASE_T + 0.035, -D / 2 + 0.02]} rotation={[-0.55, 0, 0]}>
        <mesh position={[0, 0, 0.082]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.036, 0.036, 0.014, 40]} />
          <meshPhysicalMaterial color="#0d0e0f" roughness={0.35} clearcoat={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.021, 0.021, 0.006, 40]} />
          <meshPhysicalMaterial color="#03040a" roughness={0.04} metalness={0.3} clearcoat={1} clearcoatRoughness={0} envMapIntensity={2} />
        </mesh>
        {/* camera light: green while the camera is in use */}
        <mesh position={[0.075, 0, 0.084]}>
          <sphereGeometry args={[0.007, 16, 16]} />
          <meshBasicMaterial color={cam.status === "live" ? "#3dff8a" : "#1a1c1b"} toneMapped={false} />
        </mesh>
        {/* mic */}
        <mesh position={[0.17, 0, 0.084]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.004, 16]} />
          <meshBasicMaterial color="#050505" />
        </mesh>
        {/* status lights */}
        {(["#ffd23d", "#3db8ff", "#3db8ff"] as const).map((c, i) => (
          <mesh key={i} position={[-0.86 + i * 0.05, 0, 0.083]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.02, 0.006, 0.026]} />
            <meshBasicMaterial color={c} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* lid: pivots on the hinge line */}
      <group ref={lid} position={[0, BASE_T + 0.045, -D / 2]}>
        <RoundedBox args={[W, LID_T, D]} radius={0.05} smoothness={5} position={[0, LID_T / 2, D / 2]} castShadow receiveShadow>
          {shell}
        </RoundedBox>
        {/* outer face: one small plastic disc in the front corner */}
        <mesh position={[W / 2 - 0.2, LID_T + 0.003, D - 0.2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.006, 48]} />
          <meshPhysicalMaterial color="#1a1b1d" roughness={0.42} metalness={0} clearcoat={0.25} clearcoatRoughness={0.5} />
        </mesh>
        {/* inner face: a screen the same size as the bottom one, red side bezels with speakers */}
        <RoundedBox args={[1.64, 0.01, 1.25]} radius={0.005} smoothness={2} position={[0, -0.003, D / 2]}>
          {inner}
        </RoundedBox>
        <mesh position={[0, -0.0095, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.52, 1.14]} />
          <meshBasicMaterial ref={topMat} map={topTex} toneMapped={false} />
        </mesh>
        {[-1, 1].map((sx) => (
          <RoundedBox key={sx} args={[0.13, 0.006, 0.026]} radius={0.012} smoothness={3} position={[sx * 1.06, -0.001, D / 2]}>
            <meshPhysicalMaterial color="#141516" roughness={0.6} />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}

/*
  Drag (mouse, trackpad click, or one finger) to rotate; a sideways two-finger swipe spins it.
  Vertical scrolling is left alone, so it still opens and flattens the device. Double-click resets.
*/
function Spin({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const target = useRef({ yaw: 0, pitch: 0 });
  const { gl } = useThree();
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "pan-y"; // the browser keeps vertical touch scrolling
    el.style.cursor = "grab";
    let drag: { id: number; x: number; y: number } | null = null;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      target.current.yaw += dx * 0.005;
      if (e.pointerType !== "touch") target.current.pitch = clamp(target.current.pitch + dy * 0.004, -0.7, 0.7);
      if (Math.abs(dx) + Math.abs(dy) > 0) el.style.cursor = "grabbing";
    };
    const up = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.id) drag = null;
      if (el.style.cursor === "grabbing") el.style.cursor = "grab";
    };
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return; // vertical: let the page scroll
      e.preventDefault();
      target.current.yaw -= e.deltaX * 0.003;
    };
    const reset = () => (target.current = { yaw: 0, pitch: 0 });
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("dblclick", reset);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("dblclick", reset);
    };
  }, [gl]);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, target.current.yaw, 8, dt);
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, target.current.pitch, 8, dt);
  });
  return <group ref={g}>{children}</group>;
}

export default function Scene({
  progress,
  apps,
  onOpen,
  reduced = false,
}: {
  progress: MotionValue<number>;
  apps: App[];
  onOpen: (href: string) => void;
  reduced?: boolean;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 34, near: 0.1, far: 50, position: [0, 5.6, 3.3] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[2.5, 6, 3.5]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.5} />
      {/* studio light built in-scene, no HDR download */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} scale={[8, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[-5, 2, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[5, 2, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={3} position={[2.5, 4, -3]} scale={[1.2, 6, 1]} rotation={[0.6, -0.6, 0]} />
        <Lightformer form="rect" intensity={3} position={[-2.5, 4, -3]} scale={[1.2, 6, 1]} rotation={[0.6, 0.6, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#dfe8e2" position={[0, -3, 0]} scale={[10, 10, 1]} rotation-x={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.4} color="#ffd9d6" position={[0, 1.5, -6]} scale={4} />
      </Environment>
      <Spin>
        <Device progress={progress} apps={apps} onOpen={onOpen} reduced={reduced} />
      </Spin>
      {/* no ground shadow: it's a flat sheet at floor level, and tilting the device pushed parts of it
          through the sheet, which darkened them along a hard line. On a black stage it showed nothing anyway. */}
      <EffectComposer multisampling={4}>
        {/* the white screens are the brightest thing in frame, so they carry the glow */}
        <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.08} intensity={0.32} radius={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
