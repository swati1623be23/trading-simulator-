import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

type User = { id: string; email: string };
type AuthCtx = {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const setSession = useCallback((t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{ ok: true; token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(res.token, res.user);
    },
    [setSession]
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{ ok: true; token: string; user: User }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(res.token, res.user);
    },
    [setSession]
  );

  const value = useMemo(() => ({ token, user, login, signup, logout }), [token, user, login, signup, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider missing");
  return v;
}

