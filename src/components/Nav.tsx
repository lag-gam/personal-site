"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/data/site";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#out-of-office", label: "Out of Office" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-14 border-b transition-colors duration-300 ${
        solid ? "border-zinc-200 bg-white/85 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-full max-w-[1200px] items-center gap-7 px-5 md:px-8">
        <Link href="/" className="mr-auto text-[15px] font-semibold tracking-tight text-ink">
          Agam Iheanyi-Igwe
        </Link>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hidden text-[13px] text-zinc-500 transition-colors hover:text-forest sm:block"
          >
            {l.label}
          </Link>
        ))}
        <a
          href={site.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-zinc-500 transition-colors hover:text-forest"
        >
          Resume
        </a>
      </nav>
    </header>
  );
}
