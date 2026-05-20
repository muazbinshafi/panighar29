// List Drive backup files, or restore a selected one back into the database.
import {
  corsHeaders, json, getAuthedUser, getAccessToken, adminClient,
  RESTORE_DELETE_ORDER, RESTORE_INSERT_ORDER,
} from "../_shared/google.ts";

async function restoreTables(payload: any) {
  const tables = payload?.tables || {};
  const admin = adminClient();
  let totalRecords = 0;
  let tablesRestored = 0;

  for (const table of RESTORE_DELETE_ORDER) {
    await admin.from(table).delete().not("id", "is", null);
  }

  for (const table of RESTORE_INSERT_ORDER) {
    const rows = tables[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error } = await admin.from(table).insert(chunk);
      if (error) {
        console.error(`Restore failed for ${table}:`, error);
        throw new Error(`Restore failed for ${table}: ${error.message}`);
      }
    }
    totalRecords += rows.length;
    tablesRestored++;
  }

  return { tables_restored: tablesRestored, total_records: totalRecords };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getAuthedUser(req);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const action = body?.action || "list";

  if (action === "restorePayload") {
    try {
      const result = await restoreTables(body?.payload);
      return json({ success: true, ...result });
    } catch (e: any) {
      return json({ error: e?.message || "Restore failed" }, 500);
    }
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(user.id);
  } catch (e: any) {
    return json({ error: e?.message || "Not connected to Google Drive" }, 400);
  }

  if (action === "list") {
    const q = encodeURIComponent("name contains 'qazi_backup_' and trashed=false");
    const r = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=createdTime desc&pageSize=50&fields=files(id,name,size,createdTime)`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!r.ok) return json({ error: `List failed: ${await r.text()}` }, 500);
    const data = await r.json();
    return json({ files: data.files || [] });
  }

  if (action === "restore") {
    const fileId = body?.file_id;
    if (!fileId) return json({ error: "file_id required" }, 400);

    const dl = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!dl.ok) return json({ error: `Download failed: ${await dl.text()}` }, 500);
    const payload = await dl.json();
    const result = await restoreTables(payload);

    return json({
      success: true,
      ...result,
    });
  }

  return json({ error: `Unknown action: ${action}` }, 400);
});
