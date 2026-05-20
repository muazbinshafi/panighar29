// Google Drive OAuth: returns auth URL on first call; handles callback after.
import {
  corsHeaders, json, getAuthedUser, makeState, verifyState,
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI, SCOPES,
  adminClient, getReturnTo,
} from "../_shared/google.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return json({ error: "Google OAuth credentials are not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets." }, 500);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // OAuth callback from Google
  if (code && state) {
    const verified = await verifyState(state);
    if (!verified) {
      return new Response("Invalid or expired state", { status: 400 });
    }
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      return new Response(`Token exchange failed: ${txt}`, { status: 400 });
    }
    const tokens = await tokenRes.json();
    const expiry = Date.now() + (tokens.expires_in ?? 3600) * 1000;
    const admin = adminClient();
    const { data: existingToken } = await admin
      .from("google_drive_tokens")
      .select("refresh_token")
      .eq("user_id", verified.userId)
      .maybeSingle();
    const refreshToken = tokens.refresh_token || existingToken?.refresh_token;
    if (!refreshToken) {
      return new Response("Google did not return a refresh token. Remove this app from your Google account access, then connect again.", { status: 400 });
    }
    await admin.from("google_drive_tokens").upsert({
      user_id: verified.userId,
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      expiry_date: expiry,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return new Response(null, {
      status: 302,
      headers: { Location: `${verified.returnTo}?connected=true` },
    });
  }

  // Authenticated request → return URL to start OAuth
  const user = await getAuthedUser(req);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const action = body?.action || "connect";
  const admin = adminClient();

  if (action === "status") {
    const { data } = await admin
      .from("google_drive_tokens")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    return json({ connected: !!data });
  }

  if (action === "disconnect") {
    await admin.from("google_drive_tokens").delete().eq("user_id", user.id);
    return json({ success: true, connected: false });
  }

  const st = await makeState(user.id, getReturnTo(req));
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", st);

  return json({ url: authUrl.toString() });
});
