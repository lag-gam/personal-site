import { HandheldSection } from "@/components/handheld/HandheldSection";
import { readGallery } from "@/lib/gallery";

export default function Home() {
  return (
    <main className="w-full bg-black">
      <HandheldSection creative={readGallery("creative")} />
    </main>
  );
}
