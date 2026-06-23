import MetricCard from "../components/ui/MetricCard";

export default function Relatorios() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="KM rodado"
          value="0"
          detail="Por veiculo e periodo"
          tone="info"
        />
        <MetricCard
          label="Custos"
          value="R$ 0,00"
          detail="Por categoria"
          tone="warning"
        />
        <MetricCard
          label="Viagens"
          value="0"
          detail="Por motorista"
          tone="success"
        />
        <MetricCard
          label="Ocorrencias"
          value="0"
          detail="Por tipo e severidade"
          tone="danger"
        />
      </section>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text-main">
          Exportacoes futuras
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Esta area esta preparada para filtros e exportacao em PDF ou CSV
          quando os dados estiverem integrados ao Supabase.
        </p>
      </div>
    </div>
  );
}
