import { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { usePrices } from "../hooks/usePrices";
import { useAuth } from "../state/auth";

type StockResp = { ok: true; stock: any };

export function StockDetail() {
  const { symbol = "" } = useParams();
  const sym = symbol.toUpperCase();
  const { token } = useAuth();
  const { bySymbol } = usePrices({ token });
  const live = bySymbol.get(sym);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    apiFetch<StockResp>(`/api/stocks/${sym}`)
      .then((res) => mounted && setStock(res.stock))
      .catch((e: any) => mounted && setError(e?.message || "Failed to load"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [sym]);

  const view = useMemo(() => live || stock, [live, stock]);

  if (loading && !view) {
    return (
      <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-6 text-sm text-zinc-700 dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:text-zinc-200">
        Loading…
      </div>
    );
  }
  if (error && !view) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
        {error}
      </div>
    );
  }

  const changePct = view?.prevClose ? ((view.price - view.prevClose) / view.prevClose) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {view?.symbol} <span className="text-zinc-500">/</span> {view?.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Detail view with live updates.
          </p>
        </div>
        <NavLink
          to="/dashboard"
          className="rounded-xl border border-fuchsia-200 bg-white/80 px-4 py-2 text-sm font-medium hover:bg-white dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:hover:bg-fuchsia-950/55"
        >
          Back
        </NavLink>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-6 shadow-sm dark:border-fuchsia-900 dark:bg-fuchsia-950/35">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Price</p>
          <p className="mt-2 text-4xl font-semibold">${Number(view?.price || 0).toFixed(2)}</p>
          <p
            className={[
              "mt-2 text-sm font-medium",
              changePct > 0
                ? "text-emerald-700 dark:text-emerald-300"
                : changePct < 0
                  ? "text-rose-700 dark:text-rose-300"
                  : "text-zinc-600 dark:text-zinc-300",
            ].join(" ")}
          >
            {changePct >= 0 ? "+" : ""}
            {changePct.toFixed(2)}% today
          </p>
        </div>

        <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-6 shadow-sm dark:border-fuchsia-900 dark:bg-fuchsia-950/35">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Day range</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-zinc-500">Low</p>
              <p className="mt-1 font-semibold">${Number(view?.dayLow || 0).toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-zinc-500">High</p>
              <p className="mt-1 font-semibold">${Number(view?.dayHigh || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-zinc-500">Volume</p>
            <p className="mt-1 font-semibold">{Number(view?.volume || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

