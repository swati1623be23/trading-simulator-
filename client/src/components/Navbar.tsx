import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../state/theme";
import { useAuth } from "../state/auth";

const linkBase =
  "rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/15";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { token, user, logout } = useAuth();
  const location = useLocation();

  const onLanding = location.pathname === "/";
  const navItems = onLanding
    ? [
        { label: "About", href: "#about" },
        { label: "Skills", href: "#skills" },
      ]
    : [];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-fuchsia-300/40 bg-gradient-to-r from-indigo-700 via-fuchsia-700 to-pink-600 backdrop-blur dark:border-fuchsia-900/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-fuchsia-700">
            TS
          </span>
          <span className="hidden text-white sm:inline">Trading Simulator</span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {onLanding ? (
            <>
              <a className={linkBase} href="#about">
                About
              </a>
              <a className={linkBase} href="#skills">
                Skills
              </a>
              <NavLink className={linkBase} to="/dashboard">
                Dashboard
              </NavLink>
            </>
          ) : (
            <>
              <NavLink className={linkBase} to="/dashboard">
                Dashboard
              </NavLink>
              <NavLink className={linkBase} to="/portfolio">
                Portfolio
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 p-1">
            <button
              onClick={() => setTheme("light")}
              className={[
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition sm:text-sm",
                theme === "light" ? "bg-white text-fuchsia-700" : "text-white hover:bg-white/15",
              ].join(" ")}
              aria-label="Set light mode"
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={[
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition sm:text-sm",
                theme === "dark" ? "bg-white text-fuchsia-700" : "text-white hover:bg-white/15",
              ].join(" ")}
              aria-label="Set dark mode"
            >
              Dark
            </button>
          </div>

          {token ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-white/90 sm:inline">
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="rounded-lg bg-white px-2.5 py-2 text-xs font-medium text-fuchsia-700 hover:bg-fuchsia-50 sm:px-3 sm:text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/auth"
              className="rounded-lg bg-white px-2.5 py-2 text-xs font-medium text-fuchsia-700 hover:bg-fuchsia-50 sm:px-3 sm:text-sm"
            >
              Login
            </NavLink>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-3 pb-2 md:hidden">
        {navItems.map((item) => (
          <a
            key={item.label}
            className={linkBase + " whitespace-nowrap border border-white/30"}
            href={item.href}
          >
            {item.label}
          </a>
        ))}
        <NavLink className={linkBase + " whitespace-nowrap border border-white/30"} to="/dashboard">
          Dashboard
        </NavLink>
        <NavLink className={linkBase + " whitespace-nowrap border border-white/30"} to="/portfolio">
          Portfolio
        </NavLink>
      </div>
    </header>
  );
}

