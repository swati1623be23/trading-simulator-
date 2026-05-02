import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useToast } from "../components/Toast";

export function AuthPage() {
  const nav = useNavigate();
  const toast = useToast();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Welcome back" : "Create your account"), [mode]);

  const submit = useCallback(async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.push("Email and password are required", "error");
      return;
    }
    if (mode === "signup" && cleanPassword.length < 8) {
      toast.push("Password must be at least 8 characters", "error");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") await login(cleanEmail, cleanPassword);
      else await signup(cleanEmail, cleanPassword);
      toast.push(mode === "login" ? "Logged in" : "Account created", "success");
      nav("/");
    } catch (e: any) {
      const fallback = mode === "signup" ? "Signup failed" : "Login failed";
      toast.push(e?.message || fallback, "error");
    } finally {
      setLoading(false);
    }
  }, [email, login, mode, nav, password, signup, toast]);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-md items-center">
      <div className="w-full rounded-2xl border border-fuchsia-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6 dark:border-fuchsia-900 dark:bg-fuchsia-950/35">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          
        </p>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-fuchsia-200 bg-white/85 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300 dark:border-fuchsia-900 dark:bg-fuchsia-950/45 dark:focus:ring-fuchsia-700"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-xl border border-fuchsia-200 bg-white/85 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300 dark:border-fuchsia-900 dark:bg-fuchsia-950/45 dark:focus:ring-fuchsia-700"
              placeholder="min 8 characters"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>
        </div>

        <button
          onClick={() => void submit()}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-fuchsia-700 hover:to-pink-700 disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "login" ? "Login" : "Sign up"}
        </button>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
            className="text-zinc-700 hover:underline dark:text-zinc-200"
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

