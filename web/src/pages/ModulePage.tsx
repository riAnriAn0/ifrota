import EmptyState from "../components/ui/EmptyState";

type ModulePageProps = {
  title: string;
  description: string;
  actionLabel?: string;
  columns?: string[];
};

export default function ModulePage({
  title,
  description,
  actionLabel,
  columns = ["Identificacao", "Status", "Atualizado em", "Acoes"],
}: ModulePageProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-main">{title}</h2>
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        </div>
        {actionLabel && (
          <button
            type="button"
            className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            {actionLabel}
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-4">
          <input
            type="search"
            placeholder="Buscar registros"
            className="h-11 w-full rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 sm:max-w-sm"
          />
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-background text-xs uppercase tracking-wide text-text-muted">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-4 py-8">
                  <EmptyState
                    title="Nenhum registro encontrado"
                    description="A estrutura da pagina esta pronta para receber dados do Supabase, filtros e acoes de cadastro."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 md:hidden">
          <EmptyState
            title="Nenhum registro encontrado"
            description="No celular, os registros aparecem em cartoes compactos com as acoes principais."
          />
        </div>
      </div>
    </div>
  );
}
