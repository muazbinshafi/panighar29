// @ts-nocheck
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Users, Shield, LogOut, UserCircle, ShoppingCart, Receipt, CreditCard, Menu, X, Boxes, BarChart3, FileText, CalendarDays, BookOpen, ClipboardList, Cloud, Settings, Wifi, WifiOff, RefreshCw, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationsCenter from "@/components/NotificationsCenter";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, role, signOut, isGuest, exitGuest } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "1";
  });
  const toggleDesktop = () => {
    setDesktopCollapsed((v) => {
      const nv = !v;
      try { localStorage.setItem("sidebar-collapsed", nv ? "1" : "0"); } catch {}
      return nv;
    });
  };
  const desktopWidth = desktopCollapsed ? "4rem" : "16rem";
  const { isOnline, queueLength, syncing, syncQueue, lastSyncedAt } = useOfflineSync();

  const allNavItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", adminOnly: false },
    { to: "/pos", icon: CreditCard, label: "POS", adminOnly: false },
    { to: "/bills", icon: FileText, label: "Bills & Invoices", adminOnly: false },
    { to: "/contacts", icon: UserCircle, label: "Contacts", adminOnly: false },
    { to: "/products-db", icon: Boxes, label: "Products", adminOnly: false },
    { to: "/purchases", icon: ShoppingCart, label: "Purchases", adminOnly: false },
    { to: "/expenses", icon: Receipt, label: "Expenses", adminOnly: false },
    { to: "/reports", icon: BarChart3, label: "Daily Reports", adminOnly: false },
    { to: "/product-analytics", icon: TrendingUp, label: "Product Analytics", adminOnly: false },
    { to: "/summary", icon: CalendarDays, label: "Monthly Summary", adminOnly: false },
    { to: "/backup", icon: Cloud, label: "Backup", adminOnly: false },
    { to: "/settings", icon: Settings, label: "Settings", adminOnly: false },
    { to: "/ledger", icon: BookOpen, label: "Customer Ledger", adminOnly: false },
    // audit trail removed
    { to: "/admin", icon: Shield, label: "Admin Panel", adminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || role === "admin");

  const sidebar = (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200",
      isMobile && !sidebarOpen && "-translate-x-full"
    )} style={{ width: isMobile ? '16rem' : desktopWidth }}>
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <Package className="h-7 w-7 text-sidebar-primary shrink-0" />
          {!desktopCollapsed && <span className="text-lg font-bold tracking-tight whitespace-nowrap">Qazi Enterprises</span>}
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-sidebar-muted hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={desktopCollapsed ? item.label : undefined}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                desktopCollapsed && !isMobile && "justify-center px-2",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {(!desktopCollapsed || isMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        {(!desktopCollapsed || isMobile) && <p className="text-xs text-sidebar-muted mb-2 truncate">{user?.email}</p>}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          title="Sign Out"
          className={cn(
            "w-full gap-2 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
            desktopCollapsed && !isMobile ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="h-4 w-4" /> {(!desktopCollapsed || isMobile) && "Sign Out"}
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {isMobile && sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />}
      {sidebar}
      <main className="flex-1 transition-all duration-200" style={!isMobile ? { paddingLeft: desktopWidth } : undefined}>
        {isGuest && (
          <div className="sticky top-0 z-40 flex flex-wrap items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent px-4 py-2 text-primary-foreground text-xs sm:text-sm font-medium">
            <span>👁️ Guest Preview Mode — you're exploring the dashboard with demo access. Real data is hidden.</span>
            <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => { exitGuest(); window.location.href = "/login"; }}>
              Sign in for full access
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-primary-foreground hover:bg-white/20" onClick={() => { exitGuest(); window.location.href = "/"; }}>
              Exit
            </Button>
          </div>
        )}
        {!isOnline && (
          <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-destructive-foreground text-sm font-medium" style={isGuest ? { top: 40 } : undefined}>
            <WifiOff className="h-4 w-4" />
            <span>You're offline — changes are being saved locally and will sync automatically when reconnected</span>
            {queueLength > 0 && (
              <Badge variant="secondary" className="ml-2">
                {queueLength} pending
              </Badge>
            )}
          </div>
        )}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4" style={!isOnline ? { top: 36 } : undefined}>
          {isMobile ? (
            <button onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          ) : (
            <button onClick={toggleDesktop} aria-label="Toggle sidebar" className="text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
          )}
          <span className="font-semibold flex-1">{isMobile ? "Qazi Enterprises" : ""}</span>
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1 text-xs text-success">
                <Wifi className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <WifiOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}
            {queueLength > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-warning"
                onClick={syncQueue}
                disabled={syncing || !isOnline}
              >
                <RefreshCw className={cn("h-3 w-3", syncing && "animate-spin")} />
                {syncing ? "Syncing..." : `${queueLength} pending`}
              </Button>
            )}
          </div>
          <NotificationsCenter />
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
