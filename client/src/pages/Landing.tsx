import { useMemo, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useInView } from "../hooks/useInView";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.12 });

  return (
    <section id={id} className="scroll-mt-24 py-12">
      <div
        ref={ref}
        className={[
          "rounded-2xl border border-fuchsia-200 bg-white/75 p-6 shadow-sm backdrop-blur dark:border-fuchsia-900 dark:bg-fuchsia-950/35",
          "transition-all duration-500",
          inView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        ].join(" ")}
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-3 text-zinc-700 dark:text-zinc-300">{children}</div>
      </div>
    </section>
  );
}

export function Landing() {
  const skills = useMemo(
    () => [
      "React + TypeScript",
      "Node.js + Express",
      "MongoDB + Mongoose",
      "JWT auth + bcrypt",
      "Socket.io realtime",
      "Tailwind + UI polish",
    ],
    []
  );

  return (
    <div className="space-y-6">
      <section className="py-10">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-white/80 px-3 py-1 text-sm text-fuchsia-800 shadow-sm dark:border-fuchsia-900 dark:bg-fuchsia-950/40 dark:text-fuchsia-100">
            Stop guessing. Start simulating
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Build strategies, backtest moves, and track every trade like a pro.
            </h1>
            <p className="mt-4 max-w-xl text-zinc-700 dark:text-zinc-300">
             
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <NavLink
                to="/dashboard"
                className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:translate-y-[-1px] hover:from-fuchsia-700 hover:to-pink-700 active:translate-y-0"
              >
                Open dashboard
              </NavLink>
              <a
                href="#about"
                className="rounded-xl border border-fuchsia-200 bg-white/75 px-4 py-2.5 text-sm font-medium shadow-sm transition hover:translate-y-[-1px] hover:bg-white active:translate-y-0 dark:border-fuchsia-900 dark:bg-fuchsia-950/35 dark:hover:bg-fuchsia-950/60"
              >
                Learn more
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-white/85 via-pink-50 to-orange-50 p-6 shadow-sm dark:border-fuchsia-900 dark:from-fuchsia-950/45 dark:to-pink-950/35">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Realtime</p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  live
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { s: "AAPL", p: "$189.42", c: "+0.82%" },
                  { s: "MSFT", p: "$412.09", c: "-0.31%" },
                  { s: "NVDA", p: "$926.15", c: "+1.24%" },
                ].map((row) => (
                  <div
                    key={row.s}
                    className="group flex items-center justify-between rounded-xl border border-fuchsia-200 bg-white/80 px-4 py-3 transition hover:-translate-y-[1px] hover:shadow-sm dark:border-fuchsia-900 dark:bg-fuchsia-950/35"
                  >
                    <span className="font-medium">{row.s}</span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{row.p}</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {row.c}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                Demo card. Live prices come from the backend price engine.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Section id="about" title="About">
        <p>
          This app is built to feel like a real product: fast navigation, responsive layouts, smooth
          interactions, and realtime updates. The backend enforces data consistency (no negative
          balance, no overselling) and protects routes with JWT.
        </p>
      </Section>

      <Section id="skills" title="Skills">
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          {skills.map((s) => (
            <div
              key={s}
              className="rounded-xl border border-fuchsia-200 bg-white/80 px-4 py-3 text-sm font-medium shadow-sm transition hover:-translate-y-[1px] hover:shadow-md dark:border-fuchsia-900 dark:bg-fuchsia-950/35"
            >
              {s}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

