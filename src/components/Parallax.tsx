import type { ReactNode } from "react";

/** Formerly drifted against the scroll; now a static wrapper. */
export function Parallax({
  children,
  className = "",
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
