import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/customClient";
import { toast } from "sonner";
import { Trash2, Users, Package, Loader2, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { logAction } from "@/lib/auditLog";

interface Report {
  scanned: number;
  duplicateGroups: number;
  removed: number;
  reassigned: number;
}

export default function DataCleanupPage() {
  const [busy, setBusy] = useState<string | null>(null);
  const [contactReport, setContactReport] = useState<Report | null>(null);
  const [productReport, setProductReport] = useState<Report | null>(null);
  const [diag, setDiag] = useState<{ sales: number; items: number; orphan: number } | null>(null);

  const norm = (s: string) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");

  // ─── Dedupe customers/suppliers by normalized name+type ────────
  const dedupeContacts = async () => {
    setBusy("contacts");
    try {
      const { data: contacts, error } = await supabase
        .from("contacts")
        .select("id, name, type, phone, current_balance, opening_balance, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const groups = new Map<string, any[]>();
      for (const c of contacts || []) {
        const key = `${c.type}|${norm(c.name)}`;
        if (!key.split("|")[1]) continue;
        const arr = groups.get(key) || [];
        arr.push(c);
        groups.set(key, arr);
      }

      let dupGroups = 0;
      let removed = 0;
      let reassigned = 0;

      for (const [, arr] of groups) {
        if (arr.length < 2) continue;
        dupGroups++;
        // keeper = oldest
        const keeper = arr[0];
        const dupes = arr.slice(1);
        const dupIds = dupes.map((d) => d.id);

        // Reassign FK references
        const reassignTables: Array<{ table: any; col: string }> = [
          { table: "ledger_entries", col: "contact_id" },
          { table: "sale_transactions", col: "customer_id" },
          { table: "purchases", col: "supplier_id" },
        ];
        for (const r of reassignTables) {
          for (const dupId of dupIds) {
            const { data: upd, error: upErr } = await supabase
              .from(r.table)
              .update({ [r.col]: keeper.id } as any)
              .eq(r.col, dupId)
              .select("id");
            if (!upErr) reassigned += (upd || []).length;
          }
        }

        // Sum current_balance into keeper
        const totalBal = arr.reduce((s, c) => s + Number(c.current_balance || 0), 0);
        await supabase.from("contacts").update({ current_balance: totalBal }).eq("id", keeper.id);

        // Delete dupes
        const { error: delErr } = await supabase.from("contacts").delete().in("id", dupIds);
        if (!delErr) removed += dupes.length;
      }

      const report = { scanned: contacts?.length || 0, duplicateGroups: dupGroups, removed, reassigned };
      setContactReport(report);
      toast.success(`Removed ${removed} duplicate contacts (${dupGroups} groups)`);
      logAction("delete", "contact", "bulk", `Deduplicated ${removed} contacts`);
    } catch (e: any) {
      toast.error(e?.message || "Cleanup failed");
    } finally {
      setBusy(null);
    }
  };

  // ─── Dedupe products by normalized name (or sku) ──────────────
  const dedupeProducts = async () => {
    setBusy("products");
    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, sku, quantity, selling_price, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const groups = new Map<string, any[]>();
      for (const p of products || []) {
        const key = p.sku ? `sku:${norm(p.sku)}` : `name:${norm(p.name)}`;
        if (!key.split(":")[1]) continue;
        const arr = groups.get(key) || [];
        arr.push(p);
        groups.set(key, arr);
      }

      let dupGroups = 0;
      let removed = 0;
      let reassigned = 0;

      for (const [, arr] of groups) {
        if (arr.length < 2) continue;
        dupGroups++;
        const keeper = arr[0];
        const dupes = arr.slice(1);
        const dupIds = dupes.map((d) => d.id);

        // Reassign sale_items + price_list_items + purchase items if any
        const reassignTables: Array<{ table: any; col: string }> = [
          { table: "sale_items", col: "product_id" },
          { table: "price_list_items", col: "product_id" },
        ];
        for (const r of reassignTables) {
          for (const dupId of dupIds) {
            const { data: upd, error: upErr } = await supabase
              .from(r.table)
              .update({ [r.col]: keeper.id } as any)
              .eq(r.col, dupId)
              .select("id");
            if (!upErr) reassigned += (upd || []).length;
          }
        }

        // Sum stock into keeper
        const totalQty = arr.reduce((s, p) => s + Number(p.quantity || 0), 0);
        await supabase.from("products").update({ quantity: totalQty }).eq("id", keeper.id);

        const { error: delErr } = await supabase.from("products").delete().in("id", dupIds);
        if (!delErr) removed += dupes.length;
      }

      const report = { scanned: products?.length || 0, duplicateGroups: dupGroups, removed, reassigned };
      setProductReport(report);
      toast.success(`Removed ${removed} duplicate products (${dupGroups} groups)`);
      logAction("delete", "product", "bulk", `Deduplicated ${removed} products`);
    } catch (e: any) {
      toast.error(e?.message || "Cleanup failed");
    } finally {
      setBusy(null);
    }
  };

  // ─── Diagnose Product Analytics ──────────────────────────────
  const diagnoseAnalytics = async () => {
    setBusy("diag");
    try {
      const [salesRes, itemsRes] = await Promise.all([
        supabase.from("sale_transactions").select("id", { count: "exact", head: true }),
        supabase.from("sale_items").select("id, sale_id", { count: "exact" }),
      ]);
      const salesCount = salesRes.count || 0;
      const items = itemsRes.data || [];
      const itemsCount = itemsRes.count || items.length;

      // Find orphan items (sale_id not present in sale_transactions)
      const saleIds = Array.from(new Set(items.map((i: any) => i.sale_id).filter(Boolean)));
      let orphan = 0;
      if (saleIds.length > 0) {
        const { data: existing } = await supabase
          .from("sale_transactions")
          .select("id")
          .in("id", saleIds.slice(0, 1000));
        const existSet = new Set((existing || []).map((s: any) => s.id));
        orphan = items.filter((i: any) => i.sale_id && !existSet.has(i.sale_id)).length;
      }
      setDiag({ sales: salesCount, items: itemsCount, orphan });
      toast.success("Diagnosis complete");
    } catch (e: any) {
      toast.error(e?.message || "Diagnosis failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Cleanup</h1>
        <p className="text-sm text-muted-foreground">
          Remove duplicate customers and products, and diagnose missing analytics data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Deduplicate Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Merges customers/suppliers with the same name. Sums balances, reassigns
              ledger entries, sales and purchases to the kept record, then removes the
              duplicates.
            </p>
            <Button onClick={dedupeContacts} disabled={busy !== null} className="gap-2">
              {busy === "contacts" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Run Contact Cleanup
            </Button>
            {contactReport && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                <div className="flex items-center gap-2 text-success font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Cleanup complete
                </div>
                <div>Scanned: <Badge variant="secondary">{contactReport.scanned}</Badge></div>
                <div>Duplicate groups: <Badge variant="secondary">{contactReport.duplicateGroups}</Badge></div>
                <div>Removed: <Badge variant="destructive">{contactReport.removed}</Badge></div>
                <div>References reassigned: <Badge variant="secondary">{contactReport.reassigned}</Badge></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Deduplicate Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Merges products with the same SKU (or name when no SKU). Sums quantities
              into the kept record and reassigns sale items & price list rows to it.
            </p>
            <Button onClick={dedupeProducts} disabled={busy !== null} className="gap-2">
              {busy === "products" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Run Product Cleanup
            </Button>
            {productReport && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                <div className="flex items-center gap-2 text-success font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Cleanup complete
                </div>
                <div>Scanned: <Badge variant="secondary">{productReport.scanned}</Badge></div>
                <div>Duplicate groups: <Badge variant="secondary">{productReport.duplicateGroups}</Badge></div>
                <div>Removed: <Badge variant="destructive">{productReport.removed}</Badge></div>
                <div>References reassigned: <Badge variant="secondary">{productReport.reassigned}</Badge></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diagnose analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Diagnose Product Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If the analytics page shows no products, run this to check whether sale
            items exist and are linked to the right sales.
          </p>
          <Button onClick={diagnoseAnalytics} disabled={busy !== null} className="gap-2" variant="outline">
            {busy === "diag" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            Run Diagnosis
          </Button>
          {diag && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-2">
              <div className="flex items-center gap-2"><span>Sale headers:</span><Badge variant="secondary">{diag.sales}</Badge></div>
              <div className="flex items-center gap-2"><span>Sale items:</span><Badge variant="secondary">{diag.items}</Badge></div>
              <div className="flex items-center gap-2"><span>Orphan items (no parent sale):</span>
                <Badge variant={diag.orphan > 0 ? "destructive" : "secondary"}>{diag.orphan}</Badge>
              </div>
              {diag.items === 0 && diag.sales > 0 && (
                <div className="flex items-start gap-2 text-warning">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>Sales exist but no items found. New bills must be created from the POS to populate analytics.</span>
                </div>
              )}
              {diag.orphan > 0 && (
                <div className="flex items-start gap-2 text-warning">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>Some items reference deleted sales — re-run analytics after creating new bills.</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
