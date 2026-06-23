import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  atualizarManutencao,
  criarManutencao,
  listarManutencoes,
} from "../services/manutencoesService";
import { listarVeiculos } from "../services/veiculosService";
import type {
  Manutencao,
  ManutencaoFormData,
  StatusManutencao,
  TipoManutencao,
  Veiculo,
} from "../types/app";
import {
  getAlertaPreventiva,
  manutencoesPreventivasProximas,
  type AlertaManutencao,
} from "../utils/manutencoes";

const tipoOptions: Array<{ value: TipoManutencao; label: string }> = [
  { value: "corretiva", label: "Corretiva" },
  { value: "preventiva", label: "Preventiva" },
];

const statusOptions: Array<{ value: StatusManutencao; label: string }> = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluida" },
  { value: "cancelada", label: "Cancelada" },
];

const tipoStyles: Record<TipoManutencao, string> = {
  corretiva: "border-red-200 bg-red-50 text-red-800",
  preventiva: "border-blue-200 bg-blue-50 text-blue-800",
};

const statusStyles: Record<StatusManutencao, string> = {
  pendente: "border-amber-200 bg-amber-50 text-amber-800",
  em_andamento: "border-blue-200 bg-blue-50 text-blue-800",
  concluida: "border-green-200 bg-green-50 text-green-800",
  cancelada: "border-slate-200 bg-slate-100 text-slate-700",
};

const alertaStyles: Record<AlertaManutencao, string> = {
  vencida: "border-red-300 bg-red-50 text-red-900",
  proxima: "border-amber-300 bg-amber-50 text-amber-900",
  regular: "border-green-200 bg-green-50 text-green-800",
  nao_aplicavel: "border-slate-200 bg-slate-100 text-slate-700",
};

const alertaLabels: Record<AlertaManutencao, string> = {
  vencida: "Preventiva vencida",
  proxima: "Preventiva proxima",
  regular: "Preventiva regular",
  nao_aplicavel: "Nao aplicavel",
};

const emptyForm: ManutencaoFormData = {
  veiculoId: "",
  tipo: "corretiva",
  categoria: "",
  data: "",
  kmRegistro: 0,
  custo: 0,
  oficina: "",
  descricao: "",
  status: "pendente",
  proximaDataPrevista: "",
  proximoKmPrevisto: null,
};

function getTipoLabel(tipo: TipoManutencao) {
  return tipoOptions.find((option) => option.value === tipo)?.label || tipo;
}

function getStatusLabel(status: StatusManutencao) {
  return statusOptions.find((option) => option.value === status)?.label || status;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  if (!value) return "Nao informada";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Nao informada";
  return date.toLocaleDateString("pt-BR");
}

function nullableNumber(value: string) {
  return value === "" ? null : Number(value);
}

function formFromManutencao(manutencao: Manutencao): ManutencaoFormData {
  return {
    veiculoId: manutencao.veiculoId,
    tipo: manutencao.tipo,
    categoria: manutencao.categoria,
    data: manutencao.data,
    kmRegistro: manutencao.kmRegistro,
    custo: manutencao.custo,
    oficina: manutencao.oficina,
    descricao: manutencao.descricao,
    status: manutencao.status,
    proximaDataPrevista: manutencao.proximaDataPrevista,
    proximoKmPrevisto: manutencao.proximoKmPrevisto,
  };
}

function validateMaintenance(data: ManutencaoFormData) {
  const errors: string[] = [];

  if (!data.veiculoId) errors.push("Selecione o veiculo.");
  if (!data.categoria.trim()) errors.push("Informe a categoria.");
  if (!data.data) errors.push("Informe a data da manutencao.");
  if (data.kmRegistro < 0) errors.push("O km de registro nao pode ser negativo.");
  if (data.custo < 0) errors.push("O custo nao pode ser negativo.");
  if (!data.oficina.trim()) errors.push("Informe a oficina ou responsavel.");
  if (!data.descricao.trim()) errors.push("Informe a descricao.");
  if (
    data.tipo === "preventiva" &&
    !data.proximaDataPrevista &&
    data.proximoKmPrevisto === null
  ) {
    errors.push("Informe proxima data prevista ou proximo km previsto para preventiva.");
  }

  return errors;
}

function Badge({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

type MaintenanceFormProps = {
  initialData: ManutencaoFormData;
  mode: "create" | "edit";
  saving: boolean;
  veiculos: Veiculo[];
  onCancel: () => void;
  onSubmit: (data: ManutencaoFormData) => Promise<void>;
};

function MaintenanceForm({
  initialData,
  mode,
  saving,
  veiculos,
  onCancel,
  onSubmit,
}: MaintenanceFormProps) {
  const [form, setForm] = useState<ManutencaoFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setForm(initialData);
    setValidationErrors([]);
  }, [initialData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateMaintenance(form);

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
            {mode === "create" ? "Cadastrar manutencao" : "Editar manutencao"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Registre manutencoes corretivas e preventivas da frota.
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
          Veiculo
          <select
            value={form.veiculoId}
            onChange={(event) => setForm({ ...form, veiculoId: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Selecione</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-main">
          Tipo
          <select
            value={form.tipo}
            onChange={(event) =>
              setForm({ ...form, tipo: event.target.value as TipoManutencao })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            {tipoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-main">
          Categoria
          <input
            value={form.categoria}
            onChange={(event) => setForm({ ...form, categoria: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Ex: pneus, freios, oleo"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Status
          <select
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value as StatusManutencao })
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
          Data
          <input
            type="date"
            value={form.data}
            onChange={(event) => setForm({ ...form, data: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          KM registro
          <input
            type="number"
            value={form.kmRegistro}
            onChange={(event) =>
              setForm({ ...form, kmRegistro: Number(event.target.value) })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Custo
          <input
            type="number"
            step="0.01"
            value={form.custo}
            onChange={(event) => setForm({ ...form, custo: Number(event.target.value) })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Oficina
          <input
            value={form.oficina}
            onChange={(event) => setForm({ ...form, oficina: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Oficina ou responsavel"
          />
        </label>

        {form.tipo === "preventiva" && (
          <>
            <label className="text-sm font-medium text-text-main">
              Proxima data prevista
              <input
                type="date"
                value={form.proximaDataPrevista}
                onChange={(event) =>
                  setForm({ ...form, proximaDataPrevista: event.target.value })
                }
                className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <label className="text-sm font-medium text-text-main">
              Proximo km previsto
              <input
                type="number"
                value={form.proximoKmPrevisto ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    proximoKmPrevisto: nullableNumber(event.target.value),
                  })
                }
                className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </>
        )}

        <label className="text-sm font-medium text-text-main md:col-span-2">
          Descricao
          <textarea
            value={form.descricao}
            onChange={(event) => setForm({ ...form, descricao: event.target.value })}
            className="mt-2 min-h-28 w-full rounded-lg border border-border px-3 py-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Descreva o servico realizado ou previsto"
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
            {saving ? "Salvando..." : "Salvar manutencao"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Manutencoes() {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoManutencao | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<StatusManutencao | "todos">("todos");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [newMaintenanceType, setNewMaintenanceType] =
    useState<TipoManutencao>("corretiva");
  const [selectedMaintenance, setSelectedMaintenance] = useState<Manutencao | null>(null);
  const [detailMaintenance, setDetailMaintenance] = useState<Manutencao | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [maintenanceData, vehicleData] = await Promise.all([
        listarManutencoes(),
        listarVeiculos(),
      ]);
      setManutencoes(maintenanceData);
      setVeiculos(vehicleData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar as manutencoes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const preventiveAlerts = useMemo(
    () => manutencoesPreventivasProximas(manutencoes, veiculos),
    [manutencoes, veiculos]
  );

  const filteredMaintenances = useMemo(() => {
    const term = search.trim().toLowerCase();

    return manutencoes.filter((manutencao) => {
      const matchesTipo = tipoFilter === "todos" || manutencao.tipo === tipoFilter;
      const matchesStatus =
        statusFilter === "todos" || manutencao.status === statusFilter;
      const matchesSearch =
        !term ||
        manutencao.veiculoDescricao.toLowerCase().includes(term) ||
        manutencao.veiculoPlaca.toLowerCase().includes(term) ||
        manutencao.categoria.toLowerCase().includes(term) ||
        manutencao.oficina.toLowerCase().includes(term);

      return matchesTipo && matchesStatus && matchesSearch;
    });
  }, [manutencoes, search, statusFilter, tipoFilter]);

  function openCreateForm(tipo: TipoManutencao = "corretiva") {
    setSelectedMaintenance(null);
    setDetailMaintenance(null);
    setFormMode("create");
    setError("");
    setSuccess("");
    setNewMaintenanceType(tipo);
  }

  function openEditForm(manutencao: Manutencao) {
    setSelectedMaintenance(manutencao);
    setDetailMaintenance(null);
    setFormMode("edit");
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setSelectedMaintenance(null);
    setFormMode(null);
  }

  async function handleSubmit(data: ManutencaoFormData) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (formMode === "edit" && selectedMaintenance) {
        const updated = await atualizarManutencao(selectedMaintenance.id, data);
        setManutencoes((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
        setSuccess("Manutencao atualizada com sucesso.");
      } else {
        const created = await criarManutencao(data);
        setManutencoes((current) => [created, ...current]);
        setSuccess("Manutencao cadastrada com sucesso.");
      }

      closeForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar a manutencao."
      );
    } finally {
      setSaving(false);
    }
  }

  const formInitialData = selectedMaintenance
    ? formFromManutencao(selectedMaintenance)
    : { ...emptyForm, tipo: newMaintenanceType };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-main">
              Manutencoes
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Controle corretivas, preventivas e acompanhe proximos vencimentos
              por data ou quilometragem.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => openCreateForm("corretiva")}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-100"
            >
              Nova corretiva
            </button>
            <button
              type="button"
              onClick={() => openCreateForm("preventiva")}
              className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
            >
              Nova preventiva
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-text-muted">Total</p>
            <p className="mt-2 text-2xl font-semibold text-text-main">
              {manutencoes.length}
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-semibold uppercase text-blue-800">
              Preventivas
            </p>
            <p className="mt-2 text-2xl font-semibold text-blue-900">
              {manutencoes.filter((item) => item.tipo === "preventiva").length}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase text-amber-800">
              Alertas preventivos
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-900">
              {preventiveAlerts.length}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_200px_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por veiculo, placa, categoria ou oficina"
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
          <select
            value={tipoFilter}
            onChange={(event) =>
              setTipoFilter(event.target.value as TipoManutencao | "todos")
            }
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="todos">Todos os tipos</option>
            {tipoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusManutencao | "todos")
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

      {preventiveAlerts.length > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-900">
            Manutencoes preventivas proximas
          </h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {preventiveAlerts.slice(0, 4).map((manutencao) => (
              <button
                key={manutencao.id}
                type="button"
                onClick={() => setDetailMaintenance(manutencao)}
                className="rounded-lg border border-amber-200 bg-white/70 p-3 text-left text-sm text-amber-900"
              >
                <strong>{manutencao.veiculoDescricao}</strong> -{" "}
                {manutencao.categoria}
                <span className="mt-1 block">
                  Data: {formatDate(manutencao.proximaDataPrevista)} | KM:{" "}
                  {manutencao.proximoKmPrevisto?.toLocaleString("pt-BR") ||
                    "Nao definido"}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

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
        <MaintenanceForm
          initialData={formInitialData}
          mode={formMode}
          saving={saving}
          veiculos={veiculos}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      {detailMaintenance && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-main">
                Detalhes da manutencao
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {detailMaintenance.veiculoDescricao} {detailMaintenance.veiculoPlaca}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDetailMaintenance(null)}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
            >
              Fechar
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className={tipoStyles[detailMaintenance.tipo]}>
              {getTipoLabel(detailMaintenance.tipo)}
            </Badge>
            <Badge className={statusStyles[detailMaintenance.status]}>
              {getStatusLabel(detailMaintenance.status)}
            </Badge>
            {detailMaintenance.tipo === "preventiva" && (
              <Badge
                className={
                  alertaStyles[getAlertaPreventiva(detailMaintenance, veiculos)]
                }
              >
                {alertaLabels[getAlertaPreventiva(detailMaintenance, veiculos)]}
              </Badge>
            )}
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Categoria", detailMaintenance.categoria],
              ["Data", formatDate(detailMaintenance.data)],
              ["KM registro", `${detailMaintenance.kmRegistro.toLocaleString("pt-BR")} km`],
              ["Custo", formatCurrency(detailMaintenance.custo)],
              ["Oficina", detailMaintenance.oficina],
              ["Proxima data", formatDate(detailMaintenance.proximaDataPrevista)],
              [
                "Proximo KM",
                detailMaintenance.proximoKmPrevisto?.toLocaleString("pt-BR") ||
                  "Nao definido",
              ],
              ["Status", getStatusLabel(detailMaintenance.status)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-background p-3"
              >
                <dt className="text-xs font-semibold uppercase text-text-muted">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-text-main">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 rounded-lg border border-border bg-background p-3 text-sm leading-6 text-text-muted">
            {detailMaintenance.descricao}
          </p>
        </section>
      )}

      <section className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text-main">
            {filteredMaintenances.length} manutencao(oes) encontrada(s)
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
            Carregando manutencoes...
          </div>
        ) : filteredMaintenances.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-text-main">
              Nenhuma manutencao encontrada
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Ajuste os filtros ou cadastre a primeira manutencao.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-background text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Veiculo</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Custo</th>
                    <th className="px-4 py-3 font-semibold">Preventiva</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMaintenances.map((manutencao) => {
                    const alerta = getAlertaPreventiva(manutencao, veiculos);
                    return (
                      <tr key={manutencao.id} className="align-top">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-text-main">
                            {manutencao.veiculoDescricao}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {manutencao.veiculoPlaca || "Sem placa"} |{" "}
                            {manutencao.categoria}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={tipoStyles[manutencao.tipo]}>
                            {getTipoLabel(manutencao.tipo)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-text-muted">
                          {formatDate(manutencao.data)}
                        </td>
                        <td className="px-4 py-4 text-text-muted">
                          {formatCurrency(manutencao.custo)}
                        </td>
                        <td className="px-4 py-4">
                          {manutencao.tipo === "preventiva" ? (
                            <Badge className={alertaStyles[alerta]}>
                              {alertaLabels[alerta]}
                            </Badge>
                          ) : (
                            <span className="text-xs text-text-muted">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={statusStyles[manutencao.status]}>
                            {getStatusLabel(manutencao.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailMaintenance(manutencao)}
                              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-background"
                            >
                              Detalhes
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditForm(manutencao)}
                              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary-800 transition hover:bg-primary-100"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredMaintenances.map((manutencao) => {
                const alerta = getAlertaPreventiva(manutencao, veiculos);
                return (
                  <article
                    key={manutencao.id}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-text-main">
                          {manutencao.veiculoDescricao}
                        </h3>
                        <p className="mt-1 text-sm text-text-muted">
                          {manutencao.categoria} | {formatDate(manutencao.data)}
                        </p>
                      </div>
                      <Badge className={tipoStyles[manutencao.tipo]}>
                        {getTipoLabel(manutencao.tipo)}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className={statusStyles[manutencao.status]}>
                        {getStatusLabel(manutencao.status)}
                      </Badge>
                      {manutencao.tipo === "preventiva" && (
                        <Badge className={alertaStyles[alerta]}>
                          {alertaLabels[alerta]}
                        </Badge>
                      )}
                    </div>

                    <p className="mt-4 text-sm text-text-muted">
                      {formatCurrency(manutencao.custo)} |{" "}
                      {manutencao.kmRegistro.toLocaleString("pt-BR")} km
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailMaintenance(manutencao)}
                        className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-white"
                      >
                        Detalhes
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditForm(manutencao)}
                        className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary-800 transition hover:bg-primary-100"
                      >
                        Editar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
