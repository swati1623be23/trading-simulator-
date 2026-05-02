import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: string; message: string; tone?: "success" | "error" | "info" };
type ToastCtx = { push: (message: string, tone?: Toast["tone"]) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-xl border px-3 py-2 text-sm shadow-sm backdrop-blur",
              "bg-white/90 dark:bg-zinc-900/80",
              t.tone === "success"
                ? "border-emerald-300 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200"
                : t.tone === "error"
                  ? "border-rose-300 text-rose-700 dark:border-rose-900 dark:text-rose-200"
                  : "border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200",
            ].join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("ToastProvider missing");
  return v;
}

