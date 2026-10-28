"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { menu } from "./menu";
import { GRID } from "./menu";
import { SCREEN_H, SCREEN_W, TOP_H, TOP_W, drawBottom, drawTop, hitTile } from "./screens";

/*
  An original dual-screen clamshell. Scroll progress drives one timeline:
    0.00 – 0.12  closed, lid up, slow turn toward the viewer
    0.12 – 0.70  lid swings open, screens power on, camera drops to the front
    0.70 – 1.00  open and still; the bottom screen is a live menu
*/

const W = 2.6; // width
const D = 1.5; // depth of each half
const BASE_T = 0.15;
const LID_T = 0.11;
const OPEN_DEG = 112;

const SHELL = "#b0121c"; // metallic candy red
const INNER = "#121314"; // glossy black bezel
const DARK = "#1d1e20";
const ACCENT = "#ffd9d6";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
  useEffect(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    draw(ctx);
    texture.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return texture;
}

const GREETING = "Hi, I\u2019m Agam";

function Device({
  progress,
  onNavigate,
  reduced,
}: {
  progress: MotionValue<number>;
  onNavigate: (href: string) => void;
  reduced: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const topMat = useRef<THREE.MeshBasicMaterial>(null);
  const botMat = useRef<THREE.MeshBasicMaterial>(null);
  const smooth = useRef(progress.get());
  // selected tile: drives both screens; -1 is the home greeting
  const [sel, setSel] = useState(-1);
  const selRef = useRef(-1);
  selRef.current = sel;
  const [now, setNow] = useState(() => new Date());
  const live = useRef(false);
  // greeting types out on the top screen once it powers on
  const [typed, setTyped] = useState(reduced ? GREETING.length : 0);
  const [started, setStarted] = useState(reduced);
  const startedRef = useRef(reduced);
  const { camera, pointer, size, gl } = useThree();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!started || typed >= GREETING.length) return;
    const id = setTimeout(() => setTyped((t) => t + 1), typed === 0 ? 350 : 95);
    return () => clearTimeout(id);
  }, [typed, started]);

  // caret blink after typing finishes
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    if (typed < GREETING.length) return;
    const id = setInterval(() => setBlink((b) => !b), 550);
    return () => clearInterval(id);
  }, [typed]);

  const topTex = useScreenTexture(
    TOP_W,
    TOP_H,
    (ctx) => drawTop(ctx, sel, now, GREETING.slice(0, typed), typed < GREETING.length || blink),
    [sel, now, typed, blink]
  );
  const botTex = useScreenTexture(SCREEN_W, SCREEN_H, (ctx) => drawBottom(ctx, sel), [sel]);

  // d-pad / arrow-key movement around the 3x2 grid
  const move = (dx: number, dy: number) =>
    setSel((s) => {
      if (s < 0) return 0;
      const c = (s % GRID.cols + dx + GRID.cols) % GRID.cols;
      const r = (Math.floor(s / GRID.cols) + dy + GRID.rows) % GRID.rows;
      return r * GRID.cols + c;
    });
  const open = () => {
    if (live.current && selRef.current >= 0) onNavigate(menu[selRef.current].href);
  };

  // the canvas takes focus on click, then arrows move, Enter or A opens, Escape or B goes home
  useEffect(() => {
    const el = gl.domElement;
    el.tabIndex = 0;
    el.style.outline = "none";
    el.setAttribute("aria-label", "Handheld menu. Use arrow keys to choose a section and Enter to open it.");
    const onKey = (e: KeyboardEvent) => {
      if (!live.current) return;
      const k = e.key;
      if (k === "ArrowLeft") move(-1, 0);
      else if (k === "ArrowRight") move(1, 0);
      else if (k === "ArrowUp") move(0, -1);
      else if (k === "ArrowDown") move(0, 1);
      else if (k === "Enter" || k === "a" || k === "A") open();
      else if (k === "Escape" || k === "b" || k === "B") setSel(-1);
      else return;
      e.preventDefault();
    };
    const focus = () => el.focus({ preventScroll: true });
    el.addEventListener("keydown", onKey);
    el.addEventListener("pointerdown", focus);
    return () => {
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("pointerdown", focus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

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
      // pointer parallax, stronger once open
      const px = pointer.x * (0.04 + 0.08 * open);
      const py = pointer.y * 0.04 * open;
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.55 * (1 - turn) + px, 5, dt);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -py, 5, dt);
      root.current.position.y = 0.04 * Math.sin(performance.now() / 1400) * (1 - open * 0.6);
    }

    // fit the open device to narrow screens by pulling the camera back
    const aspect = size.width / size.height;
    const fit = Math.max(1, 1.55 / aspect);
    tmp.lerpVectors(camClosed, camOpen, open).multiplyScalar(fit);
    camera.position.copy(tmp);
    look.lerpVectors(lookClosed, lookOpen, open);
    camera.lookAt(look);

    const c = 0.05 + 0.96 * power;
    topMat.current?.color.setScalar(c);
    botMat.current?.color.setScalar(c);
  });

  const cursor = (on: boolean) => (gl.domElement.style.cursor = on ? "pointer" : "default");

  // mouse hover previews a section; touch has no hover, so the first tap previews
  const pick = (e: ThreeEvent<PointerEvent>) => {
    if (!live.current || !e.uv || e.pointerType !== "mouse") return;
    const i = hitTile(e.uv.x, e.uv.y);
    if (i >= 0) setSel(i);
    cursor(i >= 0);
  };
  const tap = (e: ThreeEvent<MouseEvent>) => {
    if (!live.current || !e.uv) return;
    e.stopPropagation();
    const i = hitTile(e.uv.x, e.uv.y);
    if (i < 0) return;
    const mouse = (e.nativeEvent as PointerEvent).pointerType === "mouse";
    if (mouse || selRef.current === i) onNavigate(menu[i].href);
    else setSel(i);
  };
  const pad = (e: ThreeEvent<MouseEvent>) => {
    if (!live.current) return;
    e.stopPropagation();
    const p = e.object.worldToLocal(e.point.clone());
    if (Math.abs(p.x) > Math.abs(p.z)) move(p.x > 0 ? 1 : -1, 0);
    else move(0, p.z > 0 ? 1 : -1);
  };
  const hoverable = {
    onPointerOver: () => live.current && cursor(true),
    onPointerOut: () => cursor(false),
  };

  // metallic red under a glossy clearcoat, like car paint: metal flake base, mirror coat on top
  const shell = (
    <meshPhysicalMaterial
      color={SHELL}
      metalness={0.8}
      roughness={0.3}
      clearcoat={1}
      clearcoatRoughness={0.03}
      envMapIntensity={1.4}
    />
  );
  const inner = <meshPhysicalMaterial color={INNER} roughness={0.3} metalness={0.05} clearcoat={0.8} clearcoatRoughness={0.08} />;
  const dark = <meshPhysicalMaterial color={DARK} roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.1} />;

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
        onPointerMove={pick}
        onPointerOut={() => cursor(false)}
        onClick={tap}
      >
        <planeGeometry args={[1.52, 1.14]} />
        <meshBasicMaterial ref={botMat} map={botTex} toneMapped={false} />
      </mesh>

      {/* controls: an original layout, round pad left, two keys right */}
      <mesh position={[-1.07, BASE_T + 0.01, 0.05]} castShadow onClick={pad} {...hoverable}>
        <cylinderGeometry args={[0.165, 0.165, 0.025, 48]} />
        {inner}
      </mesh>
      <mesh position={[-1.07, BASE_T + 0.028, 0.05]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.015, 32]} />
        {dark}
      </mesh>
      {[
        [0.99, -0.06],
        [1.14, 0.14],
      ].map(([x, z], k) => (
        <mesh
          key={`${x}`}
          position={[x, BASE_T + 0.016, z]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            if (k === 1) open(); // A: open
            else setSel(-1); // B: home
          }}
          {...hoverable}
        >
          <cylinderGeometry args={[0.07, 0.07, 0.035, 40]} />
          <meshPhysicalMaterial color={DARK} roughness={0.25} metalness={0.3} clearcoat={1} clearcoatRoughness={0.05} />
        </mesh>
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
  onNavigate,
  reduced = false,
}: {
  progress: MotionValue<number>;
  onNavigate: (href: string) => void;
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
        <Lightformer form="ring" intensity={1.4} color={ACCENT} position={[0, 1.5, -6]} scale={4} />
      </Environment>
      <Device progress={progress} onNavigate={onNavigate} reduced={reduced} />
      <ContactShadows position={[0, -0.001, 0]} opacity={0.85} scale={7} blur={2.2} far={2.5} resolution={1024} color="#000000" />
      <EffectComposer multisampling={4}>
        {/* the white screens are the brightest thing in frame, so they carry the glow */}
        <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.08} intensity={0.32} radius={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
