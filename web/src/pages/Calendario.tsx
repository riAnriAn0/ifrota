import { useEffect, useMemo, useState } from "react";
import { listarViagens } from "../services/viagensService";
import type { StatusViagem, Viagem } from "../types/app";
import { viagensComConflitoHorario } from "../utils/viagens";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const statusLabels: Record<StatusViagem, string> = {
  agendada: "Agendada",
  em_andamento: "Em andamento",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const statusClasses: Record<StatusViagem, string> = {
  agendada: "border-blue-200 bg-blue-50 text-blue-800",
  em_andamento: "border-green-200 bg-green-50 text-green-800",
  finalizada: "border-slate-200 bg-slate-100 text-slate-700",
  cancelada: "border-red-200 bg-red-50 text-red-800",
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseTripDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value: string) {
  const date = parseTripDate(value);
  if (!date) return "--:--";

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value: string) {
  const date = parseTripDate(value);
  if (!date) return "Nao informado";

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function buildCalendarDays(currentMonth: Date) {
  const firstDay = startOfMonth(currentMonth);
  const lastDay = endOfMonth(currentMonth);
  const firstCalendarDay = new Date(firstDay);
  firstCalendarDay.setDate(firstDay.getDate() - firstDay.getDay());

  const lastCalendarDay = new Date(lastDay);
  lastCalendarDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const days: Date[] = [];
  const cursor = new Date(firstCalendarDay);

  while (cursor <= lastCalendarDay) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function StatusBadge({ status }: { status: StatusViagem }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function TripButton({
  viagem,
  hasConflict,
  onClick,
}: {
  viagem: Viagem;
  hasConflict: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-md border px-2 py-1.5 text-left text-xs transition hover:shadow-sm ${
        hasConflict
          ? "border-red-300 bg-red-50 text-red-900"
          : statusClasses[viagem.status]
      }`}
    >
      <span className="block font-semibold">
        {formatTime(viagem.dataSaidaPrevista)} {viagem.destino}
      </span>
      <span className="mt-0.5 block truncate opacity-80">
        {viagem.veiculoPlaca || viagem.veiculoDescricao}
      </span>
      {hasConflict && (
        <span className="mt-1 block font-semibold">Conflito de agenda</span>
      )}
    </button>
  );
}

export default function Calendario() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Viagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrips() {
    setLoading(true);
    setError("");

    try {
      const data = await listarViagens();
      setViagens(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar o calendario."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTrips();
  }, []);

  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const conflictIds = useMemo(() => viagensComConflitoHorario(viagens), [viagens]);

  const tripsByDate = useMemo(() => {
    const grouped = new Map<string, Viagem[]>();

    viagens.forEach((viagem) => {
      const date = parseTripDate(viagem.dataSaidaPrevista);
      if (!date) return;

      const key = dateKey(date);
      const current = grouped.get(key) || [];
      current.push(viagem);
      grouped.set(
        key,
        current.sort(
          (a, b) =>
            new Date(a.dataSaidaPrevista).getTime() -
            new Date(b.dataSaidaPrevista).getTime()
        )
      );
    });

    return grouped;
  }, [viagens]);

  const monthTrips = useMemo(() => {
    return viagens
      .filter((viagem) => {
        const date = parseTripDate(viagem.dataSaidaPrevista);
        return (
          date &&
          date.getFullYear() === currentMonth.getFullYear() &&
          date.getMonth() === currentMonth.getMonth()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dataSaidaPrevista).getTime() -
          new Date(b.dataSaidaPrevista).getTime()
      );
  }, [currentMonth, viagens]);

  function changeMonth(delta: number) {
    setCurrentMonth(
      (month) => new Date(month.getFullYear(), month.getMonth() + delta, 1)
    );
  }

  const monthLabel = currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-main">
              Calendario de viagens
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Visualize viagens por data, status e conflitos de agenda do mesmo
              veiculo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date())}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary-800 transition hover:bg-primary-100"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
            >
              Proximo
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold capitalize text-text-main">
            {monthLabel}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusLabels).map(([status, label]) => (
              <span
                key={status}
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  statusClasses[status as StatusViagem]
                }`}
              >
                {label}
              </span>
            ))}
            <span className="rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-900">
              Conflito
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {selectedTrip && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-main">
                Detalhes da viagem
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {selectedTrip.origem} para {selectedTrip.destino}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTrip(null)}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
            >
              Fechar
            </button>
          </div>

          <div className="mt-4">
            <StatusBadge status={selectedTrip.status} />
            {conflictIds.has(selectedTrip.id) && (
              <span className="ml-2 inline-flex rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-900">
                Conflito de agenda
              </span>
            )}
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Motorista", selectedTrip.motoristaNome],
              [
                "Veiculo",
                `${selectedTrip.veiculoDescricao} ${selectedTrip.veiculoPlaca}`,
              ],
              ["Saida", formatDateTime(selectedTrip.dataSaidaPrevista)],
              ["Chegada", formatDateTime(selectedTrip.dataChegadaPrevista)],
              ["Passageiros", String(selectedTrip.numPassageiros)],
              [
                "KM inicial",
                selectedTrip.kmInicial?.toLocaleString("pt-BR") ||
                  "Nao informado",
              ],
              [
                "KM final",
                selectedTrip.kmFinal?.toLocaleString("pt-BR") ||
                  "Nao informado",
              ],
              ["Status", statusLabels[selectedTrip.status]],
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

          {selectedTrip.observacoes && (
            <p className="mt-5 rounded-lg border border-border bg-background p-3 text-sm leading-6 text-text-muted">
              {selectedTrip.observacoes}
            </p>
          )}
        </section>
      )}

      <section className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text-main">
            {monthTrips.length} viagem(ns) neste mes
          </p>
          <button
            type="button"
            onClick={() => void loadTrips()}
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-background"
          >
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-text-muted">
            Carregando calendario...
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden lg:block">
              <div className="grid grid-cols-7 border-b border-border bg-background">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const key = dateKey(day);
                  const trips = tripsByDate.get(key) || [];
                  const isCurrentMonth =
                    day.getMonth() === currentMonth.getMonth();
                  const isToday = key === dateKey(new Date());

                  return (
                    <div
                      key={key}
                      className={`min-h-36 border-b border-r border-border p-2 ${
                        isCurrentMonth ? "bg-surface" : "bg-background/70"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            isToday
                              ? "bg-primary-700 text-white"
                              : isCurrentMonth
                                ? "text-text-main"
                                : "text-text-muted"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {trips.some((trip) => conflictIds.has(trip.id)) && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                            conflito
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {trips.slice(0, 3).map((viagem) => (
                          <TripButton
                            key={viagem.id}
                            viagem={viagem}
                            hasConflict={conflictIds.has(viagem.id)}
                            onClick={() => setSelectedTrip(viagem)}
                          />
                        ))}
                        {trips.length > 3 && (
                          <p className="text-xs font-semibold text-text-muted">
                            +{trips.length - 3} viagem(ns)
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {monthTrips.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <h3 className="font-semibold text-text-main">
                    Nenhuma viagem neste mes
                  </h3>
                  <p className="mt-2 text-sm text-text-muted">
                    Use o modulo de viagens para criar novos agendamentos.
                  </p>
                </div>
              ) : (
                monthTrips.map((viagem) => (
                  <button
                    key={viagem.id}
                    type="button"
                    onClick={() => setSelectedTrip(viagem)}
                    className={`rounded-lg border p-4 text-left shadow-sm ${
                      conflictIds.has(viagem.id)
                        ? "border-red-300 bg-red-50"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text-main">
                          {viagem.destino}
                        </p>
                        <p className="mt-1 text-sm text-text-muted">
                          {formatDateTime(viagem.dataSaidaPrevista)}
                        </p>
                      </div>
                      <StatusBadge status={viagem.status} />
                    </div>
                    <p className="mt-3 text-sm text-text-muted">
                      {viagem.veiculoDescricao} {viagem.veiculoPlaca}
                    </p>
                    {conflictIds.has(viagem.id) && (
                      <p className="mt-3 text-sm font-semibold text-red-800">
                        Conflito de agenda do veiculo
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
