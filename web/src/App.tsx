import { useEffect, useMemo, useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Abastecimentos from "./pages/Abastecimentos";
import AdminHome from "./pages/AdminHome";
import Calendario from "./pages/Calendario";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import Manutencoes from "./pages/Manutencoes";
import MotoristaHome from "./pages/MotoristaHome";
import Motoristas from "./pages/Motoristas";
import Ocorrencias from "./pages/Ocorrencias";
import Relatorios from "./pages/Relatorios";
import Usuarios from "./pages/Usuarios";
import Veiculos from "./pages/Veiculos";
import Viagens from "./pages/Viagens";
import { appRoutes, canAccessRoute, getRouteByPath } from "./routes/routes";

const loginPath = "/login";

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="rounded-lg border border-border bg-surface px-5 py-4 text-sm font-medium text-text-muted shadow-sm">
        Carregando IFROTA...
      </div>
    </main>
  );
}

function AppContent() {
  const { session, usuario, loading, logout } = useAuth();
  const [path, setPath] = useState(window.location.pathname || "/");

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname || "/");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const allowedRoutes = useMemo(() => {
    if (!usuario) return [];
    return appRoutes.filter((route) => canAccessRoute(route, usuario.tipo));
  }, [usuario]);

  const requestedRoute = getRouteByPath(path);
  const currentRoute =
    usuario && canAccessRoute(requestedRoute, usuario.tipo)
      ? requestedRoute
      : allowedRoutes[0] || requestedRoute;

  useEffect(() => {
    if (!usuario) return;

    if (path === loginPath) {
      const dashboardPath = allowedRoutes[0]?.path || "/";
      window.history.replaceState({}, "", dashboardPath);
      setPath(dashboardPath);
      return;
    }

    if (currentRoute.path === path) return;

    window.history.replaceState({}, "", currentRoute.path);
    setPath(currentRoute.path);
  }, [allowedRoutes, currentRoute.path, path, usuario]);

  useEffect(() => {
    if (loading || session) return;
    if (path === loginPath) return;

    window.history.replaceState({}, "", loginPath);
    setPath(loginPath);
  }, [loading, path, session]);

  function navigate(nextPath: string) {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  if (loading) return <LoadingScreen />;

  if (!session || !usuario) return <Login />;

  function renderPage() {
    switch (currentRoute.path) {
      case "/":
        return <AdminHome onNavigate={navigate} />;
      case "/motorista":
        return <MotoristaHome onNavigate={navigate} />;
      case "/usuarios":
        return <Usuarios />;
      case "/veiculos":
        return <Veiculos />;
      case "/motoristas":
        return <Motoristas />;
      case "/viagens":
        return <Viagens />;
      case "/calendario":
        return <Calendario />;
      case "/manutencoes":
        return <Manutencoes />;
      case "/abastecimentos":
        return <Abastecimentos />;
      case "/ocorrencias":
        return <Ocorrencias />;
      case "/relatorios":
        return <Relatorios />;
      case "/configuracoes":
        return <Configuracoes />;
      default:
        return <AdminHome onNavigate={navigate} />;
    }
  }

  return (
    <AppLayout
      currentRoute={currentRoute}
      routes={allowedRoutes}
      userName={usuario.nome}
      userRole={usuario.tipo}
      onNavigate={navigate}
      onLogout={logout}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
