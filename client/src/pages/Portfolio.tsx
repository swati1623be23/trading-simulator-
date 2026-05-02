import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "../lib/api";
import { useAuth } from "../state/auth";
import { useToast } from "../components/Toast";
import { usePrices } from "../hooks/usePrices";

type PortfolioResp = {
  ok: true;
  wallet: { cash: number };
  holdings: Array<{
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    value: number;
    pl: number;
  }>;
  summary: { invested: number; value: number; pl: number };
};

export function Portfolio() {
  const { token } = useAuth();
  const toast = useToast();
  const { bySymbol } = usePrices({ token });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortfolioResp | null>(null);

  const [symbol, setSymbol] = useState("AAPL");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    const res = await apiFetch<PortfolioResp>("/api/trade/portfolio", { token });
    setData(res);
  }, [token]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    refresh()
      .catch((e: any) => mounted && setError(e?.message || "Failed to load portfolio"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!token) return;
    let socket: Socket | null = null;
    try {
      socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
        transports: ["websocket"],
        auth: { token },
      });
      socket.on("portfolio:update", () => refresh().catch(() => {}));
    } catch {
      // ignore
    }
    const poll = window.setInterval(() => refresh().catch(() => {}), 15_000);
    return () => {
      socket?.disconnect();
      window.clearInterval(poll);
    };
  }, [refresh, token]);

  const place = useCallback(
    async (side: "BUY" | "SELL") => {
      if (!token) return;
      setBusy(true);
      try {
        await apiFetch("/api/trade/order", {
          method: "POST",
          token,
          body: JSON.stringify({
            requestId: uuidv4(),
            symbol,
            side,
            quantity: qty,
          }),
        });
        toast.push(`${side === "BUY" ? "Bought" : "Sold"} ${qty} ${symbol}`, "success");
        await refresh();
      } catch (e: any) {
        toast.push(e?.message || "Order failed", "error");
      } finally {
        setBusy(false);
      }
    },
    [qty, refresh, symbol, toast, token]
  );

  const cash = data?.wallet.cash ?? 0;
  const snap = bySymbol.get(symbol);
  const est = useMemo(() => (snap ? snap.price * qty : 0), [qty, snap]);

  if (loading && !data) {
    return (
      <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-6 text-sm text-zinc-700 dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:text-zinc-200">
        Loading portfolio…
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Virtual cash balance starts at $10,000. Orders lock the current price.
          </p>
        </div>
        <button
          onClick={() => refresh().catch(() => {})}
          className="rounded-xl border border-fuchsia-200 bg-white/80 px-3 py-2 text-sm font-medium hover:bg-white dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:hover:bg-fuchsia-950/55"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-5 shadow-sm dark:border-fuchsia-900 dark:bg-fuchsia-950/35">
          <p className="text-sm text-zinc-500">Cash</p>
          <p className="mt-1 text-2xl font-semibold">${cash.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-5 shadow-sm dark:border-fuchsia-900 dark:bg-fuchsia-950/35">
          <p className="text-sm text-zinc-500">Invested</p>
          <p className="mt-1 text-2xl font-semibold">${Number(data?.summary.invested || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-5 shadow-sm dark:border-fuchsia-900 dark:bg-fuchsia-950/35">
          <p className="text-sm text-zinc-500">P/L</p>
          <p
            className={[
              "mt-1 text-2xl font-semibold",
              (data?.summary.pl || 0) > 0
                ? "text-emerald-700 dark:text-emerald-300"
                : (data?.summary.pl || 0) < 0
                  ? "text-rose-700 dark:text-rose-300"
                  : "",
            ].join(" ")}
          >
            ${Number(data?.summary.pl || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-6 shadow-sm dark:border-fuchsia-900 dark:bg-fuchsia-950/35 lg:col-span-1">
          <h2 className="text-lg font-semibold">Trade</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium">Symbol</span>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-xl border border-fuchsia-200 bg-white/85 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300 dark:border-fuchsia-900 dark:bg-fuchsia-950/45 dark:focus:ring-fuchsia-700"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Quantity</span>
              <input
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value || 1))))}
                type="number"
                min={1}
                className="mt-1 w-full rounded-xl border border-fuchsia-200 bg-white/85 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300 dark:border-fuchsia-900 dark:bg-fuchsia-950/45 dark:focus:ring-fuchsia-700"
              />
            </label>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-zinc-500">Estimated total</p>
              <p className="mt-1 font-semibold">${est.toFixed(2)}</p>
              <p className="mt-1 text-xs text-zinc-500">
                Price updates every ~10–15s. Orders lock the price at submit time.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                disabled={busy}
                onClick={() => void place("BUY")}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy ? "…" : "Buy"}
              </button>
              <button
                disabled={busy}
                onClick={() => void place("SELL")}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {busy ? "…" : "Sell"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-6 shadow-sm dark:border-fuchsia-900 dark:bg-fuchsia-950/35 lg:col-span-2">
          <h2 className="text-lg font-semibold">Holdings</h2>
          {data?.holdings?.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="py-2 pr-3">Symbol</th>
                    <th className="py-2 pr-3">Qty</th>
                    <th className="py-2 pr-3">Avg</th>
                    <th className="py-2 pr-3">Last</th>
                    <th className="py-2 pr-3">Value</th>
                    <th className="py-2 pr-3">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {data.holdings.map((h) => (
                    <tr key={h.symbol} className="border-t border-zinc-100 dark:border-zinc-900">
                      <td className="py-2 pr-3 font-medium">{h.symbol}</td>
                      <td className="py-2 pr-3">{h.quantity}</td>
                      <td className="py-2 pr-3">${h.avgPrice.toFixed(2)}</td>
                      <td className="py-2 pr-3">${h.currentPrice.toFixed(2)}</td>
                      <td className="py-2 pr-3">${h.value.toFixed(2)}</td>
                      <td
                        className={[
                          "py-2 pr-3 font-medium",
                          h.pl > 0
                            ? "text-emerald-700 dark:text-emerald-300"
                            : h.pl < 0
                              ? "text-rose-700 dark:text-rose-300"
                              : "",
                        ].join(" ")}
                      >
                        ${h.pl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              No holdings yet. Place a buy order to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

