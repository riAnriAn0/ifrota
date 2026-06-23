import { isSupabaseConfigured, supabase } from "./supabase/client";
import type { StatusViagem, Viagem, ViagemFormData } from "../types/app";

type MotoristaNestedRow =
  | {
      id: string | null;
      nome: string | null;
    }
  | null;

type VeiculoNestedRow =
  | {
      id: string | null;
      marca: string | null;
      modelo: string | null;
      placa: string | null;
    }
  | null;

type ViagemRow = {
  id: string;
  motorista_id: string | null;
  veiculo_id: string | null;
  origem: string | null;
  destino: string | null;
  num_passageiros: number | null;
  data_saida_prevista: string | null;
  data_chegada_prevista: string | null;
  km_inicial: number | null;
  km_final: number | null;
  status: string | null;
  observacoes: string | null;
  motoristas?: MotoristaNestedRow;
  veiculos?: VeiculoNestedRow;
};

type ViagemPayload = {
  motorista_id: string;
  veiculo_id: string;
  origem: string;
  destino: string;
  num_passageiros: number;
  data_saida_prevista: string;
  data_chegada_prevista: string;
  km_inicial: number | null;
  km_final: number | null;
  status: StatusViagem;
  observacoes: string;
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase ainda nao foi configurado no arquivo .env.local.");
  }

  return supabase;
}

function normalizeStatus(status: string | null): StatusViagem {
  if (
    status === "agendada" ||
    status === "em_andamento" ||
    status === "finalizada" ||
    status === "cancelada"
  ) {
    return status;
  }

  return "agendada";
}

function mapRowToViagem(row: ViagemRow): Viagem {
  const veiculo = row.veiculos || null;
  const motorista = row.motoristas || null;
  const veiculoDescricao = [veiculo?.marca, veiculo?.modelo]
    .filter(Boolean)
    .join(" ");

  return {
    id: row.id,
    motoristaId: row.motorista_id || "",
    motoristaNome: motorista?.nome || "Motorista nao informado",
    veiculoId: row.veiculo_id || "",
    veiculoDescricao: veiculoDescricao || "Veiculo nao informado",
    veiculoPlaca: veiculo?.placa || "",
    origem: row.origem || "IFMA Campus Caxias",
    destino: row.destino || "",
    numPassageiros: row.num_passageiros || 0,
    dataSaidaPrevista: row.data_saida_prevista || "",
    dataChegadaPrevista: row.data_chegada_prevista || "",
    kmInicial: row.km_inicial,
    kmFinal: row.km_final,
    status: normalizeStatus(row.status),
    observacoes: row.observacoes || "",
  };
}

function mapFormToPayload(data: ViagemFormData): ViagemPayload {
  return {
    motorista_id: data.motoristaId,
    veiculo_id: data.veiculoId,
    origem: data.origem.trim(),
    destino: data.destino.trim(),
    num_passageiros: data.numPassageiros,
    data_saida_prevista: data.dataSaidaPrevista,
    data_chegada_prevista: data.dataChegadaPrevista,
    km_inicial: data.kmInicial,
    km_final: data.kmFinal,
    status: data.status,
    observacoes: data.observacoes.trim(),
  };
}

const viagemSelect =
  "id, motorista_id, veiculo_id, origem, destino, num_passageiros, data_saida_prevista, data_chegada_prevista, km_inicial, km_final, status, observacoes, motoristas:motorista_id(id, nome), veiculos:veiculo_id(id, marca, modelo, placa)";

export async function listarViagens(): Promise<Viagem[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("viagens")
    .select(viagemSelect)
    .order("data_saida_prevista", { ascending: false })
    .returns<ViagemRow[]>();

  if (error) throw error;

  return (data || []).map(mapRowToViagem);
}

export async function criarViagem(data: ViagemFormData): Promise<Viagem> {
  const client = ensureSupabase();
  const payload = mapFormToPayload(data);

  const { data: created, error } = await client
    .from("viagens")
    .insert(payload)
    .select(viagemSelect)
    .single<ViagemRow>();

  if (error) throw error;

  return mapRowToViagem(created);
}

export async function atualizarViagem(
  id: string,
  data: ViagemFormData
): Promise<Viagem> {
  const client = ensureSupabase();
  const payload = mapFormToPayload(data);

  const { data: updated, error } = await client
    .from("viagens")
    .update(payload)
    .eq("id", id)
    .select(viagemSelect)
    .single<ViagemRow>();

  if (error) throw error;

  return mapRowToViagem(updated);
}

export async function excluirViagem(id: string): Promise<void> {
  const client = ensureSupabase();

  const { error } = await client.from("viagens").delete().eq("id", id);

  if (error) throw error;
}
