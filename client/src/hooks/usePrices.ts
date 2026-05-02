import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "../lib/api";

export type StockSnap = {
  symbol: string;
  name: string;
  price: number;
  prevClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  updatedAt: number;
  changePct?: number;
};

type StocksResponse = { ok: true; stocks: StockSnap[] };

export function usePrices({ token }: { token?: string | null } = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stocks, setStocks] = useState<StockSnap[]>([]);
  const last = useRef<Map<string, number>>(new Map());
  const [direction, setDirection] = useState<Record<string, -1 | 0 | 1>>({});

  const applyUpdate = useCallback((next: StockSnap[]) => {
    setStocks(next);
    setDirection((prev) => {
      const d: Record<string, -1 | 0 | 1> = { ...prev };
      for (const s of next) {
        const prevPrice = last.current.get(s.symbol);
        const dir: -1 | 0 | 1 = prevPrice == null ? 0 : s.price > prevPrice ? 1 : s.price < prevPrice ? -1 : 0;
        d[s.symbol] = dir;
        last.current.set(s.symbol, s.price);
        if (dir !== 0) {
          window.setTimeout(() => {
            setDirection((p2) => ({ ...p2, [s.symbol]: 0 }));
          }, 650);
        }
      }
      return d;
    });
  }, []);

  const refresh = useCallback(async () => {
    const res = await apiFetch<StocksResponse>("/api/stocks");
    applyUpdate(res.stocks);
  }, [applyUpdate]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    refresh()
      .catch((e: any) => mounted && setError(e?.message || "Failed to load stocks"))
      .finally(() => mounted && setLoading(false));

    const poll = window.setInterval(() => refresh().catch(() => {}), 12_000);

    let socket: Socket | null = null;
    try {
      socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
        transports: ["websocket"],
        auth: token ? { token } : undefined,
      });
      socket.on("prices:update", (payload: { prices: StockSnap[] }) => {
        if (!payload?.prices) return;
        applyUpdate(payload.prices);
      });
    } catch {
      // ignore; polling covers it
    }

    return () => {
      mounted = false;
      window.clearInterval(poll);
      socket?.disconnect();
    };
  }, [applyUpdate, refresh, token]);

  const bySymbol = useMemo(() => new Map(stocks.map((s) => [s.symbol, s])), [stocks]);
  return { loading, error, stocks, bySymbol, direction, refresh };
}

