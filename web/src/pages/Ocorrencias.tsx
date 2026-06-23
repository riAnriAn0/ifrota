import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  atualizarOcorrencia,
  criarOcorrencia,
  excluirOcorrencia,
  listarOcorrencias,
  uploadOcorrenciaAnexo,
} from "../services/ocorrenciasService";
import { listarViagens } from "../services/viagensService";
import type {
  Ocorrencia,
  OcorrenciaFormData,
  SeveridadeOcorrencia,
  StatusOcorrencia,
  TipoOcorrencia,
  Viagem,
} from "../types/app";

const typeOptions: Array<{ value: TipoOcorrencia; label: string }> = [
  { value: "problema_mecanico", label: "Problema mecanico" },
  { value: "atraso", label: "Atraso" },
  { value: "acidente", label: "Acidente" },
  { value: "desvio_rota", label: "Desvio de rota" },
  { value: "pneu", label: "Pneu" },
  { value: "documentacao", label: "Documentacao" },
  { value: "outro", label: "Outro" },
];

const severityOptions: Array<{ value: SeveridadeOcorrencia; label: string }> = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];

const statusOptions: Array<{ value: StatusOcorrencia; label: string }> = [
  { value: "aberta", label: "Aberta" },
  { value: "em_analise", label: "Em analise" },
  { value: "resolvida", label: "Resolvida" },
];

const severityStyles: Record<SeveridadeOcorrencia, string> = {
  baixa: "border-green-200 bg-green-50 text-green-800",
  media: "border-amber-200 bg-amber-50 text-amber-800",
  alta: "border-red-300 bg-red-50 text-red-900",
};

const statusStyles: Record<StatusOcorrencia, string> = {
  aberta: "border-blue-200 bg-blue-50 text-blue-800",
  em_analise: "border-amber-200 bg-amber-50 text-amber-800",
  resolvida: "border-green-200 bg-green-50 text-green-800",
};

const emptyForm: OcorrenciaFormData = {
  viagemId: "",
  veiculoId: "",
  motoristaId: "",
  tipo: "problema_mecanico",
  severidade: "baixa",
  descricao: "",
  dataOcorrencia: "",
  status: "aberta",
};

function getTypeLabel(type: TipoOcorrencia) {
  return typeOptions.find((option) => option.value === type)?.label || type;
}

function getSeverityLabel(severity: SeveridadeOcorrencia) {
  return (
    severityOptions.find((option) => option.value === severity)?.label ||
    severity
  );
}

function getStatusLabel(status: StatusOcorrencia) {
  return statusOptions.find((option) => option.value === status)?.label || status;
}

function formatDateTime(value: string) {
  if (!value) return "Nao informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nao informada";
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

function formFromOccurrence(ocorrencia: Ocorrencia): OcorrenciaFormData {
  return {
    viagemId: ocorrencia.viagemId,
    veiculoId: ocorrencia.veiculoId,
    motoristaId: ocorrencia.motoristaId,
    tipo: ocorrencia.tipo,
    severidade: ocorrencia.severidade,
    descricao: ocorrencia.descricao,
    dataOcorrencia: toInputDateTime(ocorrencia.dataOcorrencia),
    status: ocorrencia.status,
  };
}

function validateOccurrence(data: OcorrenciaFormData) {
  const errors: string[] = [];

  if (!data.viagemId) errors.push("Selecione a viagem.");
  if (!data.veiculoId) errors.push("Informe o veiculo.");
  if (!data.motoristaId) errors.push("Informe o motorista.");
  if (!data.tipo) errors.push("Selecione o tipo.");
  if (!data.severidade) errors.push("Selecione a severidade.");
  if (!data.dataOcorrencia) errors.push("Informe a data da ocorrencia.");
  if (!data.descricao.trim()) errors.push("Descreva a ocorrencia.");

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
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

type OccurrenceFormProps = {
  initialData: OcorrenciaFormData;
  mode: "create" | "edit";
  saving: boolean;
  viagens: Viagem[];
  compact?: boolean;
  onCancel?: () => void;
  onSubmit: (data: OcorrenciaFormData, file: File | null) => Promise<void>;
};

function OccurrenceForm({
  initialData,
  mode,
  saving,
  viagens,
  compact = false,
  onCancel,
  onSubmit,
}: OccurrenceFormProps) {
  const [form, setForm] = useState<OcorrenciaFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setForm(initialData);
    setValidationErrors([]);
    setFile(null);
  }, [initialData]);

  function selectTrip(tripId: string) {
    const trip = viagens.find((viagem) => viagem.id === tripId);
    setForm({
      ...form,
      viagemId: tripId,
      veiculoId: trip?.veiculoId || "",
      motoristaId: trip?.motoristaId || "",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateOccurrence(form);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    await onSubmit(form, file);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-main">
            {compact
              ? "Registrar ocorrencia rapidamente"
              : mode === "create"
                ? "Registrar ocorrencia"
                : "Editar ocorrencia"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            A viagem selecionada preenche veiculo e motorista automaticamente.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
          >
            Fechar
          </button>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {validationErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-text-main md:col-span-2">
          Viagem
          <select
            value={form.viagemId}
            onChange={(event) => selectTrip(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Selecione uma viagem</option>
            {viagens.map((viagem) => (
              <option key={viagem.id} value={viagem.id}>
                {viagem.destino} - {viagem.motoristaNome} -{" "}
                {viagem.veiculoPlaca || viagem.veiculoDescricao}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-main">
          Tipo
          <select
            value={form.tipo}
            onChange={(event) =>
              setForm({ ...form, tipo: event.target.value as TipoOcorrencia })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-main">
          Severidade
          <select
            value={form.severidade}
            onChange={(event) =>
              setForm({
                ...form,
                severidade: event.target.value as SeveridadeOcorrencia,
              })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {!compact && (
          <label className="text-sm font-medium text-text-main">
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value as StatusOcorrencia,
                })
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
        )}

        <label className="text-sm font-medium text-text-main">
          Data da ocorrencia
          <input
            type="datetime-local"
            value={form.dataOcorrencia}
            onChange={(event) =>
              setForm({ ...form, dataOcorrencia: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main md:col-span-2">
          Foto/anexo opcional
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
          <span className="mt-1 block text-xs text-text-muted">
            Preparado para Supabase Storage no bucket anexos.
          </span>
        </label>

        <label className="text-sm font-medium text-text-main md:col-span-2">
          Descricao
          <textarea
            value={form.descricao}
            onChange={(event) =>
              setForm({ ...form, descricao: event.target.value })
            }
            className="mt-2 min-h-28 w-full rounded-lg border border-border px-3 py-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Descreva o que aconteceu"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 md:col-span-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Salvando..." : "Salvar ocorrencia"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] =
    useState<SeveridadeOcorrencia | "todas">("todas");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<Ocorrencia | null>(null);
  const [detailOccurrence, setDetailOccurrence] =
    useState<Ocorrencia | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [occurrenceData, tripData] = await Promise.all([
        listarOcorrencias(),
        listarViagens(),
      ]);
      setOcorrencias(occurrenceData);
      setViagens(tripData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar as ocorrencias."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const highSeverity = ocorrencias.filter(
    (ocorrencia) => ocorrencia.severidade === "alta"
  );

  const filteredOccurrences = useMemo(() => {
    const term = search.trim().toLowerCase();

    return ocorrencias.filter((ocorrencia) => {
      const matchesSeverity =
        severityFilter === "todas" || ocorrencia.severidade === severityFilter;
      const matchesSearch =
        !term ||
        ocorrencia.viagemDestino.toLowerCase().includes(term) ||
        ocorrencia.motoristaNome.toLowerCase().includes(term) ||
        ocorrencia.veiculoDescricao.toLowerCase().includes(term) ||
        ocorrencia.veiculoPlaca.toLowerCase().includes(term) ||
        ocorrencia.descricao.toLowerCase().includes(term);

      return matchesSeverity && matchesSearch;
    });
  }, [ocorrencias, search, severityFilter]);

  function openCreateForm() {
    setSelectedOccurrence(null);
    setDetailOccurrence(null);
    setFormMode("create");
    setError("");
    setSuccess("");
  }

  function openEditForm(ocorrencia: Ocorrencia) {
    setSelectedOccurrence(ocorrencia);
    setDetailOccurrence(null);
    setFormMode("edit");
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setSelectedOccurrence(null);
    setFormMode(null);
  }

  async function handleSubmit(data: OcorrenciaFormData, file: File | null) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let saved: Ocorrencia;
      if (formMode === "edit" && selectedOccurrence) {
        saved = await atualizarOcorrencia(selectedOccurrence.id, data);
        setOcorrencias((current) =>
          current.map((item) => (item.id === saved.id ? saved : item))
        );
        setSuccess("Ocorrencia atualizada com sucesso.");
      } else {
        saved = await criarOcorrencia(data);
        setOcorrencias((current) => [saved, ...current]);
        setSuccess("Ocorrencia registrada com sucesso.");
      }

      if (file) {
        await uploadOcorrenciaAnexo(saved.id, file);
      }

      closeForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar a ocorrencia."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ocorrencia: Ocorrencia) {
    const confirmed = window.confirm(
      `Deseja excluir esta ocorrencia de ${getTypeLabel(ocorrencia.tipo)}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await excluirOcorrencia(ocorrencia.id);
      setOcorrencias((current) =>
        current.filter((item) => item.id !== ocorrencia.id)
      );
      if (selectedOccurrence?.id === ocorrencia.id) closeForm();
      if (detailOccurrence?.id === ocorrencia.id) setDetailOccurrence(null);
      setSuccess("Ocorrencia excluida com sucesso.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Nao foi possivel excluir a ocorrencia."
      );
    }
  }

  const formInitialData = selectedOccurrence
    ? formFromOccurrence(selectedOccurrence)
    : emptyForm;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-main">
              Ocorrencias
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Registre ocorrencias durante viagens e destaque casos de alta
              severidade para a administracao.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            Nova ocorrencia
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por viagem, motorista, veiculo ou descricao"
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(
                event.target.value as SeveridadeOcorrencia | "todas"
              )
            }
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="todas">Todas as severidades</option>
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {highSeverity.length > 0 && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="font-semibold text-red-900">
            Ocorrencias de alta severidade
          </h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {highSeverity.slice(0, 4).map((ocorrencia) => (
              <button
                key={ocorrencia.id}
                type="button"
                onClick={() => setDetailOccurrence(ocorrencia)}
                className="rounded-lg border border-red-200 bg-white/70 p-3 text-left text-sm text-red-900"
              >
                <strong>{getTypeLabel(ocorrencia.tipo)}</strong> -{" "}
                {ocorrencia.viagemDestino}
                <span className="mt-1 block">
                  {ocorrencia.motoristaNome} |{" "}
                  {formatDateTime(ocorrencia.dataOcorrencia)}
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
        <OccurrenceForm
          initialData={formInitialData}
          mode={formMode}
          saving={saving}
          viagens={viagens}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      {detailOccurrence && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-main">
                Detalhes da ocorrencia
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {detailOccurrence.viagemDestino}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDetailOccurrence(null)}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
            >
              Fechar
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className={severityStyles[detailOccurrence.severidade]}>
              {getSeverityLabel(detailOccurrence.severidade)}
            </Badge>
            <Badge className={statusStyles[detailOccurrence.status]}>
              {getStatusLabel(detailOccurrence.status)}
            </Badge>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Tipo", getTypeLabel(detailOccurrence.tipo)],
              ["Motorista", detailOccurrence.motoristaNome],
              [
                "Veiculo",
                `${detailOccurrence.veiculoDescricao} ${detailOccurrence.veiculoPlaca}`,
              ],
              ["Data", formatDateTime(detailOccurrence.dataOcorrencia)],
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
            {detailOccurrence.descricao}
          </p>
        </section>
      )}

      <section className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text-main">
            {filteredOccurrences.length} ocorrencia(s) encontrada(s)
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
            Carregando ocorrencias...
          </div>
        ) : filteredOccurrences.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-text-main">
              Nenhuma ocorrencia encontrada
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Ajuste os filtros ou registre a primeira ocorrencia.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-4">
            {filteredOccurrences.map((ocorrencia) => (
              <article
                key={ocorrencia.id}
                className={`rounded-lg border p-4 ${
                  ocorrencia.severidade === "alta"
                    ? "border-red-200 bg-red-50"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="font-semibold text-text-main">
                      {getTypeLabel(ocorrencia.tipo)} - {ocorrencia.viagemDestino}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {ocorrencia.motoristaNome} | {ocorrencia.veiculoDescricao}{" "}
                      {ocorrencia.veiculoPlaca}
                    </p>
                    <p className="mt-2 text-sm text-text-muted">
                      {formatDateTime(ocorrencia.dataOcorrencia)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={severityStyles[ocorrencia.severidade]}>
                      {getSeverityLabel(ocorrencia.severidade)}
                    </Badge>
                    <Badge className={statusStyles[ocorrencia.status]}>
                      {getStatusLabel(ocorrencia.status)}
                    </Badge>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-text-muted">
                  {ocorrencia.descricao}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailOccurrence(ocorrencia)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-white"
                  >
                    Detalhes
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditForm(ocorrencia)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary-800 transition hover:bg-primary-100"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(ocorrencia)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-white"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
