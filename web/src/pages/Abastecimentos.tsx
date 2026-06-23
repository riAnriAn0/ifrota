import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  atualizarAbastecimento,
  criarAbastecimento,
  listarAbastecimentos,
} from "../services/abastecimentosService";
import { listarMotoristas } from "../services/motoristasService";
import { listarVeiculos } from "../services/veiculosService";
import type {
  Abastecimento,
  AbastecimentoFormData,
  Motorista,
  TipoCombustivel,
  Veiculo,
} from "../types/app";

const fuelOptions: Array<{ value: TipoCombustivel; label: string }> = [
  { value: "gasolina", label: "Gasolina" },
  { value: "etanol", label: "Etanol" },
  { value: "diesel", label: "Diesel" },
  { value: "diesel_s10", label: "Diesel S10" },
  { value: "flex", label: "Flex" },
  { value: "outro", label: "Outro" },
];

const emptyForm: AbastecimentoFormData = {
  veiculoId: "",
  motoristaId: "",
  litros: 0,
  valorTotal: 0,
  tipoCombustivel: "diesel",
  data: "",
  kmRegistro: 0,
  posto: "",
  cidade: "",
  observacoes: "",
};

function getFuelLabel(type: TipoCombustivel) {
  return fuelOptions.find((option) => option.value === type)?.label || type;
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

function formFromAbastecimento(
  abastecimento: Abastecimento
): AbastecimentoFormData {
  return {
    veiculoId: abastecimento.veiculoId,
    motoristaId: abastecimento.motoristaId,
    litros: abastecimento.litros,
    valorTotal: abastecimento.valorTotal,
    tipoCombustivel: abastecimento.tipoCombustivel,
    data: abastecimento.data,
    kmRegistro: abastecimento.kmRegistro,
    posto: abastecimento.posto,
    cidade: abastecimento.cidade,
    observacoes: abastecimento.observacoes,
  };
}

function validateFueling(data: AbastecimentoFormData) {
  const errors: string[] = [];

  if (!data.veiculoId) errors.push("Selecione o veiculo.");
  if (!data.motoristaId) errors.push("Selecione o motorista.");
  if (data.litros <= 0) errors.push("Informe litros maior que zero.");
  if (data.valorTotal <= 0) errors.push("Informe valor total maior que zero.");
  if (!data.tipoCombustivel) errors.push("Selecione o tipo de combustivel.");
  if (!data.data) errors.push("Informe a data do abastecimento.");
  if (data.kmRegistro < 0) errors.push("O km de registro nao pode ser negativo.");
  if (!data.posto.trim()) errors.push("Informe o posto.");
  if (!data.cidade.trim()) errors.push("Informe a cidade.");

  return errors;
}

type FuelingFormProps = {
  initialData: AbastecimentoFormData;
  mode: "create" | "edit";
  saving: boolean;
  veiculos: Veiculo[];
  motoristas: Motorista[];
  onCancel: () => void;
  onSubmit: (data: AbastecimentoFormData) => Promise<void>;
};

function FuelingForm({
  initialData,
  mode,
  saving,
  veiculos,
  motoristas,
  onCancel,
  onSubmit,
}: FuelingFormProps) {
  const [form, setForm] = useState<AbastecimentoFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setForm(initialData);
    setValidationErrors([]);
  }, [initialData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateFueling(form);

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
            {mode === "create" ? "Cadastrar abastecimento" : "Editar abastecimento"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Registre combustivel, valor, quilometragem, posto e cidade.
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
          Litros
          <input
            type="number"
            step="0.001"
            value={form.litros}
            onChange={(event) =>
              setForm({ ...form, litros: Number(event.target.value) })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Valor total
          <input
            type="number"
            step="0.01"
            value={form.valorTotal}
            onChange={(event) =>
              setForm({ ...form, valorTotal: Number(event.target.value) })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Tipo de combustivel
          <select
            value={form.tipoCombustivel}
            onChange={(event) =>
              setForm({
                ...form,
                tipoCombustivel: event.target.value as TipoCombustivel,
              })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            {fuelOptions.map((option) => (
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
          Posto
          <input
            value={form.posto}
            onChange={(event) => setForm({ ...form, posto: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Nome do posto"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Cidade
          <input
            value={form.cidade}
            onChange={(event) => setForm({ ...form, cidade: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="Cidade"
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
            {saving ? "Salvando..." : "Salvar abastecimento"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Abastecimentos() {
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("todos");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedFueling, setSelectedFueling] = useState<Abastecimento | null>(
    null
  );
  const [detailFueling, setDetailFueling] = useState<Abastecimento | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [fuelingData, vehicleData, driverData] = await Promise.all([
        listarAbastecimentos(),
        listarVeiculos(),
        listarMotoristas(),
      ]);
      setAbastecimentos(fuelingData);
      setVeiculos(vehicleData);
      setMotoristas(driverData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar os abastecimentos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredFuelings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return abastecimentos.filter((abastecimento) => {
      const matchesVehicle =
        vehicleFilter === "todos" || abastecimento.veiculoId === vehicleFilter;
      const matchesSearch =
        !term ||
        abastecimento.veiculoDescricao.toLowerCase().includes(term) ||
        abastecimento.veiculoPlaca.toLowerCase().includes(term) ||
        abastecimento.motoristaNome.toLowerCase().includes(term) ||
        abastecimento.posto.toLowerCase().includes(term) ||
        abastecimento.cidade.toLowerCase().includes(term);

      return matchesVehicle && matchesSearch;
    });
  }, [abastecimentos, search, vehicleFilter]);

  const totalCost = filteredFuelings.reduce(
    (sum, abastecimento) => sum + abastecimento.valorTotal,
    0
  );

  const totalLiters = filteredFuelings.reduce(
    (sum, abastecimento) => sum + abastecimento.litros,
    0
  );

  const historyByVehicle = useMemo(() => {
    return veiculos
      .map((veiculo) => {
        const vehicleFuelings = abastecimentos.filter(
          (abastecimento) => abastecimento.veiculoId === veiculo.id
        );
        const cost = vehicleFuelings.reduce(
          (sum, abastecimento) => sum + abastecimento.valorTotal,
          0
        );

        return {
          veiculo,
          count: vehicleFuelings.length,
          cost,
          liters: vehicleFuelings.reduce(
            (sum, abastecimento) => sum + abastecimento.litros,
            0
          ),
        };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.cost - a.cost);
  }, [abastecimentos, veiculos]);

  function openCreateForm() {
    setSelectedFueling(null);
    setDetailFueling(null);
    setFormMode("create");
    setError("");
    setSuccess("");
  }

  function openEditForm(abastecimento: Abastecimento) {
    setSelectedFueling(abastecimento);
    setDetailFueling(null);
    setFormMode("edit");
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setSelectedFueling(null);
    setFormMode(null);
  }

  async function handleSubmit(data: AbastecimentoFormData) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (formMode === "edit" && selectedFueling) {
        const updated = await atualizarAbastecimento(selectedFueling.id, data);
        setAbastecimentos((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
        setSuccess("Abastecimento atualizado com sucesso.");
      } else {
        const created = await criarAbastecimento(data);
        setAbastecimentos((current) => [created, ...current]);
        setSuccess("Abastecimento cadastrado com sucesso.");
      }

      closeForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar o abastecimento."
      );
    } finally {
      setSaving(false);
    }
  }

  const formInitialData = selectedFueling
    ? formFromAbastecimento(selectedFueling)
    : emptyForm;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-main">
              Abastecimentos
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Controle separado de combustivel, custos, quilometragem, posto e
              cidade.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            Novo abastecimento
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Registros filtrados
            </p>
            <p className="mt-2 text-2xl font-semibold text-text-main">
              {filteredFuelings.length}
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-semibold uppercase text-blue-800">
              Litros
            </p>
            <p className="mt-2 text-2xl font-semibold text-blue-900">
              {totalLiters.toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase text-amber-800">
              Custo total
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-900">
              {formatCurrency(totalCost)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_260px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por veiculo, placa, motorista, posto ou cidade"
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
          <select
            value={vehicleFilter}
            onChange={(event) => setVehicleFilter(event.target.value)}
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="todos">Todos os veiculos</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
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
        <FuelingForm
          initialData={formInitialData}
          mode={formMode}
          saving={saving}
          veiculos={veiculos}
          motoristas={motoristas}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      {detailFueling && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-main">
                Detalhes do abastecimento
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {detailFueling.veiculoDescricao} {detailFueling.veiculoPlaca}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDetailFueling(null)}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
            >
              Fechar
            </button>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Motorista", detailFueling.motoristaNome],
              ["Data", formatDate(detailFueling.data)],
              ["Combustivel", getFuelLabel(detailFueling.tipoCombustivel)],
              [
                "Litros",
                detailFueling.litros.toLocaleString("pt-BR", {
                  maximumFractionDigits: 3,
                }),
              ],
              ["Valor total", formatCurrency(detailFueling.valorTotal)],
              [
                "Custo por litro",
                detailFueling.litros > 0
                  ? formatCurrency(detailFueling.valorTotal / detailFueling.litros)
                  : "Nao calculado",
              ],
              [
                "KM registro",
                `${detailFueling.kmRegistro.toLocaleString("pt-BR")} km`,
              ],
              ["Local", `${detailFueling.posto} - ${detailFueling.cidade}`],
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

          {detailFueling.observacoes && (
            <p className="mt-5 rounded-lg border border-border bg-background p-3 text-sm leading-6 text-text-muted">
              {detailFueling.observacoes}
            </p>
          )}
        </section>
      )}

      {historyByVehicle.length > 0 && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-text-main">
            Historico por veiculo
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {historyByVehicle.slice(0, 6).map((item) => (
              <button
                key={item.veiculo.id}
                type="button"
                onClick={() => setVehicleFilter(item.veiculo.id)}
                className="rounded-lg border border-border bg-background p-4 text-left transition hover:border-primary-600 hover:bg-primary-100"
              >
                <p className="font-semibold text-text-main">
                  {item.veiculo.marca} {item.veiculo.modelo}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  {item.veiculo.placa} | {item.count} registro(s)
                </p>
                <p className="mt-3 text-sm font-semibold text-primary-900">
                  {formatCurrency(item.cost)} |{" "}
                  {item.liters.toLocaleString("pt-BR", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  L
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text-main">
            {filteredFuelings.length} abastecimento(s) encontrado(s)
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
            Carregando abastecimentos...
          </div>
        ) : filteredFuelings.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-text-main">
              Nenhum abastecimento encontrado
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Ajuste os filtros ou cadastre o primeiro abastecimento.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-background text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Veiculo</th>
                    <th className="px-4 py-3 font-semibold">Motorista</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Combustivel</th>
                    <th className="px-4 py-3 font-semibold">Litros</th>
                    <th className="px-4 py-3 font-semibold">Valor</th>
                    <th className="px-4 py-3 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFuelings.map((abastecimento) => (
                    <tr key={abastecimento.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-text-main">
                          {abastecimento.veiculoDescricao}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {abastecimento.veiculoPlaca || "Sem placa"} |{" "}
                          {abastecimento.kmRegistro.toLocaleString("pt-BR")} km
                        </p>
                      </td>
                      <td className="px-4 py-4 text-text-muted">
                        {abastecimento.motoristaNome}
                      </td>
                      <td className="px-4 py-4 text-text-muted">
                        {formatDate(abastecimento.data)}
                      </td>
                      <td className="px-4 py-4 text-text-muted">
                        {getFuelLabel(abastecimento.tipoCombustivel)}
                      </td>
                      <td className="px-4 py-4 text-text-muted">
                        {abastecimento.litros.toLocaleString("pt-BR", {
                          maximumFractionDigits: 3,
                        })}{" "}
                        L
                      </td>
                      <td className="px-4 py-4 font-semibold text-text-main">
                        {formatCurrency(abastecimento.valorTotal)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailFueling(abastecimento)}
                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-background"
                          >
                            Detalhes
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(abastecimento)}
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
              {filteredFuelings.map((abastecimento) => (
                <article
                  key={abastecimento.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-text-main">
                        {abastecimento.veiculoDescricao}
                      </h3>
                      <p className="mt-1 text-sm text-text-muted">
                        {abastecimento.veiculoPlaca} |{" "}
                        {formatDate(abastecimento.data)}
                      </p>
                    </div>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                      {getFuelLabel(abastecimento.tipoCombustivel)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-text-muted">Litros</p>
                      <p className="font-semibold text-text-main">
                        {abastecimento.litros.toLocaleString("pt-BR", {
                          maximumFractionDigits: 3,
                        })}{" "}
                        L
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted">Valor</p>
                      <p className="font-semibold text-text-main">
                        {formatCurrency(abastecimento.valorTotal)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-text-muted">Motorista</p>
                      <p className="font-semibold text-text-main">
                        {abastecimento.motoristaNome}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailFueling(abastecimento)}
                      className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-white"
                    >
                      Detalhes
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(abastecimento)}
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
