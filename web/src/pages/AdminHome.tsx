type DashboardRoute =
  | "veiculos"
  | "viagens"
  | "manutencoes"
  | "gastos"
  | "agenda";

interface AdminHomeProps {
  adminName?: string;
  onMenuClick?: () => void;
  onNavigate?: (route: DashboardRoute) => void;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: "pin" | "wrench" | "dollar";
  variant?: "default" | "danger";
  alert?: boolean;
  onClick?: () => void;
}

function MenuIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s7-6.2 7-12A7 7 0 1 0 5 9c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function WrenchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M14.7 6.3a4.5 4.5 0 0 0-5.4 5.4l-5.8 5.8a2.1 2.1 0 0 0 3 3l5.8-5.8a4.5 4.5 0 0 0 5.4-5.4l-3.1 3.1-3-3 3.1-3.1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DollarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3v18M17 7.5c-.8-1.2-2.5-2-4.5-2-2.5 0-4.5 1.2-4.5 3s2 2.6 4.5 3 4.5 1 4.5 3-2 3-4.5 3c-2.2 0-4-.9-4.8-2.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AlertTriangleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4 21 20H3L12 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v5M12 17h.01"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatCard({
  title,
  value,
  icon,
  variant = "default",
  alert = false,
  onClick,
}: StatCardProps) {
  const isDanger = variant === "danger";

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative min-h-[145px] rounded-2xl bg-surface p-6 text-left shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]"
    >
      {alert && (
        <span className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-danger text-lg font-medium text-white shadow-md">
          !
        </span>
      )}

      {icon === "pin" && (
        <PinIcon
          className={`mb-4 h-9 w-9 ${isDanger ? "text-danger" : "text-primary-700"}`}
        />
      )}

      {icon === "wrench" && (
        <WrenchIcon
          className={`mb-4 h-9 w-9 ${isDanger ? "text-danger" : "text-primary-700"}`}
        />
      )}

      {icon === "dollar" && (
        <DollarIcon
          className={`mb-4 h-9 w-9 ${isDanger ? "text-danger" : "text-primary-700"}`}
        />
      )}

      <strong
        className={`block text-3xl font-normal ${
          isDanger ? "text-danger" : "text-primary-700"
        }`}
      >
        {value}
      </strong>

      <span className="mt-3 block text-lg text-text-muted">{title}</span>
    </button>
  );
}

export default function AdminHome({
  adminName = "Admin",
  onMenuClick,
  onNavigate,
}: AdminHomeProps) {
  return (
    <main className="min-h-screen bg-background text-text-main">
      <header className="rounded-b-[32px] bg-primary-800 px-7 pb-14 pt-14 text-white shadow-lg shadow-black/25 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl items-start justify-between">
          <div className="mt-16 sm:mt-20">
            <h1 className="text-3xl font-normal sm:text-4xl">
              Olá, {adminName}
            </h1>

            <p className="mt-2 text-xl text-white/80 sm:text-2xl">
              Bem-vindo ao dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-white transition hover:bg-white/10"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <StatCard
            title="Total de Veículos"
            value="24"
            icon="pin"
            onClick={() => onNavigate?.("veiculos")}
          />

          <StatCard
            title="Viagens Ativas"
            value="8"
            icon="pin"
            onClick={() => onNavigate?.("viagens")}
          />

          <StatCard
            title="Manutenções"
            value="3"
            icon="wrench"
            variant="danger"
            alert
            onClick={() => onNavigate?.("manutencoes")}
          />

          <StatCard
            title="Gastos do Mês"
            value="R$ 12.450"
            icon="dollar"
            onClick={() => onNavigate?.("gastos")}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigate?.("agenda")}
            className="rounded-2xl bg-surface p-8 text-left shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:shadow-xl lg:col-span-2"
          >
            <h2 className="text-2xl font-normal text-primary-700 sm:text-3xl">
              Agenda de Viagens
            </h2>

            <div className="mt-28 flex justify-center sm:mt-24 lg:mt-28">
              <div className="h-[250px] w-full max-w-[430px] rounded-xl bg-gray-300 sm:h-[310px]" />
            </div>
          </button>

          <div className="space-y-6">
            <article className="flex items-center gap-6 rounded-2xl border-l-[6px] border-danger bg-surface px-7 py-7 shadow-lg shadow-black/15">
              <AlertTriangleIcon className="h-11 w-11 shrink-0 text-danger" />

              <div>
                <h3 className="text-2xl font-normal text-gray-600">
                  Manutenção Pendente
                </h3>

                <p className="text-xl text-text-muted">
                  Ônibus 001 - Troca de óleo
                </p>
              </div>
            </article>

            <article className="flex items-center gap-6 rounded-2xl border-l-[6px] border-primary-700 bg-surface px-7 py-7 shadow-lg shadow-black/15">
              <PinIcon className="h-12 w-12 shrink-0 text-primary-700" />

              <div>
                <h3 className="text-2xl font-medium text-text-main">
                  8 Viagens em andamento
                </h3>

                <p className="text-xl text-text-muted">Ver detalhes</p>
              </div>
            </article>

            <article className="rounded-2xl bg-surface px-8 py-8 shadow-lg shadow-black/15">
              <h2 className="text-2xl font-normal text-primary-700">
                Atividades Recentes
              </h2>

              <ul className="mt-6 space-y-4 text-xl text-text-muted">
                <li>• Nova solicitação de viagem</li>
                <li>• Manutenção concluída - Van 003</li>
                <li>• Abastecimento registrado</li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}