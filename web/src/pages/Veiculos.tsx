import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  atualizarVeiculo,
  criarVeiculo,
  listarVeiculos,
} from "../services/veiculosService";
import type { StatusVeiculo, Veiculo, VeiculoFormData } from "../types/app";

const statusOptions: Array<{ value: StatusVeiculo; label: string }> = [
  { value: "disponivel", label: "Disponivel" },
  { value: "em_uso", label: "Em uso" },
  { value: "em_manutencao", label: "Em manutencao" },
  { value: "inativo", label: "Inativo" },
];

const statusStyles: Record<StatusVeiculo, string> = {
  disponivel: "bg-green-50 text-green-800 border-green-200",
  em_uso: "bg-blue-50 text-blue-800 border-blue-200",
  em_manutencao: "bg-amber-50 text-amber-800 border-amber-200",
  inativo: "bg-slate-100 text-slate-700 border-slate-200",
};

const emptyForm: VeiculoFormData = {
  marca: "",
  modelo: "",
  placa: "",
  ano: new Date().getFullYear(),
  numAssentos: 1,
  kmAtual: 0,
  status: "disponivel",
  observacoes: "",
  fotoUrl: "",
};

function getStatusLabel(status: StatusVeiculo) {
  return statusOptions.find((option) => option.value === status)?.label || status;
}

function formFromVeiculo(veiculo: Veiculo): VeiculoFormData {
  return {
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    placa: veiculo.placa,
    ano: veiculo.ano,
    numAssentos: veiculo.numAssentos,
    kmAtual: veiculo.kmAtual,
    status: veiculo.status,
    observacoes: veiculo.observacoes,
    fotoUrl: veiculo.fotoUrl,
  };
}

function validateVehicle(data: VeiculoFormData): string[] {
  const currentYear = new Date().getFullYear() + 1;
  const errors: string[] = [];

  if (!data.marca.trim()) errors.push("Informe a marca.");
  if (!data.modelo.trim()) errors.push("Informe o modelo.");
  if (!data.placa.trim()) errors.push("Informe a placa.");
  if (data.placa.trim().length < 7) errors.push("A placa deve ter ao menos 7 caracteres.");
  if (data.ano < 1950 || data.ano > currentYear) errors.push("Informe um ano valido.");
  if (data.numAssentos < 1) errors.push("O numero de assentos deve ser maior que zero.");
  if (data.kmAtual < 0) errors.push("A quilometragem nao pode ser negativa.");

  return errors;
}

function StatusBadge({ status }: { status: StatusVeiculo }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

type VehicleFormProps = {
  initialData: VeiculoFormData;
  mode: "create" | "edit";
  saving: boolean;
  onCancel: () => void;
  onSubmit: (data: VeiculoFormData) => Promise<void>;
};

function VehicleForm({
  initialData,
  mode,
  saving,
  onCancel,
  onSubmit,
}: VehicleFormProps) {
  const [form, setForm] = useState<VeiculoFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setForm(initialData);
    setValidationErrors([]);
  }, [initialData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateVehicle(form);

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
            {mode === "create" ? "Cadastrar veiculo" : "Editar veiculo"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Preencha os dados principais do veiculo institucional.
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
          Marca
          <input
            value={form.marca}
            onChange={(event) => setForm({ ...form, marca: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Ex: Volkswagen"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Modelo
          <input
            value={form.modelo}
            onChange={(event) => setForm({ ...form, modelo: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Ex: Onibus"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Placa
          <input
            value={form.placa}
            onChange={(event) =>
              setForm({ ...form, placa: event.target.value.toUpperCase() })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm uppercase outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="ABC1D23"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Status
          <select
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value as StatusVeiculo })
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

        <label className="text-sm font-medium text-text-main">
          Ano
          <input
            type="number"
            value={form.ano}
            onChange={(event) =>
              setForm({ ...form, ano: Number(event.target.value) })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Numero de assentos
          <input
            type="number"
            value={form.numAssentos}
            onChange={(event) =>
              setForm({ ...form, numAssentos: Number(event.target.value) })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Quilometragem atual
          <input
            type="number"
            value={form.kmAtual}
            onChange={(event) =>
              setForm({ ...form, kmAtual: Number(event.target.value) })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Foto URL opcional
          <input
            value={form.fotoUrl}
            onChange={(event) => setForm({ ...form, fotoUrl: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="https://..."
          />
        </label>

        <label className="text-sm font-medium text-text-main md:col-span-2">
          Observacoes
          <textarea
            value={form.observacoes}
            onChange={(event) =>
              setForm({ ...form, observacoes: event.target.value })
            }
            className="mt-2 min-h-28 w-full rounded-lg border border-border px-3 py-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Informacoes adicionais sobre o veiculo"
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
            {saving ? "Salvando..." : "Salvar veiculo"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusVeiculo | "todos">(
    "todos"
  );
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Veiculo | null>(null);

  async function loadVehicles() {
    setLoading(true);
    setError("");

    try {
      const data = await listarVeiculos();
      setVeiculos(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar os veiculos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return veiculos.filter((veiculo) => {
      const matchesStatus =
        statusFilter === "todos" || veiculo.status === statusFilter;
      const matchesSearch =
        !term ||
        veiculo.marca.toLowerCase().includes(term) ||
        veiculo.modelo.toLowerCase().includes(term) ||
        veiculo.placa.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, veiculos]);

  function openCreateForm() {
    setSelectedVehicle(null);
    setFormMode("create");
    setError("");
    setSuccess("");
  }

  function openEditForm(veiculo: Veiculo) {
    setSelectedVehicle(veiculo);
    setFormMode("edit");
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setSelectedVehicle(null);
    setFormMode(null);
  }

  async function handleSubmit(data: VeiculoFormData) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (formMode === "edit" && selectedVehicle) {
        const updated = await atualizarVeiculo(selectedVehicle.id, data);
        setVeiculos((current) =>
          current.map((veiculo) =>
            veiculo.id === updated.id ? updated : veiculo
          )
        );
        setSuccess("Veiculo atualizado com sucesso.");
      } else {
        const created = await criarVeiculo(data);
        setVeiculos((current) => [created, ...current]);
        setSuccess("Veiculo cadastrado com sucesso.");
      }

      closeForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar o veiculo."
      );
    } finally {
      setSaving(false);
    }
  }

  const formInitialData = selectedVehicle
    ? formFromVeiculo(selectedVehicle)
    : emptyForm;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-main">
              Gestao de veiculos
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Cadastre, consulte e atualize os dados principais da frota
              institucional.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            Novo veiculo
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por marca, modelo ou placa"
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusVeiculo | "todos")
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
        <VehicleForm
          initialData={formInitialData}
          mode={formMode}
          saving={saving}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      <section className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text-main">
            {filteredVehicles.length} veiculo(s) encontrado(s)
          </p>
          <button
            type="button"
            onClick={() => void loadVehicles()}
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-background"
          >
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-text-muted">
            Carregando veiculos...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-text-main">
              Nenhum veiculo encontrado
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Ajuste a busca, altere o filtro ou cadastre o primeiro veiculo.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-background text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Veiculo</th>
                    <th className="px-4 py-3 font-semibold">Placa</th>
                    <th className="px-4 py-3 font-semibold">Ano</th>
                    <th className="px-4 py-3 font-semibold">Assentos</th>
                    <th className="px-4 py-3 font-semibold">KM atual</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVehicles.map((veiculo) => (
                    <tr key={veiculo.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {veiculo.fotoUrl ? (
                            <img
                              src={veiculo.fotoUrl}
                              alt={`${veiculo.marca} ${veiculo.modelo}`}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-sm font-semibold text-primary-800">
                              {veiculo.marca.slice(0, 2).toUpperCase() || "VF"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-text-main">
                              {veiculo.marca} {veiculo.modelo}
                            </p>
                            <p className="mt-1 max-w-xs text-xs text-text-muted">
                              {veiculo.observacoes || "Sem observacoes"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-text-main">
                        {veiculo.placa}
                      </td>
                      <td className="px-4 py-4 text-text-muted">{veiculo.ano}</td>
                      <td className="px-4 py-4 text-text-muted">
                        {veiculo.numAssentos}
                      </td>
                      <td className="px-4 py-4 text-text-muted">
                        {veiculo.kmAtual.toLocaleString("pt-BR")} km
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={veiculo.status} />
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => openEditForm(veiculo)}
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
              {filteredVehicles.map((veiculo) => (
                <article
                  key={veiculo.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-text-main">
                        {veiculo.marca} {veiculo.modelo}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-text-muted">
                        {veiculo.placa}
                      </p>
                    </div>
                    <StatusBadge status={veiculo.status} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-text-muted">Ano</dt>
                      <dd className="font-semibold text-text-main">
                        {veiculo.ano}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Assentos</dt>
                      <dd className="font-semibold text-text-main">
                        {veiculo.numAssentos}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-text-muted">KM atual</dt>
                      <dd className="font-semibold text-text-main">
                        {veiculo.kmAtual.toLocaleString("pt-BR")} km
                      </dd>
                    </div>
                  </dl>

                  {veiculo.observacoes && (
                    <p className="mt-4 text-sm leading-6 text-text-muted">
                      {veiculo.observacoes}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => openEditForm(veiculo)}
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
