// @ts-nocheck
import { useEffect, useCallback } from "react";

export interface AppSettings {
  // Business
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessEmail: string;
  businessTagline: string;
  businessWebsite: string;
  businessLogo: string;
  businessRegistration: string;
  businessNTN: string;
  // Localization
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  numberFormat: string;
  timezone: string;
  language: string;
  // POS
  defaultPaymentMethod: string;
  defaultPaymentStatus: string;
  posGridColumns: string;
  autoCreateCustomer: boolean;
  enableBarcode: boolean;
  soundOnSale: boolean;
  posQuickActions: boolean;
  posShowStock: boolean;
  posConfirmSale: boolean;
  // Invoice
  invoicePrefix: string;
  invoiceStartNumber: number;
  invoiceTerms: string;
  invoiceNotes: string;
  showSignatureLine: boolean;
  showTermsOnInvoice: boolean;
  // Tax
  taxEnabled: boolean;
  taxRate: number;
  taxLabel: string;
  taxRegistrationNo: string;
  taxInclusive: boolean;
  // Receipt
  receiptShowLogo: boolean;
  receiptFooterText: string;
  receiptShowTax: boolean;
  receiptShowBarcode: boolean;
  receiptPaperSize: string;
  receiptCopies: number;
  // WhatsApp
  enableWhatsApp: boolean;
  whatsAppDefault: string;
  whatsAppTemplate: string;
  // Alerts
  lowStockAlert: boolean;
  lowStockThreshold: number;
  emailAlerts: boolean;
  dailySummaryAlert: boolean;
  paymentDueAlert: boolean;
  expiryAlert: boolean;
  // Appearance
  theme: string;
  sidebarColor: string;
  accentColor: string;
  fontSize: string;
  compactMode: boolean;
  animationsEnabled: boolean;
  cursorStyle: string;
  borderRadius: string;
  cardStyle: string;
  tableDensity: string;
  headerStyle: string;
  glassEffect: boolean;
  showBreadcrumbs: boolean;
  pageTransitions: boolean;
  sidebarWidth: string;
  // Backup
  autoBackup: boolean;
  backupFrequency: string;
  dataRetentionDays: number;
  // Printing
  printOnSave: boolean;
  defaultPrinter: string;
  printMargins: string;
  // Security
  sessionTimeout: number;
  requirePasswordChange: boolean;
  twoFactorEnabled: boolean;
  loginAttemptLimit: number;
  ipWhitelist: string;
  // Users
  enableMultiUser: boolean;
  defaultUserRole: string;
  allowSelfRegistration: boolean;
  // Advanced
  enableAPI: boolean;
  debugMode: boolean;
  cacheEnabled: boolean;
  exportFormat: string;
  decimalPlaces: number;
  roundingMethod: string;
  negativeSalesAllowed: boolean;
  editAfterSave: boolean;
  deleteRequiresPassword: boolean;
}

const defaultSettings: AppSettings = {
  businessName: "Qazi Enterprises",
  businessPhone: "",
  businessAddress: "",
  businessEmail: "",
  businessTagline: "Your trusted business partner",
  businessWebsite: "",
  businessLogo: "",
  businessRegistration: "",
  businessNTN: "",
  currency: "PKR",
  currencySymbol: "Rs",
  dateFormat: "dd/MM/yyyy",
  numberFormat: "en-PK",
  timezone: "Asia/Karachi",
  language: "en",
  defaultPaymentMethod: "cash",
  defaultPaymentStatus: "paid",
  posGridColumns: "4",
  autoCreateCustomer: true,
  enableBarcode: true,
  soundOnSale: true,
  posQuickActions: true,
  posShowStock: true,
  posConfirmSale: true,
  invoicePrefix: "QE-",
  invoiceStartNumber: 1001,
  invoiceTerms: "Payment is due within 30 days of invoice date.",
  invoiceNotes: "",
  showSignatureLine: true,
  showTermsOnInvoice: true,
  taxEnabled: false,
  taxRate: 0,
  taxLabel: "GST",
  taxRegistrationNo: "",
  taxInclusive: false,
  receiptShowLogo: true,
  receiptFooterText: "Thank you for your business!",
  receiptShowTax: false,
  receiptShowBarcode: true,
  receiptPaperSize: "80mm",
  receiptCopies: 1,
  enableWhatsApp: true,
  whatsAppDefault: "",
  whatsAppTemplate: "Dear {customer}, your invoice #{invoice} of Rs {total} is ready. Thank you!",
  lowStockAlert: true,
  lowStockThreshold: 10,
  emailAlerts: false,
  dailySummaryAlert: false,
  paymentDueAlert: true,
  expiryAlert: false,
  theme: "system",
  sidebarColor: "dark",
  accentColor: "amber",
  fontSize: "normal",
  compactMode: false,
  animationsEnabled: true,
  cursorStyle: "neon-glow",
  borderRadius: "medium",
  cardStyle: "default",
  tableDensity: "normal",
  headerStyle: "gradient",
  glassEffect: false,
  showBreadcrumbs: true,
  pageTransitions: true,
  sidebarWidth: "normal",
  autoBackup: false,
  backupFrequency: "daily",
  dataRetentionDays: 365,
  printOnSave: false,
  defaultPrinter: "default",
  printMargins: "normal",
  sessionTimeout: 30,
  requirePasswordChange: false,
  twoFactorEnabled: false,
  loginAttemptLimit: 5,
  ipWhitelist: "",
  enableMultiUser: true,
  defaultUserRole: "user",
  allowSelfRegistration: false,
  enableAPI: false,
  debugMode: false,
  cacheEnabled: true,
  exportFormat: "xlsx",
  decimalPlaces: 2,
  roundingMethod: "round",
  negativeSalesAllowed: false,
  editAfterSave: true,
  deleteRequiresPassword: false,
};

/** Read full settings from localStorage, merged with defaults */
export function getAppSettings(): AppSettings {
  if (typeof localStorage === 'undefined') return { ...defaultSettings };
  try {
    const raw = localStorage.getItem("app_settings");
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
}

// ── Accent color palettes (HSL tokens) ──
const accentPalettes: Record<string, {
  foreground: string;
  primary: string;
  accent: string;
  success: string;
  warning: string;
}> = {
  amber: { foreground: "0 0% 100%", primary: "38 92% 50%", accent: "25 95% 53%", success: "142 71% 45%", warning: "48 96% 53%" },
  blue: { foreground: "0 0% 100%", primary: "217 91% 60%", accent: "199 89% 48%", success: "162 73% 46%", warning: "43 96% 56%" },
  green: { foreground: "0 0% 100%", primary: "142 71% 45%", accent: "168 76% 42%", success: "120 65% 50%", warning: "84 81% 44%" },
  red: { foreground: "0 0% 100%", primary: "0 72% 51%", accent: "340 82% 52%", success: "16 85% 57%", warning: "45 93% 47%" },
  purple: { foreground: "0 0% 100%", primary: "270 60% 55%", accent: "290 65% 50%", success: "240 55% 60%", warning: "310 60% 58%" },
  teal: { foreground: "0 0% 100%", primary: "174 72% 40%", accent: "190 80% 42%", success: "160 65% 45%", warning: "140 55% 50%" },
  ocean: { foreground: "0 0% 100%", primary: "200 80% 50%", accent: "170 70% 45%", success: "155 65% 50%", warning: "220 75% 60%" },
  sunset: { foreground: "0 0% 100%", primary: "15 85% 55%", accent: "340 75% 55%", success: "45 90% 50%", warning: "30 90% 60%" },
  forest: { foreground: "0 0% 100%", primary: "150 60% 40%", accent: "90 50% 45%", success: "120 55% 50%", warning: "50 70% 55%" },
  galaxy: { foreground: "0 0% 100%", primary: "265 70% 55%", accent: "200 80% 55%", success: "320 65% 55%", warning: "180 60% 50%" },
  cherry: { foreground: "0 0% 100%", primary: "350 80% 50%", accent: "320 70% 55%", success: "10 75% 60%", warning: "0 65% 65%" },
  aqua: { foreground: "0 0% 100%", primary: "185 75% 45%", accent: "210 70% 55%", success: "160 65% 48%", warning: "195 80% 40%" },
  rose: { foreground: "0 0% 100%", primary: "350 70% 65%", accent: "330 60% 60%", success: "10 65% 68%", warning: "320 50% 55%" },
  lavender: { foreground: "0 0% 100%", primary: "260 50% 70%", accent: "280 45% 65%", success: "240 45% 68%", warning: "300 40% 62%" },
  peach: { foreground: "0 0% 100%", primary: "20 80% 68%", accent: "35 75% 62%", success: "10 70% 70%", warning: "45 80% 58%" },
  mint: { foreground: "0 0% 100%", primary: "160 50% 60%", accent: "180 50% 55%", success: "140 45% 58%", warning: "170 55% 52%" },
  sky: { foreground: "0 0% 100%", primary: "200 75% 65%", accent: "215 70% 60%", success: "185 65% 58%", warning: "225 60% 62%" },
  coral: { foreground: "0 0% 100%", primary: "10 75% 62%", accent: "25 80% 58%", success: "0 65% 65%", warning: "35 85% 55%" },
  lilac: { foreground: "0 0% 100%", primary: "280 45% 72%", accent: "260 40% 68%", success: "300 40% 70%", warning: "250 35% 65%" },
  sage: { foreground: "0 0% 100%", primary: "140 30% 55%", accent: "120 25% 50%", success: "160 35% 52%", warning: "100 30% 50%" },
  blush: { foreground: "0 0% 100%", primary: "340 55% 72%", accent: "350 50% 68%", success: "330 45% 70%", warning: "0 50% 65%" },
  mauve: { foreground: "0 0% 100%", primary: "300 25% 60%", accent: "280 30% 58%", success: "320 25% 62%", warning: "270 25% 55%" },
  seafoam: { foreground: "0 0% 100%", primary: "170 45% 58%", accent: "190 50% 52%", success: "155 40% 55%", warning: "200 45% 50%" },
  dustyblue: { foreground: "0 0% 100%", primary: "210 35% 62%", accent: "225 40% 58%", success: "195 35% 58%", warning: "240 35% 60%" },
};

const sidebarPalettes: Record<string, Record<string, string>> = {
  dark: {
    "--sidebar-background": "245 25% 14%",
    "--sidebar-foreground": "220 15% 88%",
    "--sidebar-accent": "245 22% 18%",
    "--sidebar-accent-foreground": "220 15% 88%",
    "--sidebar-border": "245 18% 22%",
    "--sidebar-muted": "240 8% 48%",
  },
  light: {
    "--sidebar-background": "0 0% 100%",
    "--sidebar-foreground": "245 30% 18%",
    "--sidebar-accent": "220 18% 93%",
    "--sidebar-accent-foreground": "245 30% 18%",
    "--sidebar-border": "220 15% 88%",
    "--sidebar-muted": "240 8% 48%",
  },
  colored: {
    "--sidebar-background": "245 35% 12%",
    "--sidebar-foreground": "220 15% 92%",
    "--sidebar-accent": "254 35% 24%",
    "--sidebar-accent-foreground": "220 15% 92%",
    "--sidebar-border": "245 22% 20%",
    "--sidebar-muted": "240 8% 60%",
  },
};

function applyTheme(theme: string) {
  const root = document.documentElement;
  const isDark = theme === "dark" || (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.classList.toggle("dark", isDark);

  if (isDark) {
    root.style.setProperty("--background", "245 30% 11%");
    root.style.setProperty("--foreground", "220 15% 95%");
    root.style.setProperty("--card", "245 25% 14%");
    root.style.setProperty("--card-foreground", "220 15% 95%");
    root.style.setProperty("--popover", "245 25% 14%");
    root.style.setProperty("--popover-foreground", "220 15% 95%");
    root.style.setProperty("--secondary", "245 20% 18%");
    root.style.setProperty("--secondary-foreground", "220 15% 95%");
    root.style.setProperty("--muted", "245 20% 18%");
    root.style.setProperty("--muted-foreground", "240 8% 55%");
    root.style.setProperty("--destructive", "8 70% 45%");
    root.style.setProperty("--destructive-foreground", "220 15% 97%");
    root.style.setProperty("--info", "225 75% 52%");
    root.style.setProperty("--info-foreground", "0 0% 100%");
    root.style.setProperty("--border", "245 18% 22%");
    root.style.setProperty("--input", "245 18% 22%");
  } else {
    root.style.setProperty("--background", "220 25% 97%");
    root.style.setProperty("--foreground", "245 30% 18%");
    root.style.setProperty("--card", "0 0% 100%");
    root.style.setProperty("--card-foreground", "245 30% 18%");
    root.style.setProperty("--popover", "0 0% 100%");
    root.style.setProperty("--popover-foreground", "245 30% 18%");
    root.style.setProperty("--secondary", "220 15% 91%");
    root.style.setProperty("--secondary-foreground", "245 30% 18%");
    root.style.setProperty("--muted", "220 18% 93%");
    root.style.setProperty("--muted-foreground", "240 8% 48%");
    root.style.setProperty("--destructive", "8 78% 50%");
    root.style.setProperty("--destructive-foreground", "0 0% 100%");
    root.style.setProperty("--info", "225 75% 52%");
    root.style.setProperty("--info-foreground", "0 0% 100%");
    root.style.setProperty("--border", "220 15% 88%");
    root.style.setProperty("--input", "220 15% 88%");
  }
}

function applyFontSize(size: string) {
  const root = document.documentElement;
  if (size === "small") root.style.fontSize = "14px";
  else if (size === "large") root.style.fontSize = "18px";
  else if (size === "xlarge") root.style.fontSize = "20px";
  else root.style.fontSize = "16px";
}

function applyCompactMode(compact: boolean) {
  document.documentElement.classList.toggle("compact-mode", compact);
}

function applyAnimations(enabled: boolean) {
  document.documentElement.classList.toggle("no-animations", !enabled);
}

function applyAccentColor(color: string) {
  const palette = accentPalettes[color] || accentPalettes.amber;
  const root = document.documentElement;
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-foreground", palette.foreground);
  root.style.setProperty("--success", palette.success);
  root.style.setProperty("--success-foreground", palette.foreground);
  root.style.setProperty("--warning", palette.warning);
  root.style.setProperty("--warning-foreground", palette.foreground);
  root.style.setProperty("--chart-1", palette.primary);
  root.style.setProperty("--chart-2", palette.accent);
  root.style.setProperty("--chart-3", palette.warning);
  root.style.setProperty("--chart-4", palette.success);
  root.style.setProperty("--sidebar-primary", palette.primary);
  root.style.setProperty("--sidebar-primary-foreground", palette.foreground);
  root.style.setProperty("--sidebar-ring", palette.primary);
  root.style.setProperty("--primary", palette.primary);
  root.style.setProperty("--primary-foreground", palette.foreground);
  root.style.setProperty("--ring", palette.primary);
}

function applySidebarColor(style: string) {
  const palette = sidebarPalettes[style] || sidebarPalettes.dark;
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(palette)) {
    root.style.setProperty(prop, value);
  }
}

function applyBorderRadius(size: string) {
  const root = document.documentElement;
  const values: Record<string, string> = {
    none: "0px",
    small: "0.375rem",
    medium: "0.75rem",
    large: "1rem",
    xlarge: "1.5rem",
    full: "9999px",
  };
  root.style.setProperty("--radius", values[size] || values.medium);
}

function applyCardStyle(style: string) {
  const root = document.documentElement;
  root.classList.remove("card-flat", "card-bordered", "card-elevated", "card-glass");
  if (style && style !== "default") {
    root.classList.add(`card-${style}`);
  }
}

function applyTableDensity(density: string) {
  const root = document.documentElement;
  root.classList.remove("table-compact", "table-comfortable", "table-spacious");
  if (density && density !== "normal") {
    root.classList.add(`table-${density}`);
  }
}

function applyGlassEffect(enabled: boolean) {
  document.documentElement.classList.toggle("glass-enabled", enabled);
}

function applySidebarWidth(width: string) {
  const root = document.documentElement;
  const values: Record<string, string> = {
    narrow: "14rem",
    normal: "16rem",
    wide: "18rem",
  };
  root.style.setProperty("--sidebar-width", values[width] || values.normal);
}

export function applyAllSettings() {
  const s = getAppSettings();
  applyTheme(s.theme || "system");
  applyFontSize(s.fontSize || "normal");
  applyCompactMode(s.compactMode ?? false);
  applyAnimations(s.animationsEnabled ?? true);
  applyAccentColor(s.accentColor || "amber");
  applySidebarColor(s.sidebarColor || "dark");
  applyBorderRadius(s.borderRadius || "medium");
  applyCardStyle(s.cardStyle || "default");
  applyTableDensity(s.tableDensity || "normal");
  applyGlassEffect(s.glassEffect ?? false);
  applySidebarWidth(s.sidebarWidth || "normal");
}

/** Format a number using the user's settings */
export function formatCurrency(amount: number): string {
  const s = getAppSettings();
  const places = s.decimalPlaces ?? 2;
  let formatted: string;
  
  if (s.roundingMethod === "floor") {
    amount = Math.floor(amount * Math.pow(10, places)) / Math.pow(10, places);
  } else if (s.roundingMethod === "ceil") {
    amount = Math.ceil(amount * Math.pow(10, places)) / Math.pow(10, places);
  }
  
  try {
    formatted = new Intl.NumberFormat(s.numberFormat || "en-PK", {
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    }).format(amount);
  } catch {
    formatted = amount.toFixed(places);
  }
  
  return `${s.currencySymbol || "Rs"} ${formatted}`;
}

/** Format a date using user's timezone and format */
export function formatDate(date: string | Date): string {
  const s = getAppSettings();
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return d.toLocaleDateString(s.language === "ur" ? "ur-PK" : "en-PK", {
      timeZone: s.timezone || "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatDateTime(date: string | Date): string {
  const s = getAppSettings();
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return d.toLocaleString(s.language === "ur" ? "ur-PK" : "en-PK", {
      timeZone: s.timezone || "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return d.toLocaleString();
  }
}

export function useAppSettings() {
  useEffect(() => {
    applyAllSettings();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const s = getAppSettings();
      if (!s.theme || s.theme === "system") {
        applyTheme("system");
        applyAccentColor(s.accentColor || "amber");
      }
    };
    mq.addEventListener("change", handler);

    const storageHandler = (e: StorageEvent) => {
      if (e.key === "app_settings") applyAllSettings();
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);
}

/** Hook: auto-logout after inactivity based on sessionTimeout setting */
export function useSessionTimeout(onTimeout: () => void) {
  useEffect(() => {
    const s = getAppSettings();
    const minutes = s.sessionTimeout || 30;
    const ms = minutes * 60 * 1000;
    
    let timer: ReturnType<typeof setTimeout>;
    
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        onTimeout();
      }, ms);
    };
    
    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [onTimeout]);
}
