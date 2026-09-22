import { Hero } from "@/components/Hero";
import { Experience } from "@/components/Experience";
import { OutOfOffice } from "@/components/OutOfOffice";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <main className="w-full bg-white">
      <Hero />
      <Experience />
      <OutOfOffice />
      <Contact />
    </main>
  );
}
