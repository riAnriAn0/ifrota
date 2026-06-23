import { isSupabaseConfigured, supabase } from "./supabase/client";
import type {
  Manutencao,
  ManutencaoFormData,
  StatusManutencao,
  TipoManutencao,
} from "../types/app";

type VeiculoNestedRow =
  | {
      id: string | null;
      marca: string | null;
      modelo: string | null;
      placa: string | null;
    }
  | null;

type ManutencaoRow = {
  id: string;
  veiculo_id: string | null;
  tipo: string | null;
  categoria: string | null;
  data: string | null;
  km_registro: number | null;
  custo: number | null;
  oficina: string | null;
  descricao: string | null;
  status: string | null;
  proxima_data_prevista: string | null;
  proximo_km_previsto: number | null;
  veiculos?: VeiculoNestedRow;
};

type ManutencaoPayload = {
  veiculo_id: string;
  tipo: TipoManutencao;
  categoria: string;
  data: string;
  km_registro: number;
  custo: number;
  oficina: string;
  descricao: string;
  status: StatusManutencao;
  proxima_data_prevista: string | null;
  proximo_km_previsto: number | null;
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase ainda nao foi configurado no arquivo .env.local.");
  }

  return supabase;
}

function normalizeTipo(tipo: string | null): TipoManutencao {
  return tipo === "preventiva" ? "preventiva" : "corretiva";
}

function normalizeStatus(status: string | null): StatusManutencao {
  if (
    status === "pendente" ||
    status === "em_andamento" ||
    status === "concluida" ||
    status === "cancelada"
  ) {
    return status;
  }

  return "pendente";
}

function mapRowToManutencao(row: ManutencaoRow): Manutencao {
  const veiculo = row.veiculos || null;
  const veiculoDescricao = [veiculo?.marca, veiculo?.modelo]
    .filter(Boolean)
    .join(" ");

  return {
    id: row.id,
    veiculoId: row.veiculo_id || "",
    veiculoDescricao: veiculoDescricao || "Veiculo nao informado",
    veiculoPlaca: veiculo?.placa || "",
    tipo: normalizeTipo(row.tipo),
    categoria: row.categoria || "",
    data: row.data || "",
    kmRegistro: row.km_registro || 0,
    custo: row.custo || 0,
    oficina: row.oficina || "",
    descricao: row.descricao || "",
    status: normalizeStatus(row.status),
    proximaDataPrevista: row.proxima_data_prevista || "",
    proximoKmPrevisto: row.proximo_km_previsto,
  };
}

function mapFormToPayload(data: ManutencaoFormData): ManutencaoPayload {
  return {
    veiculo_id: data.veiculoId,
    tipo: data.tipo,
    categoria: data.categoria.trim(),
    data: data.data,
    km_registro: data.kmRegistro,
    custo: data.custo,
    oficina: data.oficina.trim(),
    descricao: data.descricao.trim(),
    status: data.status,
    proxima_data_prevista:
      data.tipo === "preventiva" && data.proximaDataPrevista
        ? data.proximaDataPrevista
        : null,
    proximo_km_previsto:
      data.tipo === "preventiva" ? data.proximoKmPrevisto : null,
  };
}

const manutencaoSelect =
  "id, veiculo_id, tipo, categoria, data, km_registro, custo, oficina, descricao, status, proxima_data_prevista, proximo_km_previsto, veiculos:veiculo_id(id, marca, modelo, placa)";

export async function listarManutencoes(): Promise<Manutencao[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("manutencoes")
    .select(manutencaoSelect)
    .order("data", { ascending: false })
    .returns<ManutencaoRow[]>();

  if (error) throw error;

  return (data || []).map(mapRowToManutencao);
}

export async function criarManutencao(
  data: ManutencaoFormData
): Promise<Manutencao> {
  const client = ensureSupabase();

  const { data: created, error } = await client
    .from("manutencoes")
    .insert(mapFormToPayload(data))
    .select(manutencaoSelect)
    .single<ManutencaoRow>();

  if (error) throw error;

  return mapRowToManutencao(created);
}

export async function atualizarManutencao(
  id: string,
  data: ManutencaoFormData
): Promise<Manutencao> {
  const client = ensureSupabase();

  const { data: updated, error } = await client
    .from("manutencoes")
    .update(mapFormToPayload(data))
    .eq("id", id)
    .select(manutencaoSelect)
    .single<ManutencaoRow>();

  if (error) throw error;

  return mapRowToManutencao(updated);
}

export async function excluirManutencao(id: string): Promise<void> {
  const client = ensureSupabase();

  const { error } = await client.from("manutencoes").delete().eq("id", id);

  if (error) throw error;
}
