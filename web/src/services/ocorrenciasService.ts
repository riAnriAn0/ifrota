import { isSupabaseConfigured, supabase } from "./supabase/client";
import type {
  Ocorrencia,
  OcorrenciaFormData,
  SeveridadeOcorrencia,
  StatusOcorrencia,
  TipoOcorrencia,
} from "../types/app";

const attachmentsBucket = "anexos";

type ViagemNestedRow =
  | {
      id: string | null;
      destino: string | null;
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

type MotoristaNestedRow =
  | {
      id: string | null;
      nome: string | null;
    }
  | null;

type OcorrenciaRow = {
  id: string;
  viagem_id: string | null;
  veiculo_id: string | null;
  motorista_id: string | null;
  tipo: string | null;
  severidade: string | null;
  descricao: string | null;
  data_ocorrencia: string | null;
  status: string | null;
  viagens?: ViagemNestedRow;
  veiculos?: VeiculoNestedRow;
  motoristas?: MotoristaNestedRow;
};

type OcorrenciaPayload = {
  viagem_id: string;
  veiculo_id: string;
  motorista_id: string;
  tipo: TipoOcorrencia;
  severidade: SeveridadeOcorrencia;
  descricao: string;
  data_ocorrencia: string;
  status: StatusOcorrencia;
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase ainda nao foi configurado no arquivo .env.local.");
  }

  return supabase;
}

function normalizeType(type: string | null): TipoOcorrencia {
  if (
    type === "problema_mecanico" ||
    type === "atraso" ||
    type === "acidente" ||
    type === "desvio_rota" ||
    type === "pneu" ||
    type === "documentacao" ||
    type === "outro"
  ) {
    return type;
  }

  return "outro";
}

function normalizeSeverity(value: string | null): SeveridadeOcorrencia {
  if (value === "baixa" || value === "media" || value === "alta") {
    return value;
  }

  return "baixa";
}

function normalizeStatus(value: string | null): StatusOcorrencia {
  if (value === "aberta" || value === "em_analise" || value === "resolvida") {
    return value;
  }

  return "aberta";
}

function mapRowToOcorrencia(row: OcorrenciaRow): Ocorrencia {
  const veiculo = row.veiculos || null;
  const motorista = row.motoristas || null;
  const viagem = row.viagens || null;
  const veiculoDescricao = [veiculo?.marca, veiculo?.modelo]
    .filter(Boolean)
    .join(" ");

  return {
    id: row.id,
    viagemId: row.viagem_id || "",
    viagemDestino: viagem?.destino || "Viagem nao informada",
    veiculoId: row.veiculo_id || "",
    veiculoDescricao: veiculoDescricao || "Veiculo nao informado",
    veiculoPlaca: veiculo?.placa || "",
    motoristaId: row.motorista_id || "",
    motoristaNome: motorista?.nome || "Motorista nao informado",
    tipo: normalizeType(row.tipo),
    severidade: normalizeSeverity(row.severidade),
    descricao: row.descricao || "",
    dataOcorrencia: row.data_ocorrencia || "",
    status: normalizeStatus(row.status),
  };
}

function mapFormToPayload(data: OcorrenciaFormData): OcorrenciaPayload {
  return {
    viagem_id: data.viagemId,
    veiculo_id: data.veiculoId,
    motorista_id: data.motoristaId,
    tipo: data.tipo,
    severidade: data.severidade,
    descricao: data.descricao.trim(),
    data_ocorrencia: data.dataOcorrencia,
    status: data.status,
  };
}

const ocorrenciaSelect =
  "id, viagem_id, veiculo_id, motorista_id, tipo, severidade, descricao, data_ocorrencia, status, viagens:viagem_id(id, destino), veiculos:veiculo_id(id, marca, modelo, placa), motoristas:motorista_id(id, nome)";

export async function listarOcorrencias(): Promise<Ocorrencia[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("ocorrencias")
    .select(ocorrenciaSelect)
    .order("data_ocorrencia", { ascending: false })
    .returns<OcorrenciaRow[]>();

  if (error) throw error;

  return (data || []).map(mapRowToOcorrencia);
}

export async function criarOcorrencia(
  data: OcorrenciaFormData
): Promise<Ocorrencia> {
  const client = ensureSupabase();

  const { data: created, error } = await client
    .from("ocorrencias")
    .insert(mapFormToPayload(data))
    .select(ocorrenciaSelect)
    .single<OcorrenciaRow>();

  if (error) throw error;

  return mapRowToOcorrencia(created);
}

export async function atualizarOcorrencia(
  id: string,
  data: OcorrenciaFormData
): Promise<Ocorrencia> {
  const client = ensureSupabase();

  const { data: updated, error } = await client
    .from("ocorrencias")
    .update(mapFormToPayload(data))
    .eq("id", id)
    .select(ocorrenciaSelect)
    .single<OcorrenciaRow>();

  if (error) throw error;

  return mapRowToOcorrencia(updated);
}

export async function uploadOcorrenciaAnexo(
  ocorrenciaId: string,
  file: File
) {
  const client = ensureSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `ocorrencias/${ocorrenciaId}/${Date.now()}-${safeName}`;

  const { error } = await client.storage
    .from(attachmentsBucket)
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = client.storage.from(attachmentsBucket).getPublicUrl(path);
  return data.publicUrl;
}
