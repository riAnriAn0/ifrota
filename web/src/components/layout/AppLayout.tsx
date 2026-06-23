import { useState, type ReactNode } from "react";
import Header from "../Header";
import logoSgf from "../../assets/icon_sfg.svg";
import type { AppRoute, PerfilUsuario } from "../../types/app";

type AppLayoutProps = {
  children: ReactNode;
  currentRoute: AppRoute;
  routes: AppRoute[];
  userName?: string;
  userRole: PerfilUsuario;
  onNavigate: (path: string) => void;
  onLogout: () => void;
};

const groupLabels: Record<AppRoute["group"], string> = {
  principal: "Principal",
  cadastros: "Cadastros",
  operacao: "Operacao",
  gestao: "Gestao",
};

function RouteButton({
  route,
  active,
  onNavigate,
}: {
  route: AppRoute;
  active: boolean;
  onNavigate: (path: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(route.path)}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
        active
          ? "bg-primary-700 text-white shadow-sm"
          : "text-text-muted hover:bg-primary-100 hover:text-primary-900"
      }`}
    >
      <span>{route.label}</span>
      {active && <span className="h-2 w-2 rounded-full bg-white" />}
    </button>
  );
}

export default function AppLayout({
  children,
  currentRoute,
  routes,
  userName,
  userRole,
  onNavigate,
  onLogout,
}: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const groupedRoutes = routes.reduce<Record<AppRoute["group"], AppRoute[]>>(
    (groups, route) => {
      groups[route.group].push(route);
      return groups;
    },
    { principal: [], cadastros: [], operacao: [], gestao: [] }
  );

  function navigateAndClose(path: string) {
    onNavigate(path);
    setMenuOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="border-b border-border px-5 py-5">
        <img src={logoSgf} alt="IFROTA" className="h-auto w-40" />
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-text-muted">
          Perfil: {userRole}
        </p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        {Object.entries(groupedRoutes).map(([group, groupRoutes]) => {
          if (groupRoutes.length === 0) return null;

          return (
            <div key={group}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {groupLabels[group as AppRoute["group"]]}
              </p>
              <div className="space-y-1">
                {groupRoutes.map((route) => (
                  <RouteButton
                    key={route.path}
                    route={route}
                    active={route.path === currentRoute.path}
                    onNavigate={navigateAndClose}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary-800 transition hover:bg-primary-100"
        >
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-text-main">
      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface shadow-xl transition-transform lg:translate-x-0 lg:shadow-none ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      <div className="min-h-screen lg:pl-72">
        <Header
          title={currentRoute.title}
          subtitle={currentRoute.subtitle}
          userName={userName}
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {routes.slice(0, 4).map((route) => (
            <button
              key={route.path}
              type="button"
              onClick={() => onNavigate(route.path)}
              className={`rounded-lg px-2 py-2 text-xs font-medium ${
                route.path === currentRoute.path
                  ? "bg-primary-700 text-white"
                  : "text-text-muted"
              }`}
            >
              {route.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
