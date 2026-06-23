import { isSupabaseConfigured, supabase } from "./supabase/client";
import type {
  Abastecimento,
  AbastecimentoFormData,
  TipoCombustivel,
} from "../types/app";

type VeiculoNestedRow =
  | {
      id: string | null;
      marca: string | null;
      modelo: string | null;
      placa: string | null;
    }
  | null;

type MotoristaNestedRow =
  | {
      id: string | null;
      nome: string | null;
    }
  | null;

type AbastecimentoRow = {
  id: string;
  veiculo_id: string | null;
  motorista_id: string | null;
  litros: number | null;
  valor_total: number | null;
  tipo_combustivel: string | null;
  data: string | null;
  km_registro: number | null;
  posto: string | null;
  cidade: string | null;
  observacoes: string | null;
  veiculos?: VeiculoNestedRow;
  motoristas?: MotoristaNestedRow;
};

type AbastecimentoPayload = {
  veiculo_id: string;
  motorista_id: string;
  litros: number;
  valor_total: number;
  tipo_combustivel: TipoCombustivel;
  data: string;
  km_registro: number;
  posto: string;
  cidade: string;
  observacoes: string;
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase ainda nao foi configurado no arquivo .env.local.");
  }

  return supabase;
}

function normalizeFuelType(value: string | null): TipoCombustivel {
  if (
    value === "gasolina" ||
    value === "etanol" ||
    value === "diesel" ||
    value === "diesel_s10" ||
    value === "flex" ||
    value === "outro"
  ) {
    return value;
  }

  return "diesel";
}

function mapRowToAbastecimento(row: AbastecimentoRow): Abastecimento {
  const veiculo = row.veiculos || null;
  const motorista = row.motoristas || null;
  const veiculoDescricao = [veiculo?.marca, veiculo?.modelo]
    .filter(Boolean)
    .join(" ");

  return {
    id: row.id,
    veiculoId: row.veiculo_id || "",
    veiculoDescricao: veiculoDescricao || "Veiculo nao informado",
    veiculoPlaca: veiculo?.placa || "",
    motoristaId: row.motorista_id || "",
    motoristaNome: motorista?.nome || "Motorista nao informado",
    litros: row.litros || 0,
    valorTotal: row.valor_total || 0,
    tipoCombustivel: normalizeFuelType(row.tipo_combustivel),
    data: row.data || "",
    kmRegistro: row.km_registro || 0,
    posto: row.posto || "",
    cidade: row.cidade || "",
    observacoes: row.observacoes || "",
  };
}

function mapFormToPayload(data: AbastecimentoFormData): AbastecimentoPayload {
  return {
    veiculo_id: data.veiculoId,
    motorista_id: data.motoristaId,
    litros: data.litros,
    valor_total: data.valorTotal,
    tipo_combustivel: data.tipoCombustivel,
    data: data.data,
    km_registro: data.kmRegistro,
    posto: data.posto.trim(),
    cidade: data.cidade.trim(),
    observacoes: data.observacoes.trim(),
  };
}

const abastecimentoSelect =
  "id, veiculo_id, motorista_id, litros, valor_total, tipo_combustivel, data, km_registro, posto, cidade, observacoes, veiculos:veiculo_id(id, marca, modelo, placa), motoristas:motorista_id(id, nome)";

export async function listarAbastecimentos(): Promise<Abastecimento[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("abastecimentos")
    .select(abastecimentoSelect)
    .order("data", { ascending: false })
    .returns<AbastecimentoRow[]>();

  if (error) throw error;

  return (data || []).map(mapRowToAbastecimento);
}

export async function criarAbastecimento(
  data: AbastecimentoFormData
): Promise<Abastecimento> {
  const client = ensureSupabase();

  const { data: created, error } = await client
    .from("abastecimentos")
    .insert(mapFormToPayload(data))
    .select(abastecimentoSelect)
    .single<AbastecimentoRow>();

  if (error) throw error;

  return mapRowToAbastecimento(created);
}

export async function atualizarAbastecimento(
  id: string,
  data: AbastecimentoFormData
): Promise<Abastecimento> {
  const client = ensureSupabase();

  const { data: updated, error } = await client
    .from("abastecimentos")
    .update(mapFormToPayload(data))
    .eq("id", id)
    .select(abastecimentoSelect)
    .single<AbastecimentoRow>();

  if (error) throw error;

  return mapRowToAbastecimento(updated);
}

export async function excluirAbastecimento(id: string): Promise<void> {
  const client = ensureSupabase();

  const { error } = await client.from("abastecimentos").delete().eq("id", id);

  if (error) throw error;
}
