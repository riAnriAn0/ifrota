import { useEffect, useMemo, useState } from "react";
import MetricCard from "../components/ui/MetricCard";
import { listarOcorrencias } from "../services/ocorrenciasService";
import type { Ocorrencia } from "../types/app";

type AdminHomeProps = {
  onNavigate: (path: string) => void;
};

const baseMetrics = [
  {
    label: "Total de veiculos",
    value: "0",
    detail: "Frota cadastrada no sistema",
    path: "/veiculos",
    icon: "V",
    tone: "info" as const,
  },
  {
    label: "Veiculos disponiveis",
    value: "0",
    detail: "Prontos para novos agendamentos",
    path: "/veiculos",
    icon: "D",
    tone: "success" as const,
  },
  {
    label: "Veiculos em uso",
    value: "0",
    detail: "Viagens em andamento agora",
    path: "/viagens",
    icon: "U",
    tone: "default" as const,
  },
  {
    label: "Veiculos em manutencao",
    value: "0",
    detail: "Indisponiveis para reserva",
    path: "/manutencoes",
    icon: "M",
    tone: "warning" as const,
  },
  {
    label: "Total de motoristas",
    value: "0",
    detail: "Condutores ativos e cadastrados",
    path: "/motoristas",
    icon: "C",
    tone: "info" as const,
  },
  {
    label: "Viagens agendadas",
    value: "0",
    detail: "Reservas futuras no calendario",
    path: "/viagens",
    icon: "A",
    tone: "success" as const,
  },
  {
    label: "Viagens em andamento",
    value: "0",
    detail: "Deslocamentos iniciados",
    path: "/viagens",
    icon: "I",
    tone: "default" as const,
  },
  {
    label: "Manutencoes pendentes",
    value: "0",
    detail: "Corretivas e preventivas abertas",
    path: "/manutencoes",
    icon: "P",
    tone: "warning" as const,
  },
  {
    label: "Abastecimentos recentes",
    value: "0",
    detail: "Registros dos ultimos dias",
    path: "/abastecimentos",
    icon: "B",
    tone: "info" as const,
  },
  {
    label: "Ocorrencias graves",
    value: "0",
    detail: "Severidade alta em destaque",
    path: "/ocorrencias",
    icon: "O",
    tone: "danger" as const,
  },
  {
    label: "Gastos mensais",
    value: "R$ 0,00",
    detail: "Custos consolidados do mes",
    path: "/relatorios",
    icon: "$",
    tone: "warning" as const,
  },
];

export default function AdminHome({ onNavigate }: AdminHomeProps) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  useEffect(() => {
    listarOcorrencias()
      .then(setOcorrencias)
      .catch(() => setOcorrencias([]));
  }, []);

  const ocorrenciasAltas = useMemo(
    () => ocorrencias.filter((ocorrencia) => ocorrencia.severidade === "alta"),
    [ocorrencias]
  );

  const metrics = baseMetrics.map((metric) =>
    metric.label === "Ocorrencias graves"
      ? { ...metric, value: String(ocorrenciasAltas.length) }
      : metric
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
              IFROTA
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-text-main">
              Controle administrativo da frota
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
              Acompanhe disponibilidade, viagens, manutencoes, ocorrencias e
              custos em uma visao rapida para tomada de decisao.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("/viagens")}
            className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            Nova viagem
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            tone={metric.tone}
            icon={metric.icon}
            onClick={() => onNavigate(metric.path)}
          />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-main">Atalhos</h2>
              <p className="text-sm text-text-muted">
                Acoes administrativas mais usadas na rotina da frota.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("/viagens")}
              className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
            >
              Nova viagem
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Cadastrar veiculo", "/veiculos"],
              ["Cadastrar motorista", "/motoristas"],
              ["Consultar calendario", "/calendario"],
              ["Ver relatorios", "/relatorios"],
            ].map(([item, path]) => (
              <button
                key={item}
                type="button"
                onClick={() => onNavigate(path)}
                className="rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium text-text-main transition hover:border-primary-600 hover:bg-primary-100"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-text-main">
            Alertas administrativos
          </h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-900">
                CNH perto do vencimento
              </p>
              <p className="mt-1 text-sm text-amber-800">
                O alerta sera exibido quando houver motoristas cadastrados.
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-900">
                Ocorrencias de alta severidade
              </p>
              <p className="mt-1 text-sm text-red-800">
                {ocorrenciasAltas.length > 0
                  ? `${ocorrenciasAltas.length} registro(s) exigem atencao.`
                  : "Nenhum registro grave encontrado no momento."}
              </p>
              {ocorrenciasAltas.length > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate("/ocorrencias")}
                  className="mt-3 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-800"
                >
                  Ver ocorrencias
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
