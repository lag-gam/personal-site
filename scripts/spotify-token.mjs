/**
 * One-time helper: exchange a Spotify authorization code for a refresh token.
 *
 *   1. Create an app at https://developer.spotify.com/dashboard
 *   2. Add redirect URI exactly: http://127.0.0.1:8888/callback
 *   3. SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/spotify-token.mjs
 *   4. Open the printed URL, approve, and the refresh token prints here.
 *   5. Put it in .env.local as SPOTIFY_REFRESH_TOKEN (and in Vercel env vars).
 */
import { createServer } from "node:http";

const ID = process.env.SPOTIFY_CLIENT_ID;
const SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT = "http://127.0.0.1:8888/callback";
const SCOPE = "user-top-read playlist-read-private";

if (!ID || !SECRET) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.");
  process.exit(1);
}

const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    client_id: ID,
    response_type: "code",
    redirect_uri: REDIRECT,
    scope: SCOPE,
  });

console.log("\nOpen this in your browser:\n\n" + authUrl + "\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:8888");
  const code = url.searchParams.get("code");
  if (!code) {
    res.end("No code in callback.");
    return;
  }

  const token = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${ID}:${SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT,
    }),
  }).then((r) => r.json());

  if (token.refresh_token) {
    console.log("\nSPOTIFY_REFRESH_TOKEN=" + token.refresh_token + "\n");
    res.end("Done. Check your terminal, then close this tab.");
  } else {
    console.error("\nNo refresh_token returned:", token, "\n");
    res.end("Failed. Check your terminal.");
  }
  server.close();
}).listen(8888);
