// Shared helpers for Google Drive edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
export const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
export const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
export const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
export const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
export const APP_URL =
  Deno.env.get("APP_PUBLIC_URL") || "https://panighar26.lovable.app";

export const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/google-drive-auth`;
export const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const adminClient = () => createClient(SUPABASE_URL, SERVICE_ROLE);

function isAllowedReturnOrigin(origin: string) {
  try {
    const u = new URL(origin);
    return u.protocol === "http:" && u.hostname === "localhost"
      || u.protocol === "https:" && (u.hostname === "panighar26.lovable.app" || u.hostname.endsWith(".lovable.app"));
  } catch {
    return false;
  }
}

export function getReturnTo(req: Request) {
  const origin = req.headers.get("Origin") || req.headers.get("Referer") || APP_URL;
  try {
    const u = new URL(origin);
    const base = `${u.protocol}//${u.host}`;
    return isAllowedReturnOrigin(base) ? `${base}/backup` : `${APP_URL}/backup`;
  } catch {
    return `${APP_URL}/backup`;
  }
}

export async function getAuthedUser(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;
  const c = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await c.auth.getUser();
  return data?.user ?? null;
}

// HMAC-signed state
async function hmac(key: string, msg: string) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function makeState(userId: string, returnTo: string) {
  let safeReturnTo = `${APP_URL}/backup`;
  try {
    safeReturnTo = isAllowedReturnOrigin(new URL(returnTo).origin) ? returnTo : safeReturnTo;
  } catch {
    safeReturnTo = `${APP_URL}/backup`;
  }
  const payload = btoa(JSON.stringify({ uid: userId, t: Date.now(), r: safeReturnTo }))
    .replace(/=+$/, "");
  const sig = await hmac(SERVICE_ROLE, payload);
  return `${payload}.${sig}`;
}

export async function verifyState(state: string): Promise<{ userId: string; returnTo: string } | null> {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const expected = await hmac(SERVICE_ROLE, payload);
  if (sig !== expected) return null;
  try {
    const decoded = JSON.parse(atob(payload + "===".slice(0, (4 - payload.length % 4) % 4)));
    if (Date.now() - decoded.t > 10 * 60 * 1000) return null;
    return {
      userId: decoded.uid as string,
      returnTo: typeof decoded.r === "string" && isAllowedReturnOrigin(new URL(decoded.r).origin)
        ? decoded.r
        : `${APP_URL}/backup`,
    };
  } catch {
    return null;
  }
}

// Get a fresh access token for a user, refreshing if needed.
export async function getAccessToken(userId: string): Promise<string> {
  const admin = adminClient();
  const { data: row, error } = await admin
    .from("google_drive_tokens")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !row) throw new Error("Google Drive not connected");

  const now = Date.now();
  if (row.expiry_date && row.expiry_date > now + 60_000) {
    return row.access_token;
  }
  // Refresh
  const body = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: row.refresh_token,
    grant_type: "refresh_token",
  });
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) throw new Error(`Token refresh failed: ${await r.text()}`);
  const t = await r.json();
  const newAccess = t.access_token as string;
  const expiry = now + (t.expires_in ?? 3600) * 1000;
  await admin.from("google_drive_tokens").update({
    access_token: newAccess,
    expiry_date: expiry,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);
  return newAccess;
}

export const BACKUP_TABLES = [
  "contacts", "products", "product_categories",
  "sale_transactions", "sale_items", "receivable_payments",
  "returns", "return_items",
  "purchases", "purchase_items",
  "expenses", "expense_categories",
  "ledger_entries", "daily_summaries", "cash_register",
  "price_lists", "price_list_items",
  "todos", "notifications", "audit_logs", "backup_history",
];

export const RESTORE_DELETE_ORDER = [
  "return_items", "returns", "receivable_payments", "sale_items", "sale_transactions",
  "purchase_items", "purchases", "price_list_items", "price_lists", "ledger_entries",
  "expenses", "expense_categories", "daily_summaries", "cash_register",
  "todos", "notifications", "audit_logs", "products", "product_categories", "contacts",
  "backup_history",
];

export const RESTORE_INSERT_ORDER = [...RESTORE_DELETE_ORDER].reverse();
