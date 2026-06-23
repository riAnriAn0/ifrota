import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  atualizarMotorista,
  criarMotorista,
  listarMotoristas,
  listarUsuariosParaMotoristas,
} from "../services/motoristasService";
import type {
  Motorista,
  MotoristaFormData,
  StatusMotorista,
  UsuarioOption,
} from "../types/app";
import {
  getSituacaoCnh,
  motoristaPodeIniciarViagem,
  type SituacaoCnh,
} from "../utils/motoristas";

const statusOptions: Array<{ value: StatusMotorista; label: string }> = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "afastado", label: "Afastado" },
];

const statusStyles: Record<StatusMotorista, string> = {
  ativo: "bg-green-50 text-green-800 border-green-200",
  inativo: "bg-slate-100 text-slate-700 border-slate-200",
  afastado: "bg-amber-50 text-amber-800 border-amber-200",
};

const cnhStyles: Record<SituacaoCnh, string> = {
  regular: "bg-green-50 text-green-800 border-green-200",
  proxima: "bg-amber-50 text-amber-800 border-amber-200",
  vencida: "bg-red-50 text-red-800 border-red-200",
  sem_data: "bg-slate-100 text-slate-700 border-slate-200",
};

const cnhLabels: Record<SituacaoCnh, string> = {
  regular: "CNH regular",
  proxima: "CNH perto do vencimento",
  vencida: "CNH vencida",
  sem_data: "Sem validade informada",
};

const emptyForm: MotoristaFormData = {
  usuarioId: "",
  nome: "",
  contato: "",
  categoriaCnh: "",
  validadeCnh: "",
  status: "ativo",
  observacoes: "",
};

function getStatusLabel(status: StatusMotorista) {
  return statusOptions.find((option) => option.value === status)?.label || status;
}

function formFromMotorista(motorista: Motorista): MotoristaFormData {
  return {
    usuarioId: motorista.usuarioId,
    nome: motorista.nome,
    contato: motorista.contato,
    categoriaCnh: motorista.categoriaCnh,
    validadeCnh: motorista.validadeCnh,
    status: motorista.status,
    observacoes: motorista.observacoes,
  };
}

function formatDate(value: string) {
  if (!value) return "Nao informada";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Nao informada";

  return date.toLocaleDateString("pt-BR");
}

function validateDriver(data: MotoristaFormData): string[] {
  const errors: string[] = [];

  if (!data.nome.trim()) errors.push("Informe o nome do motorista.");
  if (!data.contato.trim()) errors.push("Informe o contato.");
  if (!data.categoriaCnh.trim()) errors.push("Informe a categoria da CNH.");
  if (!data.validadeCnh) errors.push("Informe a validade da CNH.");

  return errors;
}

function StatusBadge({ status }: { status: StatusMotorista }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function CnhBadge({ validadeCnh }: { validadeCnh: string }) {
  const situacao = getSituacaoCnh(validadeCnh);

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${cnhStyles[situacao]}`}
    >
      {cnhLabels[situacao]}
    </span>
  );
}

type MotoristaFormProps = {
  initialData: MotoristaFormData;
  mode: "create" | "edit";
  saving: boolean;
  usuarios: UsuarioOption[];
  onCancel: () => void;
  onSubmit: (data: MotoristaFormData) => Promise<void>;
};

function MotoristaForm({
  initialData,
  mode,
  saving,
  usuarios,
  onCancel,
  onSubmit,
}: MotoristaFormProps) {
  const [form, setForm] = useState<MotoristaFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setForm(initialData);
    setValidationErrors([]);
  }, [initialData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateDriver(form);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    await onSubmit(form);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-main">
            {mode === "create" ? "Cadastrar motorista" : "Editar motorista"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Informe os dados funcionais e a validade da CNH.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
        >
          Fechar
        </button>
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {validationErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-text-main">
          Usuario vinculado
          <select
            value={form.usuarioId}
            onChange={(event) =>
              setForm({ ...form, usuarioId: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Sem usuario vinculado</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nome} {usuario.email ? `- ${usuario.email}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-main">
          Nome
          <input
            value={form.nome}
            onChange={(event) => setForm({ ...form, nome: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Nome completo"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Contato
          <input
            value={form.contato}
            onChange={(event) =>
              setForm({ ...form, contato: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Telefone ou email"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Categoria CNH
          <input
            value={form.categoriaCnh}
            onChange={(event) =>
              setForm({
                ...form,
                categoriaCnh: event.target.value.toUpperCase(),
              })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm uppercase outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Ex: B, D"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Validade CNH
          <input
            type="date"
            value={form.validadeCnh}
            onChange={(event) =>
              setForm({ ...form, validadeCnh: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Status
          <select
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value as StatusMotorista })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-main md:col-span-2">
          Observacoes
          <textarea
            value={form.observacoes}
            onChange={(event) =>
              setForm({ ...form, observacoes: event.target.value })
            }
            className="mt-2 min-h-28 w-full rounded-lg border border-border px-3 py-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Informacoes adicionais sobre o motorista"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 md:col-span-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Salvando..." : "Salvar motorista"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusMotorista | "todos">(
    "todos"
  );
  const [cnhFilter, setCnhFilter] = useState<SituacaoCnh | "todos">("todos");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Motorista | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [drivers, users] = await Promise.all([
        listarMotoristas(),
        listarUsuariosParaMotoristas(),
      ]);
      setMotoristas(drivers);
      setUsuarios(users);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar os motoristas."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const cnhStats = useMemo(() => {
    return motoristas.reduce(
      (stats, motorista) => {
        const situacao = getSituacaoCnh(motorista.validadeCnh);
        stats[situacao] += 1;
        return stats;
      },
      { regular: 0, proxima: 0, vencida: 0, sem_data: 0 } satisfies Record<
        SituacaoCnh,
        number
      >
    );
  }, [motoristas]);

  const filteredDrivers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return motoristas.filter((motorista) => {
      const situacaoCnh = getSituacaoCnh(motorista.validadeCnh);
      const matchesStatus =
        statusFilter === "todos" || motorista.status === statusFilter;
      const matchesCnh = cnhFilter === "todos" || situacaoCnh === cnhFilter;
      const matchesSearch =
        !term ||
        motorista.nome.toLowerCase().includes(term) ||
        motorista.contato.toLowerCase().includes(term) ||
        motorista.categoriaCnh.toLowerCase().includes(term);

      return matchesStatus && matchesCnh && matchesSearch;
    });
  }, [cnhFilter, motoristas, search, statusFilter]);

  function openCreateForm() {
    setSelectedDriver(null);
    setFormMode("create");
    setError("");
    setSuccess("");
  }

  function openEditForm(motorista: Motorista) {
    setSelectedDriver(motorista);
    setFormMode("edit");
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setSelectedDriver(null);
    setFormMode(null);
  }

  async function handleSubmit(data: MotoristaFormData) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (formMode === "edit" && selectedDriver) {
        const updated = await atualizarMotorista(selectedDriver.id, data);
        setMotoristas((current) =>
          current.map((motorista) =>
            motorista.id === updated.id ? updated : motorista
          )
        );
        setSuccess("Motorista atualizado com sucesso.");
      } else {
        const created = await criarMotorista(data);
        setMotoristas((current) => [created, ...current]);
        setSuccess("Motorista cadastrado com sucesso.");
      }

      closeForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar o motorista."
      );
    } finally {
      setSaving(false);
    }
  }

  const formInitialData = selectedDriver
    ? formFromMotorista(selectedDriver)
    : emptyForm;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-main">
              Gestao de motoristas
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Cadastre condutores, acompanhe validade da CNH e controle quem
              esta apto a iniciar viagens.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            Novo motorista
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Total
            </p>
            <p className="mt-2 text-2xl font-semibold text-text-main">
              {motoristas.length}
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-xs font-semibold uppercase text-green-800">
              CNH regular
            </p>
            <p className="mt-2 text-2xl font-semibold text-green-900">
              {cnhStats.regular}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase text-amber-800">
              Perto do vencimento
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-900">
              {cnhStats.proxima}
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold uppercase text-red-800">
              CNH vencida
            </p>
            <p className="mt-2 text-2xl font-semibold text-red-900">
              {cnhStats.vencida}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_240px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, contato ou categoria"
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusMotorista | "todos")
            }
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="todos">Todos os status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={cnhFilter}
            onChange={(event) =>
              setCnhFilter(event.target.value as SituacaoCnh | "todos")
            }
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="todos">Todas as CNHs</option>
            <option value="regular">CNH regular</option>
            <option value="proxima">Perto do vencimento</option>
            <option value="vencida">CNH vencida</option>
            <option value="sem_data">Sem validade</option>
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {formMode && (
        <MotoristaForm
          initialData={formInitialData}
          mode={formMode}
          saving={saving}
          usuarios={usuarios}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      <section className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text-main">
            {filteredDrivers.length} motorista(s) encontrado(s)
          </p>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-background"
          >
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-text-muted">
            Carregando motoristas...
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-text-main">
              Nenhum motorista encontrado
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Ajuste os filtros ou cadastre o primeiro motorista.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="bg-background text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Motorista</th>
                    <th className="px-4 py-3 font-semibold">Contato</th>
                    <th className="px-4 py-3 font-semibold">CNH</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Viagem</th>
                    <th className="px-4 py-3 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDrivers.map((motorista) => (
                    <tr key={motorista.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-text-main">
                          {motorista.nome}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {motorista.usuarioEmail
                            ? `Usuario: ${motorista.usuarioEmail}`
                            : "Sem usuario vinculado"}
                        </p>
                        {motorista.observacoes && (
                          <p className="mt-2 max-w-xs text-xs text-text-muted">
                            {motorista.observacoes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-text-muted">
                        {motorista.contato}
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <p className="font-semibold text-text-main">
                            Categoria {motorista.categoriaCnh}
                          </p>
                          <p className="text-xs text-text-muted">
                            Validade: {formatDate(motorista.validadeCnh)}
                          </p>
                          <CnhBadge validadeCnh={motorista.validadeCnh} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={motorista.status} />
                      </td>
                      <td className="px-4 py-4">
                        {motoristaPodeIniciarViagem(motorista) ? (
                          <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">
                            Apto para iniciar viagem
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
                            Bloqueado para iniciar viagem
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => openEditForm(motorista)}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary-800 transition hover:bg-primary-100"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredDrivers.map((motorista) => (
                <article
                  key={motorista.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-text-main">
                        {motorista.nome}
                      </h3>
                      <p className="mt-1 text-sm text-text-muted">
                        {motorista.contato}
                      </p>
                    </div>
                    <StatusBadge status={motorista.status} />
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-text-main">
                      CNH {motorista.categoriaCnh} - {formatDate(motorista.validadeCnh)}
                    </p>
                    <CnhBadge validadeCnh={motorista.validadeCnh} />
                  </div>

                  <div className="mt-4">
                    {motoristaPodeIniciarViagem(motorista) ? (
                      <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">
                        Apto para iniciar viagem
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
                        Bloqueado para iniciar viagem
                      </span>
                    )}
                  </div>

                  {motorista.observacoes && (
                    <p className="mt-4 text-sm leading-6 text-text-muted">
                      {motorista.observacoes}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => openEditForm(motorista)}
                    className="mt-4 w-full rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary-800 transition hover:bg-primary-100"
                  >
                    Editar
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
