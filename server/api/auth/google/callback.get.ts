import { defineHandler, getQuery, redirect, HTTPError } from "nitro/h3";
import { tokenStore } from "../../login.post";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback";

export default defineHandler(async (event) => {
  const query = getQuery(event) as { code?: string; error?: string };

  if (query.error || !query.code) {
    return redirect("/?error=oauth_denied");
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: query.code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw HTTPError.status(401, "Failed to exchange code for token");
  }

  const tokens = await tokenRes.json() as { access_token: string };

  // Fetch user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    throw HTTPError.status(401, "Failed to fetch user info");
  }

  const userInfo = await userRes.json() as { email: string };

  // Create a session token
  const sessionToken = crypto.randomUUID();
  tokenStore.set(sessionToken, { email: userInfo.email });

  // Redirect back to the app with the token
  return redirect(`/?token=${sessionToken}&email=${encodeURIComponent(userInfo.email)}`);
});
