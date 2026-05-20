import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAppSettings, useSessionTimeout } from "@/hooks/useAppSettings";
import { initializeDefaultData } from "@/lib/store";
import { useEffect, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import CustomCursor from "@/components/CustomCursor";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import POSPage from "@/pages/POSPage";
import BillsPage from "@/pages/BillsPage";
import ContactsPage from "@/pages/ContactsPage";
import ProductsPage from "@/pages/ProductsPage";
import PurchasesPage from "@/pages/PurchasesPage";
import ExpensesPage from "@/pages/ExpensesPage";
import ReportsPage from "@/pages/ReportsPage";
import ProductAnalyticsPage from "@/pages/ProductAnalyticsPage";
import SummaryPage from "@/pages/SummaryPage";
import BackupPage from "@/pages/BackupPage";
import SettingsPage from "@/pages/SettingsPage";
import LedgerPage from "@/pages/LedgerPage";
import AdminPage from "@/pages/AdminPage";
import InventoryPage from "@/pages/InventoryPage";
import PriceListPage from "@/pages/PriceListPage";
import ProfitCalculatorPage from "@/pages/ProfitCalculatorPage";
import AuditPage from "@/pages/AuditPage";
import CategoryPage from "@/pages/CategoryPage";
import DataCleanupPage from "@/pages/DataCleanupPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, role, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && role !== "admin") return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-[3px] border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function IndexRoute() {
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useAppSettings();

  const handleSessionTimeout = useCallback(async () => {
    if (!user) return;
    const { supabase } = await import("@/integrations/supabase/customClient");
    await supabase.auth.signOut();
    toast.warning("Session expired due to inactivity. Please log in again.");
    navigate("/login");
  }, [user, navigate]);

  useSessionTimeout(handleSessionTimeout);

  useEffect(() => {
    initializeDefaultData()
      .then(() => setReady(true))
      .catch(() => setReady(true));
    const timer = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !ready) return <LoadingScreen />;
  if (!user) return <HomePage />;
  return <AppLayout><DashboardPage /></AppLayout>;
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CustomCursor />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<IndexRoute />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
            <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
            <Route path="/products-db" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/purchases" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/product-analytics" element={<ProtectedRoute><ProductAnalyticsPage /></ProtectedRoute>} />
            <Route path="/summary" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
            <Route path="/price-list" element={<ProtectedRoute><PriceListPage /></ProtectedRoute>} />
            <Route path="/profit" element={<ProtectedRoute><ProfitCalculatorPage /></ProtectedRoute>} />
            <Route path="/backup" element={<ProtectedRoute><BackupPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/ledger" element={<ProtectedRoute><LedgerPage /></ProtectedRoute>} />
            <Route path="/audit" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            <Route path="/data-cleanup" element={<ProtectedRoute adminOnly><DataCleanupPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
