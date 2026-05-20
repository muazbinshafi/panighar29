import { useEffect, useRef } from "react";
import { runLocalBackup } from "@/pages/BackupPage";
import { toast } from "sonner";

const LAST_AUTO_KEY = "qe-last-auto-backup";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Triggers a once-per-day automatic backup download.
 * Mount once near the app root. Checks on mount and again every hour
 * so a long-running tab eventually triggers too.
 */
export function useDailyAutoBackup(enabled: boolean) {
  const running = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const tryBackup = async () => {
      if (running.current) return;
      const last = Number(localStorage.getItem(LAST_AUTO_KEY) || 0);
      if (Date.now() - last < ONE_DAY_MS) return;
      running.current = true;
      try {
        const { payload, fileName } = await runLocalBackup();
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        localStorage.setItem(LAST_AUTO_KEY, String(Date.now()));
        toast.success("Daily backup downloaded");
      } catch (e) {
        console.warn("Daily auto-backup failed:", e);
      } finally { running.current = false; }
    };

    // Delay 5s on mount so the page settles first
    const t1 = setTimeout(tryBackup, 5000);
    const t2 = setInterval(tryBackup, 60 * 60 * 1000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, [enabled]);
}
