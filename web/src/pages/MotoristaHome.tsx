type MotoristaHomeProps = {
  onNavigate: (path: string) => void;
};

export default function MotoristaHome({ onNavigate }: MotoristaHomeProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-primary-100 bg-primary-100 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-800">
          Acao principal
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-primary-900">
          Iniciar ou cadastrar viagem
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-900/80">
          A tela do motorista deve manter poucos passos: iniciar viagem,
          informar quilometragem, registrar abastecimento e comunicar
          ocorrencias.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigate("/viagens")}
            className="rounded-lg bg-primary-800 px-4 py-3 text-sm font-semibold text-white"
          >
            Iniciar viagem
          </button>
          <button
            type="button"
            onClick={() => onNavigate("/abastecimentos")}
            className="rounded-lg border border-primary-700 px-4 py-3 text-sm font-semibold text-primary-900"
          >
            Registrar abastecimento
          </button>
          <button
            type="button"
            onClick={() => onNavigate("/ocorrencias")}
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
          >
            Registrar ocorrencia
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Viagem atual", "Nenhuma viagem em andamento"],
          ["KM inicial", "Aguardando inicio"],
          ["Pendencias", "Sem pendencias registradas"],
        ].map(([title, detail]) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-surface p-4 shadow-sm"
          >
            <h3 className="font-semibold text-text-main">{title}</h3>
            <p className="mt-2 text-sm text-text-muted">{detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
