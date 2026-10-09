import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/*
  These used to be scroll-scrubbed effects (slide, mask wipe, velocity skew).
  The site is now deliberately calm, so they reduce to a plain fade-in or a
  static wrapper. The props stay so existing call sites keep compiling.
*/

export function SlideIn({
  children,
  className = "",
}: {
  children: ReactNode;
  from?: "left" | "right" | "bottom";
  distance?: number;
  rotate?: number;
  className?: string;
}) {
  return <Reveal className={className}>{children}</Reveal>;
}

export function Wipe({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function VelocitySkew({
  children,
  className = "",
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
