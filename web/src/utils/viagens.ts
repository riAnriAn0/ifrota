import type { Viagem, ViagemFormData } from "../types/app";

export const origemPadraoViagem = "IFMA Campus Caxias";

function toTime(value: string) {
  const date = new Date(value);
  return date.getTime();
}

export function viagemTemConflitoHorario(
  data: ViagemFormData,
  viagens: Viagem[],
  ignoreId?: string
) {
  const inicio = toTime(data.dataSaidaPrevista);
  const fim = toTime(data.dataChegadaPrevista);

  if (!data.veiculoId || Number.isNaN(inicio) || Number.isNaN(fim)) {
    return false;
  }

  return viagens.some((viagem) => {
    if (viagem.id === ignoreId) return false;
    if (viagem.veiculoId !== data.veiculoId) return false;
    if (viagem.status === "cancelada" || viagem.status === "finalizada") {
      return false;
    }

    const viagemInicio = toTime(viagem.dataSaidaPrevista);
    const viagemFim = toTime(viagem.dataChegadaPrevista);

    if (Number.isNaN(viagemInicio) || Number.isNaN(viagemFim)) return false;

    return inicio < viagemFim && fim > viagemInicio;
  });
}

export function viagensComConflitoHorario(viagens: Viagem[]) {
  const conflictIds = new Set<string>();

  viagens.forEach((viagem) => {
    if (viagem.status === "cancelada" || viagem.status === "finalizada") return;

    const formData: ViagemFormData = {
      motoristaId: viagem.motoristaId,
      veiculoId: viagem.veiculoId,
      origem: viagem.origem,
      destino: viagem.destino,
      numPassageiros: viagem.numPassageiros,
      dataSaidaPrevista: viagem.dataSaidaPrevista,
      dataChegadaPrevista: viagem.dataChegadaPrevista,
      kmInicial: viagem.kmInicial,
      kmFinal: viagem.kmFinal,
      status: viagem.status,
      observacoes: viagem.observacoes,
    };

    if (viagemTemConflitoHorario(formData, viagens, viagem.id)) {
      conflictIds.add(viagem.id);
    }
  });

  return conflictIds;
}

export function validarViagem(
  data: ViagemFormData,
  viagens: Viagem[],
  ignoreId?: string
) {
  const errors: string[] = [];

  if (!data.motoristaId) errors.push("Selecione o motorista.");
  if (!data.veiculoId) errors.push("Selecione o veiculo.");
  if (!data.origem.trim()) errors.push("Informe a origem.");
  if (!data.destino.trim()) errors.push("Informe o destino.");
  if (data.numPassageiros < 1) {
    errors.push("O numero de passageiros deve ser maior que zero.");
  }
  if (!data.dataSaidaPrevista) errors.push("Informe a saida prevista.");
  if (!data.dataChegadaPrevista) errors.push("Informe a chegada prevista.");

  const saida = toTime(data.dataSaidaPrevista);
  const chegada = toTime(data.dataChegadaPrevista);

  if (!Number.isNaN(saida) && !Number.isNaN(chegada) && chegada <= saida) {
    errors.push("A chegada prevista deve ser posterior a saida prevista.");
  }

  if (data.kmInicial !== null && data.kmInicial < 0) {
    errors.push("A quilometragem inicial nao pode ser negativa.");
  }

  if (data.kmFinal !== null && data.kmFinal < 0) {
    errors.push("A quilometragem final nao pode ser negativa.");
  }

  if (
    data.kmInicial !== null &&
    data.kmFinal !== null &&
    data.kmFinal < data.kmInicial
  ) {
    errors.push("A quilometragem final nao pode ser menor que a inicial.");
  }

  if (data.status === "em_andamento" && data.kmInicial === null) {
    errors.push("Informe a quilometragem inicial para iniciar a viagem.");
  }

  if (data.status === "finalizada" && data.kmFinal === null) {
    errors.push("Informe a quilometragem final para finalizar a viagem.");
  }

  if (viagemTemConflitoHorario(data, viagens, ignoreId)) {
    errors.push("Ja existe viagem agendada ou em andamento para este veiculo nesse horario.");
  }

  return errors;
}
