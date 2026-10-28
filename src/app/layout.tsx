import type { Metadata } from "next";
import "@fontsource/m-plus-1p/400.css";
import "@fontsource/m-plus-1p/500.css";
import "@fontsource/m-plus-1p/700.css";
import "@fontsource/m-plus-1p/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agam Iheanyi-Igwe",
  description:
    "Computer science and mathematics student at Stanford, building infrastructure, systems and tools that hold up under real load.",
  openGraph: {
    title: "Agam Iheanyi-Igwe",
    description: "CS and mathematics at Stanford. Infrastructure, systems and AI tooling.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white antialiased selection:bg-white/20">
        {children}
      </body>
    </html>
  );
}
