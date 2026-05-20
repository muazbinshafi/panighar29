import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, TrendingDown, Search, Package, BarChart3, Eye,
  Receipt, DollarSign, Users, CreditCard, AlertCircle, Zap, Clock,
  ArrowUpRight, ArrowDownRight, Flame, Snowflake, SortAsc, SortDesc,
  FileSpreadsheet, Printer, FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/customClient";
import { exportToExcel, printAsPDF } from "@/lib/exportUtils";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area,
} from "recharts";
import { motion } from "framer-motion";

interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface SaleTransaction {
  id: string;
  invoice_no: string | null;
  date: string;
  customer_id: string | null;
  subtotal: number | null;
  discount: number | null;
  total: number | null;
  paid_amount: number | null;
  payment_method: string | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  selling_price: number | null;
  quantity: number | null;
  sku: string | null;
}

interface Contact {
  id: string;
  name: string;
  type: string;
  phone?: string | null;
}

interface ProductAnalysis {
  product_id: string;
  product_name: string;
  totalQty: number;
  totalRevenue: number;
  orderCount: number;
  avgQtyPerOrder: number;
  velocity: number;
  firstSaleDate: string;
  lastSaleDate: string;
  activeDays: number;
  daysInPeriod: number;
  sellFrequency: number;
  currentStock: number;
  daysOfStockLeft: number;
  speedLabel: "🔥 Fast" | "⚡ Moderate" | "🐢 Slow" | "❄️ Dead";
}

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))",
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--destructive))",
];

type SortField = "totalQty" | "velocity" | "totalRevenue" | "orderCount" | "product_name" | "currentStock" | "daysOfStockLeft";

export default function ProductAnalyticsPage() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  // period values: "7" | "30" | "90" | "365" | "month" (uses selectedMonth)
  const [period, setPeriod] = useState("30");
  // YYYY-MM string for month filter
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("totalQty");
  const [sortAsc, setSortAsc] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, selectedMonth]);

  // Compute date range based on current period selection
  const dateRange = useMemo(() => {
    if (period === "month") {
      const [y, m] = selectedMonth.split("-").map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0); // last day of month
      const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const days = end.getDate();
      return { from: fmt(start), to: fmt(end), days, label: start.toLocaleDateString("en-PK", { month: "long", year: "numeric" }) };
    }
    const days = Number(period);
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { from: fmt(start), to: fmt(end), days, label: `Last ${days} Days` };
  }, [period, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    setAnalyticsError(null);
    try {
      const salesQuery = supabase
        .from("sale_transactions")
        .select("id, invoice_no, date, customer_id, subtotal, discount, total, paid_amount, payment_method, payment_status, notes, created_at")
        .gte("date", dateRange.from)
        .lte("date", dateRange.to)
        .order("date", { ascending: false });

      const [salesRes, productsRes, contactsRes] = await Promise.all([
        salesQuery,
        supabase.from("products").select("id, name, selling_price, quantity, sku"),
        supabase.from("contacts").select("id, name, type, phone"),
      ]);

      if (salesRes.error) throw new Error(`Sales query failed: ${salesRes.error.message}`);
      if (productsRes.error) throw new Error(`Products query failed: ${productsRes.error.message}`);
      if (contactsRes.error) throw new Error(`Contacts query failed: ${contactsRes.error.message}`);

      const salesData = (salesRes.data || []) as SaleTransaction[];
      const productsData = (productsRes.data || []) as Product[];
      const contactsData = (contactsRes.data || []) as Contact[];
      const saleIds = Array.from(new Set(salesData.map((sale) => sale.id)));

      let itemsData: SaleItem[] = [];
      if (saleIds.length > 0) {
        const chunks = Array.from({ length: Math.ceil(saleIds.length / 200) }, (_, index) =>
          saleIds.slice(index * 200, index * 200 + 200)
        );

        const itemResponses = await Promise.all(
          chunks.map((ids) =>
            supabase
              .from("sale_items")
              .select("sale_id, product_id, product_name, quantity, unit_price, subtotal")
              .in("sale_id", ids)
          )
        );

        const firstItemError = itemResponses.find((response) => response.error)?.error;
        if (firstItemError) throw new Error(`Sale items query failed: ${firstItemError.message}`);

        itemsData = itemResponses.flatMap((response) =>
          ((response.data || []) as SaleItem[]).map((item) => ({
            ...item,
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.unit_price || 0),
            subtotal: Number(item.subtotal || 0),
          }))
        );
      }

      setSaleItems(itemsData);
      setSales(salesData);
      setProducts(productsData);
      setContacts(contactsData.filter((contact) => contact.type === "customer"));
      if (salesData.length > 0 && itemsData.length === 0) {
        setAnalyticsError("Sales exist but no sale items are readable. Product rankings stay empty until sale_items can be read for your account.");
      }
    } catch (e: any) {
      console.error("Failed to fetch analytics data", e);
      setAnalyticsError(e?.message || "Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  const daysInPeriod = dateRange.days;

  // ─── Core: Observe bills → build product analysis ────────────────
  const productAnalysis = useMemo(() => {
    const saleDateMap = new Map<string, string>();
    for (const sale of sales) saleDateMap.set(sale.id, sale.date);

    const stockMap = new Map<string, { stock: number; price: number }>();
    for (const product of products) {
      stockMap.set(product.id, {
        stock: product.quantity ?? 0,
        price: product.selling_price ?? 0,
      });
    }

    const map = new Map<string, {
      product_id: string;
      product_name: string;
      totalQty: number;
      totalRevenue: number;
      saleIds: Set<string>;
      dates: Set<string>;
      firstDate: string;
      lastDate: string;
    }>();

    for (const item of saleItems) {
      const key = item.product_id || item.product_name || "Unknown";
      const billDate = saleDateMap.get(item.sale_id) || "";
      const qty = Number(item.quantity || 0);
      const subtotal = Number(item.subtotal || 0);
      const existing = map.get(key);

      if (existing) {
        existing.totalQty += qty;
        existing.totalRevenue += subtotal;
        existing.saleIds.add(item.sale_id);
        if (billDate) existing.dates.add(billDate);
        if (billDate && (!existing.firstDate || billDate < existing.firstDate)) existing.firstDate = billDate;
        if (billDate && billDate > existing.lastDate) existing.lastDate = billDate;
      } else {
        map.set(key, {
          product_id: item.product_id || key,
          product_name: item.product_name || "Unknown Product",
          totalQty: qty,
          totalRevenue: subtotal,
          saleIds: new Set(item.sale_id ? [item.sale_id] : []),
          dates: new Set(billDate ? [billDate] : []),
          firstDate: billDate,
          lastDate: billDate,
        });
      }
    }

    const results: ProductAnalysis[] = [];
    for (const [, value] of map) {
      const velocity = daysInPeriod > 0 ? value.totalQty / daysInPeriod : 0;
      const activeDays = value.dates.size;
      const sellFrequency = daysInPeriod > 0 ? (activeDays / daysInPeriod) * 100 : 0;
      const stockInfo = stockMap.get(value.product_id);
      const currentStock = stockInfo?.stock ?? 0;
      const daysOfStockLeft = velocity > 0 ? currentStock / velocity : 9999;

      let speedLabel: ProductAnalysis["speedLabel"];
      if (velocity >= 5) speedLabel = "🔥 Fast";
      else if (velocity >= 1) speedLabel = "⚡ Moderate";
      else if (velocity > 0) speedLabel = "🐢 Slow";
      else speedLabel = "❄️ Dead";

      results.push({
        product_id: value.product_id,
        product_name: value.product_name,
        totalQty: value.totalQty,
        totalRevenue: value.totalRevenue,
        orderCount: value.saleIds.size,
        avgQtyPerOrder: value.saleIds.size > 0 ? value.totalQty / value.saleIds.size : 0,
        velocity: Math.round(velocity * 100) / 100,
        firstSaleDate: value.firstDate,
        lastSaleDate: value.lastDate,
        activeDays,
        daysInPeriod,
        sellFrequency: Math.round(sellFrequency),
        currentStock,
        daysOfStockLeft: Math.round(daysOfStockLeft),
        speedLabel,
      });
    }

    return results.sort((a, b) => b.totalQty - a.totalQty);
  }, [saleItems, sales, products, daysInPeriod]);

  // Zero sales products
  const zeroSalesProducts = useMemo(() => {
    const soldIds = new Set(productAnalysis.map((p) => p.product_id));
    return products.filter((p) => !soldIds.has(p.id));
  }, [products, productAnalysis]);

  // Filtered & sorted list
  const filteredProducts = useMemo(() => {
    let list = productAnalysis.filter((p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const va = a[sortField] as any;
      const vb = b[sortField] as any;
      if (typeof va === "string") {
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [productAnalysis, search, sortField, sortAsc]);

  const fastSellers = filteredProducts.filter((p) => p.speedLabel === "🔥 Fast" || p.speedLabel === "⚡ Moderate");
  const slowSellers = filteredProducts.filter((p) => p.speedLabel === "🐢 Slow" || p.speedLabel === "❄️ Dead");

  // Speed distribution for pie chart
  const speedDistribution = useMemo(() => {
    const counts = { "🔥 Fast": 0, "⚡ Moderate": 0, "🐢 Slow": 0, "❄️ Dead": 0 };
    for (const p of productAnalysis) counts[p.speedLabel]++;
    return Object.entries(counts)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [productAnalysis]);

  // Daily bill volume trend
  const dailyBillTrend = useMemo(() => {
    const dayMap = new Map<string, { date: string; bills: number; revenue: number; items: number }>();
    for (const s of sales) {
      const d = dayMap.get(s.date);
      if (d) { d.bills++; d.revenue += s.total || 0; }
      else dayMap.set(s.date, { date: s.date, bills: 1, revenue: s.total || 0, items: 0 });
    }
    const saleDateMap = new Map<string, string>();
    for (const s of sales) saleDateMap.set(s.id, s.date);
    for (const item of saleItems) {
      const date = saleDateMap.get(item.sale_id);
      if (date) {
        const d = dayMap.get(date);
        if (d) d.items += item.quantity;
      }
    }
    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [sales, saleItems]);

  // Monthly aggregation across selected period — bills, revenue, items, unique customers
  const monthlyBreakdown = useMemo(() => {
    const saleDateMap = new Map<string, string>();
    for (const s of sales) saleDateMap.set(s.id, s.date);
    const monthMap = new Map<string, { month: string; label: string; bills: number; revenue: number; items: number; qty: number; customers: Set<string> }>();
    for (const s of sales) {
      if (!s.date) continue;
      const month = s.date.slice(0, 7); // YYYY-MM
      let entry = monthMap.get(month);
      if (!entry) {
        const [y, m] = month.split("-").map(Number);
        const label = new Date(y, m - 1, 1).toLocaleDateString("en-PK", { month: "short", year: "numeric" });
        entry = { month, label, bills: 0, revenue: 0, items: 0, qty: 0, customers: new Set() };
        monthMap.set(month, entry);
      }
      entry.bills++;
      entry.revenue += Number(s.total || 0);
      if (s.customer_id) entry.customers.add(s.customer_id);
    }
    for (const item of saleItems) {
      const date = saleDateMap.get(item.sale_id);
      if (!date) continue;
      const month = date.slice(0, 7);
      const entry = monthMap.get(month);
      if (entry) {
        entry.items++;
        entry.qty += Number(item.quantity || 0);
      }
    }
    return Array.from(monthMap.values())
      .map((e) => ({ month: e.month, label: e.label, bills: e.bills, revenue: e.revenue, items: e.items, qty: e.qty, uniqueCustomers: e.customers.size, avgBill: e.bills > 0 ? Math.round(e.revenue / e.bills) : 0 }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [sales, saleItems]);

  // Top products of currently selected month (period === "month") — month-wise product ranking
  const monthlyTopProducts = useMemo(() => {
    return productAnalysis.slice(0, 25);
  }, [productAnalysis]);


  // Top customers from bills
  const topCustomers = useMemo(() => {
    const customerMap = new Map<string, string>();
    for (const c of contacts) customerMap.set(c.id, c.name);
    const spend = new Map<string, { name: string; total: number; bills: number }>();
    for (const s of sales) {
      if (!s.customer_id) continue;
      const name = customerMap.get(s.customer_id) || "Unknown";
      const ex = spend.get(s.customer_id);
      if (ex) { ex.total += s.total || 0; ex.bills++; }
      else spend.set(s.customer_id, { name, total: s.total || 0, bills: 1 });
    }
    return Array.from(spend.values()).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [sales, contacts]);

  // Selected product daily trend
  const selectedProductData = useMemo(() => {
    if (!selectedProduct) return null;
    const stat = productAnalysis.find((p) => p.product_id === selectedProduct);
    const items = saleItems.filter((i) => (i.product_id || i.product_name) === selectedProduct);
    const saleDateMap = new Map<string, string>();
    for (const s of sales) saleDateMap.set(s.id, s.date);
    const dailyMap = new Map<string, { qty: number; revenue: number }>();
    for (const item of items) {
      const date = saleDateMap.get(item.sale_id) || "unknown";
      const ex = dailyMap.get(date);
      if (ex) { ex.qty += item.quantity; ex.revenue += item.subtotal; }
      else dailyMap.set(date, { qty: item.quantity, revenue: item.subtotal });
    }
    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return { stat, daily };
  }, [selectedProduct, saleItems, sales, productAnalysis]);

  const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
  const speedColor = (label: string) => {
    if (label.includes("Fast")) return "text-success";
    if (label.includes("Moderate")) return "text-primary";
    if (label.includes("Slow")) return "text-warning";
    return "text-destructive";
  };
  const speedBg = (label: string) => {
    if (label.includes("Fast")) return "bg-success/10 border-success/30 text-success";
    if (label.includes("Moderate")) return "bg-primary/10 border-primary/30 text-primary";
    if (label.includes("Slow")) return "bg-warning/10 border-warning/30 text-warning";
    return "bg-destructive/10 border-destructive/30 text-destructive";
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-3 py-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1 justify-end">
        {label}
        {sortField === field ? (
          sortAsc ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
        ) : null}
      </span>
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with prominent search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" /> Product Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Observing {sales.length} bills · {dateRange.label} ({dateRange.from} → {dateRange.to})
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
                <SelectItem value="month">📅 Specific Month</SelectItem>
              </SelectContent>
            </Select>
            {period === "month" && (
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-[170px]"
              />
            )}
          </div>
        </div>

        {/* Prominent Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="🔍 Search any product to see its sales performance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 text-base border-2 focus:border-primary"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Quick search info */}
        {search && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Found <strong className="text-foreground">{filteredProducts.length}</strong> products matching "<strong className="text-primary">{search}</strong>"</span>
            {filteredProducts.length > 0 && (
              <span>— Top seller: <strong className="text-success">{filteredProducts[0]?.product_name}</strong> ({filteredProducts[0]?.totalQty} units)</span>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Bills Observed</p>
            <p className="text-2xl font-bold text-primary">{sales.length}</p>
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Products Analyzed</p>
            <p className="text-2xl font-bold text-accent">{productAnalysis.length}</p>
          </CardContent>
        </Card>
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" /> Fast Sellers</p>
            <p className="text-2xl font-bold text-success">{productAnalysis.filter((p) => p.speedLabel === "🔥 Fast").length}</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Slow Movers</p>
            <p className="text-2xl font-bold text-warning">{productAnalysis.filter((p) => p.speedLabel === "🐢 Slow").length}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Snowflake className="h-3 w-3" /> Dead / Zero Sales</p>
            <p className="text-2xl font-bold text-destructive">{zeroSalesProducts.length + productAnalysis.filter((p) => p.speedLabel === "❄️ Dead").length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ranking" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="ranking">📊 Most Selling (Ranked)</TabsTrigger>
          <TabsTrigger value="monthly">📅 Monthly Breakdown</TabsTrigger>
          <TabsTrigger value="fast">🔥 Fast Sellers</TabsTrigger>
          <TabsTrigger value="slow">🐢 Slow / Dead</TabsTrigger>
          <TabsTrigger value="bills">📈 Bill Trends</TabsTrigger>
          <TabsTrigger value="detail">🔍 Product Detail</TabsTrigger>
          <TabsTrigger value="report">📋 Products Report</TabsTrigger>
        </TabsList>

        {/* ═══ Monthly Breakdown Tab ═══ */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Month-wise Sales Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Switch the period to <strong>Last Year</strong> for a 12-month view, or pick a specific month above for daily detail.
              </p>
            </CardHeader>
            <CardContent>
              {monthlyBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No bills in this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue (Rs.)" />
                    <Line yAxisId="right" type="monotone" dataKey="bills" stroke="hsl(var(--accent))" strokeWidth={2} dot name="Bills" />
                    <Line yAxisId="right" type="monotone" dataKey="qty" stroke="hsl(var(--chart-3))" strokeWidth={2} dot name="Items Sold" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Monthly Summary Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No data to display</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Month</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Bills</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Revenue</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Avg / Bill</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Items</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Units Sold</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Unique Customers</th>
                        <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyBreakdown.map((m) => (
                        <tr key={m.month} className="border-t border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium text-foreground">{m.label}</td>
                          <td className="px-4 py-3 text-right text-primary font-semibold">{m.bills.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-accent font-bold">{formatPKR(m.revenue)}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{formatPKR(m.avgBill)}</td>
                          <td className="px-4 py-3 text-right">{m.items.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">{m.qty.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">{m.uniqueCustomers}</td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setPeriod("month"); setSelectedMonth(m.month); }}
                            >
                              <Eye className="h-3 w-3 mr-1" /> Drill in
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/30 font-bold">
                      <tr>
                        <td className="px-4 py-3">Total ({monthlyBreakdown.length} months)</td>
                        <td className="px-4 py-3 text-right">{monthlyBreakdown.reduce((s, m) => s + m.bills, 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-accent">{formatPKR(monthlyBreakdown.reduce((s, m) => s + m.revenue, 0))}</td>
                        <td className="px-4 py-3 text-right">—</td>
                        <td className="px-4 py-3 text-right">{monthlyBreakdown.reduce((s, m) => s + m.items, 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{monthlyBreakdown.reduce((s, m) => s + m.qty, 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">—</td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {period === "month" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" /> Top Products in {dateRange.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyTopProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No products sold in {dateRange.label}</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Rank</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Product</th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Units Sold</th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Revenue</th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Bills</th>
                          <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Speed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyTopProducts.map((p, i) => (
                          <tr key={p.product_id} className="border-t border-border hover:bg-muted/30">
                            <td className="px-4 py-3 font-bold">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{p.product_name}</td>
                            <td className="px-4 py-3 text-right font-bold">{p.totalQty.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-accent font-semibold">{formatPKR(p.totalRevenue)}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{p.orderCount}</td>
                            <td className="px-4 py-3 text-center"><Badge variant="outline" className={speedBg(p.speedLabel)}>{p.speedLabel}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ Most Selling Products - Ranked ═══ */}
        <TabsContent value="ranking" className="space-y-4">
          {/* Top 10 Bar Chart */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Speed Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={speedDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value"
                      label={({ name, value }) => `${name} ${value}`}>
                      {speedDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" /> Top 10 Most Sold Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[...filteredProducts].sort((a, b) => b.totalQty - a.totalQty).slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis dataKey="product_name" type="category" tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} width={95} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                      formatter={(v: any, name: any) => [
                        name === "totalQty" ? `${v} units sold` : `${v} units/day`,
                        name === "totalQty" ? "Total Sold" : "Velocity"
                      ]}
                    />
                    <Bar dataKey="totalQty" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="totalQty" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sort controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
            {[
              { field: "totalQty" as SortField, label: "Most Sold" },
              { field: "totalRevenue" as SortField, label: "Revenue" },
              { field: "velocity" as SortField, label: "Velocity" },
              { field: "orderCount" as SortField, label: "Bill Count" },
              { field: "product_name" as SortField, label: "Name" },
            ].map((btn) => (
              <Button
                key={btn.field}
                variant={sortField === btn.field ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort(btn.field)}
                className="gap-1"
              >
                {btn.label}
                {sortField === btn.field && (sortAsc ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
              </Button>
            ))}
          </div>

          {/* Full ranked table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> All {filteredProducts.length} Products — Ranked by {sortField === "totalQty" ? "Most Sold" : sortField}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm">{search ? `No results for "${search}"` : "No sales data in this period"}</p>
                  {analyticsError && <p className="text-sm text-destructive mt-2">{analyticsError}</p>}
                  {!search && (
                    <p className="text-xs mt-2">Bills loaded: {sales.length} · Sale items loaded: {saleItems.length}</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Rank</th>
                        <SortHeader field="product_name" label="Product" />
                        <th className="px-3 py-3 text-center font-semibold text-muted-foreground">Speed</th>
                        <SortHeader field="totalQty" label="Total Sold" />
                        <SortHeader field="totalRevenue" label="Revenue" />
                        <SortHeader field="velocity" label="Units/Day" />
                        <SortHeader field="orderCount" label="Bills" />
                        <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Active Days</th>
                        <SortHeader field="currentStock" label="Stock" />
                        <SortHeader field="daysOfStockLeft" label="Days Left" />
                        <th className="px-3 py-3 text-center font-semibold text-muted-foreground">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p, i) => (
                        <motion.tr
                          key={p.product_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.02, 0.5) }}
                          className="border-t border-border hover:bg-muted/30"
                        >
                          <td className="px-3 py-2.5">
                            <span className={`font-bold ${i < 3 ? "text-primary text-lg" : "text-muted-foreground"}`}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-medium text-foreground max-w-[200px] truncate">{p.product_name}</td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge variant="outline" className={speedBg(p.speedLabel)}>{p.speedLabel}</Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-foreground">{p.totalQty.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-accent font-semibold">{formatPKR(p.totalRevenue)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={speedColor(p.speedLabel) + " font-bold"}>{p.velocity}/day</span>
                          </td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{p.orderCount}</td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{p.activeDays}/{daysInPeriod}d</td>
                          <td className="px-3 py-2.5 text-right">{p.currentStock}</td>
                          <td className="px-3 py-2.5 text-right">
                            {p.daysOfStockLeft < 9999 ? (
                              <span className={p.daysOfStockLeft < 7 ? "text-destructive font-bold" : "text-muted-foreground"}>
                                {p.daysOfStockLeft}d
                              </span>
                            ) : <span className="text-muted-foreground">∞</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedProduct(p.product_id); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Fast Sellers Tab ═══ */}
        <TabsContent value="fast" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-success" /> Fast & Moderate Sellers — These sell HIGH & FAST
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fastSellers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No fast sellers found in this period</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={fastSellers.slice(0, 15)} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis dataKey="product_name" type="category" tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} width={95} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="totalQty" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Total Sold" />
                      <Bar dataKey="velocity" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Units/Day" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="overflow-x-auto rounded-lg border border-border mt-4">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Product</th>
                          <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Speed</th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Units/Day</th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total Sold</th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Revenue</th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Stock Left</th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Days of Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fastSellers.map((p, i) => (
                          <motion.tr key={p.product_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                            className="border-t border-border hover:bg-muted/30">
                            <td className="px-4 py-3 font-bold text-primary">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{p.product_name}</td>
                            <td className="px-4 py-3 text-center"><Badge variant="outline" className={speedBg(p.speedLabel)}>{p.speedLabel}</Badge></td>
                            <td className="px-4 py-3 text-right font-bold text-success">{p.velocity}/day</td>
                            <td className="px-4 py-3 text-right font-semibold">{p.totalQty.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-accent">{formatPKR(p.totalRevenue)}</td>
                            <td className="px-4 py-3 text-right">{p.currentStock}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={p.daysOfStockLeft < 7 ? "text-destructive font-bold" : ""}>{p.daysOfStockLeft < 9999 ? `${p.daysOfStockLeft}d` : "∞"}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Slow / Dead Tab ═══ */}
        <TabsContent value="slow" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-destructive" /> Slow Movers & Dead Stock — These are NOT selling
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slowSellers.length === 0 && zeroSalesProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">🎉 All products are selling well!</p>
              ) : (
                <>
                  {slowSellers.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-border mb-4">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Product</th>
                            <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Speed</th>
                            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Units/Day</th>
                            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total Sold</th>
                            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Active Days</th>
                            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slowSellers.map((p, i) => (
                            <motion.tr key={p.product_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                              className="border-t border-border hover:bg-muted/30">
                              <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                              <td className="px-4 py-3 font-medium text-foreground">{p.product_name}</td>
                              <td className="px-4 py-3 text-center"><Badge variant="outline" className={speedBg(p.speedLabel)}>{p.speedLabel}</Badge></td>
                              <td className="px-4 py-3 text-right font-bold text-destructive">{p.velocity}/day</td>
                              <td className="px-4 py-3 text-right">{p.totalQty}</td>
                              <td className="px-4 py-3 text-right text-muted-foreground">{p.activeDays}/{daysInPeriod}d</td>
                              <td className="px-4 py-3 text-right">{p.currentStock}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {zeroSalesProducts.length > 0 && (
                    <>
                      <h3 className="text-sm font-semibold text-destructive mt-4 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Zero Sales — Never appeared on any bill ({zeroSalesProducts.length} products)
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {zeroSalesProducts.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                            <div>
                              <p className="font-medium text-foreground text-sm">{p.name}</p>
                              <p className="text-xs text-muted-foreground">Stock: {p.quantity ?? 0} | {formatPKR(p.selling_price ?? 0)}</p>
                            </div>
                            <Badge variant="outline" className="text-destructive border-destructive/30">No Bills</Badge>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Bill Trends Tab ═══ */}
        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> Daily Bills & Items Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dailyBillTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} />
                  <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    labelFormatter={(d: any) => new Date(String(d)).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeWidth={2} name="Revenue" />
                  <Bar yAxisId="right" dataKey="bills" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Bills" barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="items" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Items Sold" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Top Customers (from Bills)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCustomers.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total Spent</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Bills</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.map((c, i) => (
                        <tr key={i} className="border-t border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-bold text-primary">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                          <td className="px-4 py-3 text-right font-semibold text-accent">{formatPKR(c.total)}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{c.bills}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No customer data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Product Detail Tab ═══ */}
        <TabsContent value="detail" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" /> Select a Product to Analyze
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedProduct || ""} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product..." />
                </SelectTrigger>
                <SelectContent>
                  {productAnalysis.map((p) => (
                    <SelectItem key={p.product_id} value={p.product_id}>
                      {p.product_name} — {p.totalQty} sold ({p.speedLabel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProductData && selectedProductData.stat && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Total Sold</p>
                      <p className="text-xl font-bold text-foreground">{selectedProductData.stat.totalQty.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-xl font-bold text-accent">{formatPKR(selectedProductData.stat.totalRevenue)}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Velocity</p>
                      <p className="text-xl font-bold"><span className={speedColor(selectedProductData.stat.speedLabel)}>{selectedProductData.stat.velocity}/day</span></p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Speed</p>
                      <p className="text-xl font-bold"><Badge variant="outline" className={speedBg(selectedProductData.stat.speedLabel)}>{selectedProductData.stat.speedLabel}</Badge></p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={selectedProductData.daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} />
                      <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      <Bar yAxisId="left" dataKey="qty" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Units Sold" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot name="Revenue" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Products Report Tab ═══ */}
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Products Report — Last {daysInPeriod} Days
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete sales report with revenue, velocity, stock status & sell-through rate
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const rows = filteredProducts.map((p, i) => ({
                        Rank: i + 1,
                        Product: p.product_name,
                        Speed: p.speedLabel,
                        "Total Sold": p.totalQty,
                        "Revenue (Rs.)": Math.round(p.totalRevenue),
                        "Avg Qty / Bill": Math.round(p.avgQtyPerOrder * 100) / 100,
                        "Velocity (units/day)": p.velocity,
                        Bills: p.orderCount,
                        "Active Days": `${p.activeDays}/${daysInPeriod}`,
                        "Sell Frequency %": p.sellFrequency,
                        "Current Stock": p.currentStock,
                        "Days of Stock Left": p.daysOfStockLeft >= 9999 ? "∞" : p.daysOfStockLeft,
                        "First Sale": p.firstSaleDate || "—",
                        "Last Sale": p.lastSaleDate || "—",
                      }));
                      if (rows.length === 0) {
                        toast.error("No data to export");
                        return;
                      }
                      exportToExcel(rows, `products-report-${daysInPeriod}d-${new Date().toISOString().split("T")[0]}`, "Products Report");
                      toast.success(`Exported ${rows.length} products to Excel`);
                    }}
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      if (filteredProducts.length === 0) {
                        toast.error("No data to print");
                        return;
                      }
                      const headers = [
                        "#", "Product", "Speed", "Total Sold", "Revenue (Rs.)",
                        "Velocity/day", "Bills", "Active Days", "Stock", "Days Left",
                      ];
                      const rows = filteredProducts.map((p, i) => [
                        String(i + 1),
                        p.product_name,
                        p.speedLabel,
                        String(p.totalQty),
                        formatPKR(p.totalRevenue),
                        String(p.velocity),
                        String(p.orderCount),
                        `${p.activeDays}/${daysInPeriod}`,
                        String(p.currentStock),
                        p.daysOfStockLeft >= 9999 ? "∞" : `${p.daysOfStockLeft}d`,
                      ]);
                      const ok = printAsPDF(`Products Report (Last ${daysInPeriod} Days)`, headers, rows);
                      if (!ok) toast.error("Could not open print window — check pop-up blocker");
                    }}
                  >
                    <Printer className="h-4 w-4" /> Print / PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Products in Report</p>
                  <p className="text-xl font-bold text-foreground">{filteredProducts.length}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Total Units Sold</p>
                  <p className="text-xl font-bold text-primary">
                    {filteredProducts.reduce((s, p) => s + p.totalQty, 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold text-accent">
                    {formatPKR(filteredProducts.reduce((s, p) => s + p.totalRevenue, 0))}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Avg Velocity</p>
                  <p className="text-xl font-bold text-foreground">
                    {filteredProducts.length > 0
                      ? (filteredProducts.reduce((s, p) => s + p.velocity, 0) / filteredProducts.length).toFixed(2)
                      : "0"}
                    <span className="text-xs text-muted-foreground font-normal"> /day</span>
                  </p>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No products to report</p>
                  <p className="text-sm">{search ? `No results for "${search}"` : "No sales data in this period"}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-3 text-left font-semibold text-muted-foreground">#</th>
                        <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Product</th>
                        <th className="px-3 py-3 text-center font-semibold text-muted-foreground">Speed</th>
                        <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Sold</th>
                        <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Revenue</th>
                        <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Avg/Bill</th>
                        <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Velocity</th>
                        <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Bills</th>
                        <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Freq %</th>
                        <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Stock</th>
                        <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Days Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p, i) => (
                        <tr key={p.product_id} className="border-t border-border hover:bg-muted/30">
                          <td className="px-3 py-2.5 text-muted-foreground">{i + 1}</td>
                          <td className="px-3 py-2.5 font-medium text-foreground max-w-[200px] truncate">{p.product_name}</td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge variant="outline" className={speedBg(p.speedLabel)}>{p.speedLabel}</Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold">{p.totalQty.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-accent font-semibold">{formatPKR(p.totalRevenue)}</td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{p.avgQtyPerOrder.toFixed(1)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={speedColor(p.speedLabel) + " font-semibold"}>{p.velocity}/d</span>
                          </td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{p.orderCount}</td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{p.sellFrequency}%</td>
                          <td className="px-3 py-2.5 text-right">{p.currentStock}</td>
                          <td className="px-3 py-2.5 text-right">
                            {p.daysOfStockLeft < 9999 ? (
                              <span className={p.daysOfStockLeft < 7 ? "text-destructive font-bold" : "text-muted-foreground"}>
                                {p.daysOfStockLeft}d
                              </span>
                            ) : <span className="text-muted-foreground">∞</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/40 sticky bottom-0">
                      <tr className="border-t-2 border-border font-bold">
                        <td className="px-3 py-3" colSpan={3}>Totals ({filteredProducts.length} products)</td>
                        <td className="px-3 py-3 text-right">{filteredProducts.reduce((s, p) => s + p.totalQty, 0).toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-accent">{formatPKR(filteredProducts.reduce((s, p) => s + p.totalRevenue, 0))}</td>
                        <td className="px-3 py-3" colSpan={4}></td>
                        <td className="px-3 py-3 text-right">{filteredProducts.reduce((s, p) => s + p.currentStock, 0).toLocaleString()}</td>
                        <td className="px-3 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {zeroSalesProducts.length > 0 && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {zeroSalesProducts.length} products with ZERO sales in this period
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Combined idle stock value: <strong className="text-destructive">
                      {formatPKR(zeroSalesProducts.reduce((s, p) => s + (p.selling_price ?? 0) * (p.quantity ?? 0), 0))}
                    </strong>
                    {" "}across {zeroSalesProducts.reduce((s, p) => s + (p.quantity ?? 0), 0)} units
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
