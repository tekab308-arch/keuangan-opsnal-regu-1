import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Role = "admin" | "user";

interface AuthState {
  role: Role;
  isLoading: boolean;
  isAdmin: boolean;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("user");
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { role: Role };
        setRole(data.role);
      }
    } catch {
      setRole("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json() as { role?: Role; error?: string };
      if (res.ok && data.role) {
        setRole(data.role);
        return { ok: true };
      }
      return { ok: false, error: data.error ?? "Login gagal" };
    } catch {
      return { ok: false, error: "Gagal terhubung ke server" };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setRole("user");
  }, []);

  return (
    <AuthContext.Provider value={{ role, isLoading, isAdmin: role === "admin", login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
