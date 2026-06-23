import type { Motorista } from "../types/app";

export type SituacaoCnh = "regular" | "proxima" | "vencida" | "sem_data";

const oneDayMs = 1000 * 60 * 60 * 24;

export function getSituacaoCnh(validadeCnh: string): SituacaoCnh {
  if (!validadeCnh) return "sem_data";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiration = new Date(`${validadeCnh}T00:00:00`);
  if (Number.isNaN(expiration.getTime())) return "sem_data";

  const daysToExpire = Math.ceil(
    (expiration.getTime() - today.getTime()) / oneDayMs
  );

  if (daysToExpire < 0) return "vencida";
  if (daysToExpire <= 30) return "proxima";

  return "regular";
}

export function motoristaPodeIniciarViagem(motorista: Motorista) {
  return motorista.status === "ativo" && getSituacaoCnh(motorista.validadeCnh) !== "vencida";
}
