// Edge Function: manage-users
// Allows authenticated admins to create, update, and delete users.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const callerId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Verify caller is an admin
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden: admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const { action } = body || {};

    if (action === "list") {
      const { data: profiles, error: profileErr } = await admin
        .from("profiles")
        .select("user_id,email,display_name,created_at")
        .order("created_at", { ascending: false });
      if (profileErr) return json({ error: profileErr.message }, 500);

      const { data: roles, error: roleErr } = await admin
        .from("user_roles")
        .select("user_id,role");
      if (roleErr) return json({ error: roleErr.message }, 500);

      const users = (profiles || []).map((p: any) => {
        const userRole = roles?.find((r: any) => r.user_id === p.user_id);
        return {
          user_id: p.user_id,
          email: p.email,
          display_name: p.display_name,
          created_at: p.created_at,
          role: userRole?.role || "user",
        };
      });

      return json({ users });
    }

    if (action === "create") {
      const { email, password, displayName } = body;
      if (!email || !password) return json({ error: "Email and password required" }, 400);

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName || email.split("@")[0] },
      });
      if (createErr) return json({ error: createErr.message }, 400);

      const newId = created.user!.id;
      await admin.from("profiles").upsert({
        user_id: newId,
        email,
        display_name: displayName || email.split("@")[0],
      });
      await admin.from("user_roles").upsert({ user_id: newId, role: "user" });

      return json({ success: true, user_id: newId });
    }

    if (action === "delete") {
      const { userId } = body;
      if (!userId) return json({ error: "userId required" }, 400);
      if (userId === callerId) return json({ error: "Cannot delete yourself" }, 400);

      const { error: delErr } = await admin.auth.admin.deleteUser(userId);
      if (delErr) return json({ error: delErr.message }, 400);
      await admin.from("user_roles").delete().eq("user_id", userId);
      await admin.from("profiles").delete().eq("user_id", userId);
      return json({ success: true });
    }

    if (action === "update") {
      const { userId, displayName, password, role } = body;
      if (!userId) return json({ error: "userId required" }, 400);

      if (password) {
        const { error: pwErr } = await admin.auth.admin.updateUserById(userId, { password });
        if (pwErr) return json({ error: pwErr.message }, 400);
      }
      if (typeof displayName === "string") {
        await admin.from("profiles").update({ display_name: displayName }).eq("user_id", userId);
        await admin.auth.admin.updateUserById(userId, {
          user_metadata: { display_name: displayName },
        });
      }
      if (role && ["admin", "user"].includes(role)) {
        await admin.from("user_roles").delete().eq("user_id", userId);
        await admin.from("user_roles").insert({ user_id: userId, role });
      }
      return json({ success: true });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e: any) {
    return json({ error: e?.message || "Server error" }, 500);
  }
});
