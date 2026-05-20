import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/customClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Upload, HardDrive, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";

// All tables we back up. Bills + their items + ledger included so a restored backup
// reproduces every transaction exactly.
const BACKUP_TABLES = [
  "contacts", "products", "product_categories",
  "sale_transactions", "sale_items", "receivable_payments",
  "returns", "return_items",
  "purchases", "purchase_items",
  "expenses", "expense_categories", "ledger_entries",
  "daily_summaries", "cash_register", "price_lists", "price_list_items",
  "audit_logs", "todos", "notifications",
];

const LAST_AUTO_KEY = "qe-last-auto-backup";

export async function runLocalBackup(): Promise<{ payload: any; fileName: string }> {
  const tables: Record<string, any[]> = {};
  for (const t of BACKUP_TABLES) {
    const { data, error } = await (supabase as any).from(t).select("*").limit(50000);
    if (error) console.warn(`Backup: ${t} failed`, error);
    tables[t] = data || [];
  }
  const payload = { version: 2, created_at: new Date().toISOString(), tables };
  const fileName = `qazi_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  return { payload, fileName };
}

function downloadJson(payload: any, fileName: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BackupPage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [lastAuto, setLastAuto] = useState<string | null>(null);

  useEffect(() => {
    setLastAuto(localStorage.getItem(LAST_AUTO_KEY));
  }, []);

  const handleManualBackup = async () => {
    setBusy(true);
    try {
      const { payload, fileName } = await runLocalBackup();
      downloadJson(payload, fileName);
      toast.success("Backup downloaded");
      await (supabase as any).from("backup_history").insert({
        user_id: user?.id, file_name: fileName, status: "completed", type: "local",
      });
    } catch (e: any) {
      toast.error(`Backup failed: ${e?.message || e}`);
    } finally { setBusy(false); }
  };

  const handleRestore = async (file: File) => {
    setRestoring(true);
    try {
      const txt = await file.text();
      const data = JSON.parse(txt);
      if (!data?.tables) throw new Error("Invalid backup file");
      let totalRows = 0;
      // Insert in safe FK order
      const order = ["product_categories", "expense_categories", "contacts", "products",
        "price_lists", "price_list_items",
        "sale_transactions", "sale_items", "receivable_payments",
        "returns", "return_items", "purchases", "purchase_items",
        "expenses", "ledger_entries", "daily_summaries", "cash_register",
        "audit_logs", "todos", "notifications"];
      for (const t of order) {
        const rows = data.tables[t];
        if (!rows?.length) continue;
        const chunks = [];
        for (let i = 0; i < rows.length; i += 200) chunks.push(rows.slice(i, i + 200));
        for (const c of chunks) {
          const { error } = await (supabase as any).from(t).upsert(c, { onConflict: "id" });
          if (error) console.warn(`Restore ${t}:`, error.message);
          else totalRows += c.length;
        }
      }
      toast.success(`Restored ${totalRows} rows`);
    } catch (e: any) {
      toast.error(`Restore failed: ${e?.message || e}`);
    } finally { setRestoring(false); }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Backup & Restore</h1>
        <p className="text-muted-foreground text-sm">Local JSON backups. A daily backup downloads automatically when you open the app once per day.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5" /> Manual Backup</CardTitle>
          <CardDescription>Downloads a full JSON snapshot to your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleManualBackup} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Download Backup Now
          </Button>
          {lastAuto && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> Last automatic backup: {format(new Date(lastAuto), "PPpp")}
              <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" />Auto</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Restore from Backup</CardTitle>
          <CardDescription>Upload a previously downloaded backup file. Existing rows with the same id will be overwritten.</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file" accept="application/json"
            disabled={restoring}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRestore(f); }}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
          />
          {restoring && <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Restoring…</p>}
        </CardContent>
      </Card>
    </div>
  );
}
