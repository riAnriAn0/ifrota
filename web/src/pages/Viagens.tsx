import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listarMotoristas } from "../services/motoristasService";
import { listarVeiculos } from "../services/veiculosService";
import {
  atualizarViagem,
  criarViagem,
  listarViagens,
} from "../services/viagensService";
import type {
  Motorista,
  StatusViagem,
  Veiculo,
  Viagem,
  ViagemFormData,
} from "../types/app";
import { motoristaPodeIniciarViagem } from "../utils/motoristas";
import { origemPadraoViagem, validarViagem } from "../utils/viagens";

const statusOptions: Array<{ value: StatusViagem; label: string }> = [
  { value: "agendada", label: "Agendada" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "finalizada", label: "Finalizada" },
  { value: "cancelada", label: "Cancelada" },
];

const statusStyles: Record<StatusViagem, string> = {
  agendada: "bg-blue-50 text-blue-800 border-blue-200",
  em_andamento: "bg-green-50 text-green-800 border-green-200",
  finalizada: "bg-slate-100 text-slate-700 border-slate-200",
  cancelada: "bg-red-50 text-red-800 border-red-200",
};

const emptyForm: ViagemFormData = {
  motoristaId: "",
  veiculoId: "",
  origem: origemPadraoViagem,
  destino: "",
  numPassageiros: 1,
  dataSaidaPrevista: "",
  dataChegadaPrevista: "",
  kmInicial: null,
  kmFinal: null,
  status: "agendada",
  observacoes: "",
};

function getStatusLabel(status: StatusViagem) {
  return statusOptions.find((option) => option.value === status)?.label || status;
}

function formatDateTime(value: string) {
  if (!value) return "Nao informado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nao informado";

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function toInputDateTime(value: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function nullableNumber(value: string) {
  return value === "" ? null : Number(value);
}

function formFromViagem(viagem: Viagem): ViagemFormData {
  return {
    motoristaId: viagem.motoristaId,
    veiculoId: viagem.veiculoId,
    origem: viagem.origem,
    destino: viagem.destino,
    numPassageiros: viagem.numPassageiros,
    dataSaidaPrevista: toInputDateTime(viagem.dataSaidaPrevista),
    dataChegadaPrevista: toInputDateTime(viagem.dataChegadaPrevista),
    kmInicial: viagem.kmInicial,
    kmFinal: viagem.kmFinal,
    status: viagem.status,
    observacoes: viagem.observacoes,
  };
}

function StatusBadge({ status }: { status: StatusViagem }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

type ViagemFormProps = {
  initialData: ViagemFormData;
  mode: "create" | "edit";
  saving: boolean;
  viagens: Viagem[];
  selectedId?: string;
  motoristas: Motorista[];
  veiculos: Veiculo[];
  onCancel: () => void;
  onSubmit: (data: ViagemFormData) => Promise<void>;
};

function ViagemForm({
  initialData,
  mode,
  saving,
  viagens,
  selectedId,
  motoristas,
  veiculos,
  onCancel,
  onSubmit,
}: ViagemFormProps) {
  const [form, setForm] = useState<ViagemFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setForm(initialData);
    setValidationErrors([]);
  }, [initialData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validarViagem(form, viagens, selectedId);
    const motorista = motoristas.find((item) => item.id === form.motoristaId);

    if (
      form.status === "em_andamento" &&
      motorista &&
      !motoristaPodeIniciarViagem(motorista)
    ) {
      errors.push("Este motorista nao pode iniciar viagem com CNH vencida ou status inativo.");
    }

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
            {mode === "create" ? "Cadastrar viagem" : "Editar viagem"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Origem padrao: {origemPadraoViagem}.
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
          Motorista
          <select
            value={form.motoristaId}
            onChange={(event) =>
              setForm({ ...form, motoristaId: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Selecione</option>
            {motoristas.map((motorista) => (
              <option key={motorista.id} value={motorista.id}>
                {motorista.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-main">
          Veiculo
          <select
            value={form.veiculoId}
            onChange={(event) =>
              setForm({ ...form, veiculoId: event.target.value })
            }
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
          Origem
          <input
            value={form.origem}
            onChange={(event) => setForm({ ...form, origem: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Destino
          <input
            value={form.destino}
            onChange={(event) =>
              setForm({ ...form, destino: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Destino da viagem"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Numero de passageiros
          <input
            type="number"
            value={form.numPassageiros}
            onChange={(event) =>
              setForm({ ...form, numPassageiros: Number(event.target.value) })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Status
          <select
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value as StatusViagem })
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
          Saida prevista
          <input
            type="datetime-local"
            value={form.dataSaidaPrevista}
            onChange={(event) =>
              setForm({ ...form, dataSaidaPrevista: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Chegada prevista
          <input
            type="datetime-local"
            value={form.dataChegadaPrevista}
            onChange={(event) =>
              setForm({ ...form, dataChegadaPrevista: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          KM inicial
          <input
            type="number"
            value={form.kmInicial ?? ""}
            onChange={(event) =>
              setForm({ ...form, kmInicial: nullableNumber(event.target.value) })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Obrigatorio ao iniciar"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          KM final
          <input
            type="number"
            value={form.kmFinal ?? ""}
            onChange={(event) =>
              setForm({ ...form, kmFinal: nullableNumber(event.target.value) })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Obrigatorio ao finalizar"
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
            placeholder="Informacoes adicionais"
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
            {saving ? "Salvando..." : "Salvar viagem"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Viagens() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusViagem | "todos">(
    "todos"
  );
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Viagem | null>(null);
  const [detailTrip, setDetailTrip] = useState<Viagem | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [tripData, driverData, vehicleData] = await Promise.all([
        listarViagens(),
        listarMotoristas(),
        listarVeiculos(),
      ]);
      setViagens(tripData);
      setMotoristas(driverData);
      setVeiculos(vehicleData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar as viagens."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredTrips = useMemo(() => {
    const term = search.trim().toLowerCase();

    return viagens.filter((viagem) => {
      const matchesStatus =
        statusFilter === "todos" || viagem.status === statusFilter;
      const matchesSearch =
        !term ||
        viagem.destino.toLowerCase().includes(term) ||
        viagem.motoristaNome.toLowerCase().includes(term) ||
        viagem.veiculoDescricao.toLowerCase().includes(term) ||
        viagem.veiculoPlaca.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, viagens]);

  function openCreateForm() {
    setSelectedTrip(null);
    setDetailTrip(null);
    setFormMode("create");
    setError("");
    setSuccess("");
  }

  function openEditForm(viagem: Viagem) {
    setSelectedTrip(viagem);
    setDetailTrip(null);
    setFormMode("edit");
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setSelectedTrip(null);
    setFormMode(null);
  }

  async function handleSubmit(data: ViagemFormData) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (formMode === "edit" && selectedTrip) {
        const updated = await atualizarViagem(selectedTrip.id, data);
        setViagens((current) =>
          current.map((viagem) => (viagem.id === updated.id ? updated : viagem))
        );
        setSuccess("Viagem atualizada com sucesso.");
      } else {
        const created = await criarViagem(data);
        setViagens((current) => [created, ...current]);
        setSuccess("Viagem cadastrada com sucesso.");
      }

      closeForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar a viagem."
      );
    } finally {
      setSaving(false);
    }
  }

  const formInitialData = selectedTrip ? formFromViagem(selectedTrip) : emptyForm;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-main">
              Gestao de viagens
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Agende viagens, acompanhe status, registre quilometragem e evite
              conflito de horarios do mesmo veiculo.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            Nova viagem
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por destino, motorista, veiculo ou placa"
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusViagem | "todos")
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
        <ViagemForm
          initialData={formInitialData}
          mode={formMode}
          saving={saving}
          viagens={viagens}
          selectedId={selectedTrip?.id}
          motoristas={motoristas}
          veiculos={veiculos}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      {detailTrip && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-main">
                Detalhes da viagem
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {detailTrip.origem} para {detailTrip.destino}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDetailTrip(null)}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
            >
              Fechar
            </button>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Motorista", detailTrip.motoristaNome],
              ["Veiculo", `${detailTrip.veiculoDescricao} ${detailTrip.veiculoPlaca}`],
              ["Saida", formatDateTime(detailTrip.dataSaidaPrevista)],
              ["Chegada", formatDateTime(detailTrip.dataChegadaPrevista)],
              ["Passageiros", String(detailTrip.numPassageiros)],
              ["KM inicial", detailTrip.kmInicial?.toLocaleString("pt-BR") || "Nao informado"],
              ["KM final", detailTrip.kmFinal?.toLocaleString("pt-BR") || "Nao informado"],
              ["Status", getStatusLabel(detailTrip.status)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-background p-3">
                <dt className="text-xs font-semibold uppercase text-text-muted">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-text-main">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {detailTrip.observacoes && (
            <p className="mt-5 rounded-lg border border-border bg-background p-3 text-sm leading-6 text-text-muted">
              {detailTrip.observacoes}
            </p>
          )}
        </section>
      )}

      <section className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text-main">
            {filteredTrips.length} viagem(ns) encontrada(s)
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
            Carregando viagens...
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-text-main">
              Nenhuma viagem encontrada
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Ajuste os filtros ou cadastre a primeira viagem.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="bg-background text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Destino</th>
                    <th className="px-4 py-3 font-semibold">Motorista</th>
                    <th className="px-4 py-3 font-semibold">Veiculo</th>
                    <th className="px-4 py-3 font-semibold">Periodo</th>
                    <th className="px-4 py-3 font-semibold">KM</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTrips.map((viagem) => (
                    <tr key={viagem.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-text-main">
                          {viagem.destino}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          Origem: {viagem.origem}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-text-muted">
                        {viagem.motoristaNome}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-text-main">
                          {viagem.veiculoDescricao}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {viagem.veiculoPlaca || "Sem placa"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-text-muted">
                        <p>{formatDateTime(viagem.dataSaidaPrevista)}</p>
                        <p className="mt-1">{formatDateTime(viagem.dataChegadaPrevista)}</p>
                      </td>
                      <td className="px-4 py-4 text-text-muted">
                        <p>Inicial: {viagem.kmInicial?.toLocaleString("pt-BR") || "-"}</p>
                        <p className="mt-1">Final: {viagem.kmFinal?.toLocaleString("pt-BR") || "-"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={viagem.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailTrip(viagem)}
                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-background"
                          >
                            Detalhes
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(viagem)}
                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary-800 transition hover:bg-primary-100"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredTrips.map((viagem) => (
                <article
                  key={viagem.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-text-main">
                        {viagem.destino}
                      </h3>
                      <p className="mt-1 text-sm text-text-muted">
                        {viagem.motoristaNome}
                      </p>
                    </div>
                    <StatusBadge status={viagem.status} />
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm">
                    <div>
                      <dt className="text-text-muted">Veiculo</dt>
                      <dd className="font-semibold text-text-main">
                        {viagem.veiculoDescricao} {viagem.veiculoPlaca}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Saida prevista</dt>
                      <dd className="font-semibold text-text-main">
                        {formatDateTime(viagem.dataSaidaPrevista)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Chegada prevista</dt>
                      <dd className="font-semibold text-text-main">
                        {formatDateTime(viagem.dataChegadaPrevista)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailTrip(viagem)}
                      className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-white"
                    >
                      Detalhes
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(viagem)}
                      className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary-800 transition hover:bg-primary-100"
                    >
                      Editar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
