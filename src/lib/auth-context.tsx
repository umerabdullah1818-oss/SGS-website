"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthUser {
  uid: string;
  email: string;
  role: string;
  displayName?: string;
  assignedGame?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => { throw new Error("Not implemented"); },
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if we have a valid session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      return data.user as AuthUser;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/me", { method: "POST" });
    } catch {
      // ignore errors during logout
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
