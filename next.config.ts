import type { NextConfig } from "next";

/**
 * Note: this app is no longer a pure static export — /api/spotify/top needs a
 * server at request time. Deploy on Vercel (or any Node host), not GitHub Pages.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Spotify serves album and playlist art from several hosts
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "**.scdn.co" },
      { protocol: "https", hostname: "**.spotifycdn.com" },
    ],
  },
};

export default nextConfig;
