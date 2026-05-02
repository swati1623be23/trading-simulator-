import { useCallback, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../state/auth";
import { useToast } from "../components/Toast";
import { usePrices } from "../hooks/usePrices";

type FavResponse = { ok: true; favorites: string[] };

export function Dashboard() {
  const { token } = useAuth();
  const toast = useToast();
  const { loading, error, stocks, direction } = usePrices({ token });
  const [q, setQ] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const raw = localStorage.getItem("favorites");
    return raw ? (JSON.parse(raw) as string[]) : [];
  });

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return stocks.slice(0, 12);
    return stocks.filter(
      (s) => s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
    );
  }, [q, stocks]);

  const syncFavorites = useCallback(async () => {
    if (!token) return;
    const res = await apiFetch<FavResponse>("/api/favorites", { token });
    setFavorites(res.favorites);
    localStorage.setItem("favorites", JSON.stringify(res.favorites));
  }, [token]);

  const toggleFav = useCallback(
    async (symbol: string) => {
      const next = favorites.includes(symbol)
        ? favorites.filter((s) => s !== symbol)
        : [...favorites, symbol];
      setFavorites(next);
      localStorage.setItem("favorites", JSON.stringify(next));

      if (!token) {
        toast.push("Login to sync favorites across devices.", "info");
        return;
      }
      try {
        if (next.includes(symbol)) {
          await apiFetch("/api/favorites", { method: "POST", token, body: JSON.stringify({ symbol }) });
          toast.push("Added to watchlist", "success");
        } else {
          await apiFetch(`/api/favorites/${symbol}`, { method: "DELETE", token });
          toast.push("Removed from watchlist", "info");
        }
        await syncFavorites();
      } catch (e: any) {
        toast.push(e?.message || "Favorite update failed", "error");
      }
    },
    [favorites, syncFavorites, toast, token]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stock Market Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
           
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or symbol…"
            className="w-full rounded-xl border border-fuchsia-200 bg-white/75 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-300 dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:focus:ring-fuchsia-700 sm:w-72"
          />
          <button
            onClick={() => syncFavorites().catch(() => {})}
            className="rounded-xl border border-fuchsia-200 bg-white/75 px-3 py-2 text-sm font-medium hover:bg-white dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:hover:bg-fuchsia-950/55"
          >
            Sync
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-fuchsia-200 bg-white/75 p-6 text-sm text-zinc-700 dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:text-zinc-200">
          Loading stocks…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-fuchsia-200 bg-white/75 p-6 text-sm text-zinc-700 dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:text-zinc-200">
          No matches. Try another search.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => {
            const dir = direction[s.symbol] || 0;
            const changePct = s.prevClose ? ((s.price - s.prevClose) / s.prevClose) * 100 : 0;
            const changeColor =
              changePct > 0
                ? "text-emerald-700 dark:text-emerald-300"
                : changePct < 0
                  ? "text-rose-700 dark:text-rose-300"
                  : "text-zinc-600 dark:text-zinc-300";
            const flash =
              dir === 1
                ? "ring-2 ring-emerald-200 dark:ring-emerald-900"
                : dir === -1
                  ? "ring-2 ring-rose-200 dark:ring-rose-900"
                  : "";

            const isFav = favorites.includes(s.symbol);

            return (
              <div
                key={s.symbol}
                className={[
                  "rounded-2xl border border-fuchsia-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md dark:border-fuchsia-900 dark:bg-fuchsia-950/35",
                  flash,
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{s.symbol}</span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-300">{s.name}</span>
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      ${s.price.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFav(s.symbol)}
                    className={[
                      "rounded-xl border px-3 py-1.5 text-xs font-medium transition",
                      isFav
                        ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-950"
                        : "border-fuchsia-200 bg-white/80 text-zinc-700 hover:bg-white dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:text-zinc-200 dark:hover:bg-fuchsia-950/55",
                    ].join(" ")}
                  >
                    {isFav ? "★ Favorited" : "☆ Favorite"}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={["text-sm font-medium", changeColor].join(" ")}>
                    {changePct >= 0 ? "+" : ""}
                    {changePct.toFixed(2)}%
                  </span>
                  <NavLink
                    to={`/stocks/${s.symbol}`}
                    className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-3 py-2 text-xs font-medium text-white hover:from-fuchsia-700 hover:to-pink-700"
                  >
                    View
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

