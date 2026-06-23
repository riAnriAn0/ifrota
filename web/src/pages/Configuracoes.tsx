import { useAuth } from "../hooks/useAuth";

export default function Configuracoes() {
  const { usuario } = useAuth();

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-text-main">Perfil</h2>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-text-muted">Nome</dt>
          <dd className="mt-1 text-base font-semibold text-text-main">
            {usuario?.nome || "Usuario"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-text-muted">Email</dt>
          <dd className="mt-1 text-base font-semibold text-text-main">
            {usuario?.email || "Nao informado"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-text-muted">Perfil</dt>
          <dd className="mt-1 text-base font-semibold text-text-main">
            {usuario?.tipo || "Nao definido"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-text-muted">Status</dt>
          <dd className="mt-1 text-base font-semibold text-text-main">
            {usuario?.ativo ? "Ativo" : "Inativo"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
