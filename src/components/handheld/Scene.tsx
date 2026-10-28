"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { HOME_GRID, THUMB_GRID, type App } from "./apps";
import { SCREEN_H, SCREEN_W, TOP_H, TOP_W, drawBottom, drawTop, hitBottom, level, type View } from "./screens";

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

const SHELL = "#b0121c"; // metallic candy red
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
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    if (typed < GREETING.length) return;
    const id = setInterval(() => setBlink((b) => !b), 550);
    return () => clearInterval(id);
  }, [typed]);

  const face = img("/headshot.jpg");

  const top = useScreenTexture(
    TOP_W,
    TOP_H,
    (ctx) => {
      pagesRef.current = drawTop(ctx, apps, view, now, GREETING.slice(0, typed), typed < GREETING.length || blink, face, img, vid, muted);
    },
    [apps, view, now, typed, blink, version, muted]
  );
  const bottom = useScreenTexture(SCREEN_W, SCREEN_H, (ctx) => drawBottom(ctx, apps, view, img), [apps, view, version]);
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

  const cursor = (on: boolean) => (gl.domElement.style.cursor = on ? "pointer" : "default");

  // mouse hover highlights; a tap on the highlighted thing opens it, so touch is tap to pick, tap to open
  const hover = (e: ThreeEvent<PointerEvent>) => {
    if (!live.current || !e.uv || e.pointerType !== "mouse") return;
    const h = hitBottom(appsRef.current, viewRef.current, e.uv.x, e.uv.y);
    cursor(!!h);
    if (h?.kind === "tile") setView((v) => (v.tile === h.i ? v : { ...v, tile: h.i }));
    if (h?.kind === "row")
      setView((v) => {
        const sel = v.depth ? v.sub : v.item;
        if (sel === h.i) return v;
        return v.depth ? { ...v, sub: h.i, page: 0 } : { ...v, item: h.i, page: 0 };
      });
  };
  const tap = (e: ThreeEvent<MouseEvent>) => {
    if (!live.current || !e.uv) return;
    e.stopPropagation();
    const v = viewRef.current;
    const h = hitBottom(appsRef.current, v, e.uv.x, e.uv.y);
    if (!h) return;
    if (h.kind === "back") return back();
    if (h.kind === "tile") return v.tile === h.i ? enter(h.i) : setView({ ...v, tile: h.i });
    if (h.kind === "row") {
      const sel = v.depth ? v.sub : v.item;
      if (sel === h.i) activate();
      else setView(v.depth ? { ...v, sub: h.i, page: 0 } : { ...v, item: h.i, page: 0 });
    }
  };
  const pad = (e: ThreeEvent<MouseEvent>) => {
    if (!live.current || !padRef.current) return;
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
  const camClosed = useMemo(() => new THREE.Vector3(0, 5.6, 3.3), []);
  const camOpen = useMemo(() => new THREE.Vector3(0, 2.35, 4.6), []);
  const lookClosed = useMemo(() => new THREE.Vector3(0, 0.1, 0.15), []);
  const lookOpen = useMemo(() => new THREE.Vector3(0, 0.5, -0.3), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.get(), 7, dt);
    const p = smooth.current;
    const open = ease(range(p, 0.12, 0.7));
    const turn = ease(range(p, 0, 0.3));
    const power = ease(range(p, 0.42, 0.68));
    live.current = p > 0.66;
    if (!startedRef.current && power > 0.6) {
      startedRef.current = true;
      setStarted(true);
    }

    if (lid.current) lid.current.rotation.x = -THREE.MathUtils.degToRad(OPEN_DEG) * open;

    if (root.current) {
      const px = pointer.x * (0.04 + 0.06 * open);
      const py = pointer.y * 0.03 * open;
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.55 * (1 - turn) + px, 5, dt);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -py, 5, dt);
      root.current.position.y = 0.04 * Math.sin(performance.now() / 1400) * (1 - open * 0.6);
    }

    const aspect = size.width / size.height;
    const fit = Math.max(1, 1.55 / aspect);
    tmp.lerpVectors(camClosed, camOpen, open).multiplyScalar(fit);
    camera.position.copy(tmp);
    look.lerpVectors(lookClosed, lookOpen, open);
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

    if (activeVideo && t - lastFrame.current > 33) {
      lastFrame.current = t;
      top.redraw();
    }

    const c = 0.05 + 0.96 * power;
    topMat.current?.color.setScalar(c);
    botMat.current?.color.setScalar(c);
  });

  /* ---------- materials ---------- */

  // metallic red under a glossy clearcoat, like car paint: metal flake base, mirror coat on top
  const shell = (
    <meshPhysicalMaterial color={SHELL} metalness={0.8} roughness={0.3} clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={1.4} />
  );
  const inner = <meshPhysicalMaterial color={INNER} roughness={0.3} metalness={0.05} clearcoat={0.8} clearcoatRoughness={0.08} />;
  const dark = <meshPhysicalMaterial color={DARK} roughness={0.28} metalness={0.3} clearcoat={1} clearcoatRoughness={0.05} />;

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
        onPointerMove={hover}
        onPointerOut={() => cursor(false)}
        onClick={tap}
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

      {/* hinge barrel */}
      <mesh position={[0, BASE_T + 0.035, -D / 2 + 0.02]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.085, 0.085, W - 0.5, 40]} />
        {shell}
      </mesh>

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
        {/* inner face: bezel and an edge-to-edge top screen */}
        <RoundedBox args={[W - 0.12, 0.01, D - 0.12]} radius={0.004} smoothness={2} position={[0, -0.003, D / 2]}>
          {inner}
        </RoundedBox>
        <mesh position={[0, -0.0095, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 1.3]} />
          <meshBasicMaterial ref={topMat} map={topTex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
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
      <Device progress={progress} apps={apps} onOpen={onOpen} reduced={reduced} />
      <ContactShadows position={[0, -0.001, 0]} opacity={0.85} scale={7} blur={2.2} far={2.5} resolution={1024} color="#000000" />
      <EffectComposer multisampling={4}>
        {/* the white screens are the brightest thing in frame, so they carry the glow */}
        <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.08} intensity={0.32} radius={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
