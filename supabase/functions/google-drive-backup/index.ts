// Dump all tables and upload a JSON backup to the user's Google Drive.
import {
  corsHeaders, json, getAuthedUser, getAccessToken, adminClient, BACKUP_TABLES,
} from "../_shared/google.ts";

async function collectDump(admin: ReturnType<typeof adminClient>) {
  const dump: Record<string, unknown[]> = {};
  for (const table of BACKUP_TABLES) {
    const { data, error } = await admin.from(table).select("*");
    if (error) {
      console.error(`Failed to read ${table}:`, error);
      continue;
    }
    dump[table] = data || [];
  }
  return dump;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getAuthedUser(req);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const admin = adminClient();
  const bodyJson = await req.json().catch(() => ({}));
  const action = bodyJson?.action || "backup";

  if (action === "history") {
    const { data, error } = await admin
      .from("backup_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return json({ error: error.message }, 500);
    return json({ history: data || [] });
  }

  const dump = await collectDump(admin);
  const payload = {
    version: 1,
    created_at: new Date().toISOString(),
    user_id: user.id,
    tables: dump,
  };

  if (action === "dump") {
    return json({ success: true, payload, tables_count: Object.keys(dump).length });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(user.id);
  } catch (e: any) {
    return json({ error: e?.message || "Not connected to Google Drive" }, 400);
  }

  const fileName = `qazi_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const fileContent = JSON.stringify(payload);

  // Multipart upload to Google Drive
  const boundary = "qazi" + crypto.randomUUID().replace(/-/g, "");
  const metadata = {
    name: fileName,
    mimeType: "application/json",
    description: "Qazi Enterprises automated backup",
  };
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${fileContent}\r\n` +
    `--${boundary}--`;

  const upRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );

  if (!upRes.ok) {
    const txt = await upRes.text();
    await admin.from("backup_history").insert({
      user_id: user.id,
      file_name: fileName,
      status: "failed",
      type: "google_drive",
      error_message: `Upload failed: ${txt.slice(0, 500)}`,
    });
    return json({ error: `Upload failed: ${txt}` }, 500);
  }

  const file = await upRes.json();
  await admin.from("backup_history").insert({
    user_id: user.id,
    file_name: file.name || fileName,
    file_id: file.id,
    status: "completed",
    type: "google_drive",
  });

  return json({
    success: true,
    file_id: file.id,
    file_name: file.name || fileName,
    tables_count: Object.keys(dump).length,
  });
});
