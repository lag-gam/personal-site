import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-5 text-[13px] text-zinc-500 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          © {new Date().getFullYear()} {site.name}. Stanford, California.
        </div>
        <div className="flex flex-wrap gap-6">
          <a href={`mailto:${site.email}`} className="hover:text-forest">Contact</a>
          <a href={site.resume} target="_blank" rel="noopener noreferrer" className="hover:text-forest">Resume</a>
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="hover:text-forest">GitHub</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-forest">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
