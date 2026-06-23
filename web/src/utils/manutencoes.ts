import type { Manutencao, Veiculo } from "../types/app";

export type AlertaManutencao = "vencida" | "proxima" | "regular" | "nao_aplicavel";

const oneDayMs = 1000 * 60 * 60 * 24;

export function getAlertaPreventiva(
  manutencao: Manutencao,
  veiculos: Veiculo[]
): AlertaManutencao {
  if (manutencao.tipo !== "preventiva") return "nao_aplicavel";

  const veiculo = veiculos.find((item) => item.id === manutencao.veiculoId);
  const alertas: AlertaManutencao[] = [];

  if (manutencao.proximaDataPrevista) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDate = new Date(`${manutencao.proximaDataPrevista}T00:00:00`);
    if (!Number.isNaN(nextDate.getTime())) {
      const days = Math.ceil((nextDate.getTime() - today.getTime()) / oneDayMs);
      if (days < 0) alertas.push("vencida");
      else if (days <= 30) alertas.push("proxima");
    }
  }

  if (manutencao.proximoKmPrevisto !== null && veiculo) {
    const kmRestante = manutencao.proximoKmPrevisto - veiculo.kmAtual;
    if (kmRestante < 0) alertas.push("vencida");
    else if (kmRestante <= 1000) alertas.push("proxima");
  }

  if (alertas.includes("vencida")) return "vencida";
  if (alertas.includes("proxima")) return "proxima";

  return "regular";
}

export function manutencoesPreventivasProximas(
  manutencoes: Manutencao[],
  veiculos: Veiculo[]
) {
  return manutencoes.filter((manutencao) => {
    const alerta = getAlertaPreventiva(manutencao, veiculos);
    return alerta === "vencida" || alerta === "proxima";
  });
}
