import { playlists } from "@/data/site";

export function Playlists() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {playlists.slice(0, 4).map((p) => (
        <iframe
          key={p.id}
          title="Spotify playlist"
          src={`https://open.spotify.com/embed/playlist/${p.id}?utm_source=generator`}
          width="100%"
          height={352}
          style={{ borderRadius: 12 }}
          frameBorder={0}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ))}
    </div>
  );
}
