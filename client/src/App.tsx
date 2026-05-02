import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./state/theme";
import { AuthProvider, useAuth } from "./state/auth";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { StockDetail } from "./pages/StockDetail";
import { AuthPage } from "./pages/AuthPage";
import { Portfolio } from "./pages/Portfolio";

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function FallbackRoute() {
  const { token } = useAuth();
  return <Navigate to={token ? "/" : "/auth"} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-dvh bg-gradient-to-br from-pink-100 via-fuchsia-100 to-orange-100 text-zinc-900 dark:from-[#1a102b] dark:via-[#24113a] dark:to-[#2d1333] dark:text-zinc-50">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Protected>
                      <Landing />
                    </Protected>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Protected>
                      <Dashboard />
                    </Protected>
                  }
                />
                <Route
                  path="/stocks/:symbol"
                  element={
                    <Protected>
                      <StockDetail />
                    </Protected>
                  }
                />
                <Route
                  path="/auth"
                  element={
                    <PublicOnly>
                      <AuthPage />
                    </PublicOnly>
                  }
                />
                <Route
                  path="/portfolio"
                  element={
                    <Protected>
                      <Portfolio />
                    </Protected>
                  }
                />
                <Route path="*" element={<FallbackRoute />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

