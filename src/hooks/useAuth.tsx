import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/customClient";
import { retryQuery } from "@/lib/retryFetch";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  role: "admin" | "user" | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  enterGuest: () => void;
  exitGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_KEY = "qe-guest-mode";
const GUEST_USER = {
  id: "guest-demo-user",
  email: "guest@demo.local",
  app_metadata: {},
  user_metadata: { is_guest: true, full_name: "Guest Viewer" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
  Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(GUEST_KEY) === "1";
  });

  const fetchRole = async (userId: string): Promise<"admin" | "user"> => {
    try {
      const result = await retryQuery(
        () => supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
        3, 1000
      );
      if (result && typeof result === "object" && "data" in result && result.data) {
        return ((result.data as any)?.role as "admin" | "user") || "user";
      }
      return "user";
    } catch (e) {
      console.warn("auth:role fetch failed, defaulting to user", e);
      return "user";
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      if (currentUser) {
        // Real auth supersedes guest mode
        try { localStorage.removeItem(GUEST_KEY); } catch {}
        setIsGuest(false);
        setUser(currentUser);
        fetchRole(currentUser.id).then((r) => {
          if (mounted) setRole(r);
        });
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    const initSession = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          7000,
          { data: { session: null } } as any
        );
        if (!mounted) return;
        const currentUser = session?.user ?? null;
        if (currentUser) {
          try { localStorage.removeItem(GUEST_KEY); } catch {}
          setIsGuest(false);
          setUser(currentUser);
          const r = await fetchRole(currentUser.id);
          if (mounted) setRole(r);
        }
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    };
    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string) => {
    // The DB trigger handle_new_user assigns admin to the very first user, and 'user' to everyone else.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    try { localStorage.removeItem(GUEST_KEY); } catch {}
    setIsGuest(false);
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const enterGuest = () => {
    try { localStorage.setItem(GUEST_KEY, "1"); } catch {}
    setIsGuest(true);
  };

  const exitGuest = () => {
    try { localStorage.removeItem(GUEST_KEY); } catch {}
    setIsGuest(false);
  };

  // Expose synthetic guest user when in guest mode and no real user
  const effectiveUser = user ?? (isGuest ? GUEST_USER : null);
  const effectiveRole: "admin" | "user" | null = user ? role : (isGuest ? "user" : null);

  return (
    <AuthContext.Provider value={{ user: effectiveUser, role: effectiveRole, loading, isGuest: isGuest && !user, signIn, signUp, signOut, enterGuest, exitGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
