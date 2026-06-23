import { isSupabaseConfigured, supabase } from "./supabase/client";
import type {
  Motorista,
  MotoristaFormData,
  StatusMotorista,
  UsuarioOption,
} from "../types/app";

type UsuarioNestedRow =
  | {
      id: string | null;
      nome: string | null;
      email: string | null;
    }
  | null;

type MotoristaRow = {
  id: string;
  usuario_id: string | null;
  nome: string | null;
  contato: string | null;
  categoria_cnh: string | null;
  validade_cnh: string | null;
  status: string | null;
  observacoes: string | null;
  usuarios?: UsuarioNestedRow;
};

type UsuarioRow = {
  id: string;
  nome: string | null;
  email: string | null;
};

type MotoristaPayload = {
  usuario_id: string | null;
  nome: string;
  contato: string;
  categoria_cnh: string;
  validade_cnh: string;
  status: StatusMotorista;
  observacoes: string;
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase ainda nao foi configurado no arquivo .env.local.");
  }

  return supabase;
}

function normalizeStatus(status: string | null): StatusMotorista {
  if (status === "ativo" || status === "inativo" || status === "afastado") {
    return status;
  }

  return "ativo";
}

function mapRowToMotorista(row: MotoristaRow): Motorista {
  const usuario = row.usuarios || null;

  return {
    id: row.id,
    usuarioId: row.usuario_id || "",
    usuarioNome: usuario?.nome || "",
    usuarioEmail: usuario?.email || "",
    nome: row.nome || usuario?.nome || "",
    contato: row.contato || "",
    categoriaCnh: row.categoria_cnh || "",
    validadeCnh: row.validade_cnh || "",
    status: normalizeStatus(row.status),
    observacoes: row.observacoes || "",
  };
}

function mapFormToPayload(data: MotoristaFormData): MotoristaPayload {
  return {
    usuario_id: data.usuarioId || null,
    nome: data.nome.trim(),
    contato: data.contato.trim(),
    categoria_cnh: data.categoriaCnh.trim().toUpperCase(),
    validade_cnh: data.validadeCnh,
    status: data.status,
    observacoes: data.observacoes.trim(),
  };
}

export async function listarUsuariosParaMotoristas(): Promise<UsuarioOption[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("usuarios")
    .select("id, nome, email")
    .eq("ativo", true)
    .order("nome", { ascending: true })
    .returns<UsuarioRow[]>();

  if (error) throw error;

  return (data || []).map((usuario) => ({
    id: usuario.id,
    nome: usuario.nome || usuario.email || "Usuario",
    email: usuario.email || "",
  }));
}

export async function listarMotoristas(): Promise<Motorista[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("motoristas")
    .select(
      "id, usuario_id, nome, contato, categoria_cnh, validade_cnh, status, observacoes, usuarios:usuario_id(id, nome, email)"
    )
    .order("nome", { ascending: true })
    .returns<MotoristaRow[]>();

  if (error) throw error;

  return (data || []).map(mapRowToMotorista);
}

export async function criarMotorista(data: MotoristaFormData): Promise<Motorista> {
  const client = ensureSupabase();
  const payload = mapFormToPayload(data);

  const { data: created, error } = await client
    .from("motoristas")
    .insert(payload)
    .select(
      "id, usuario_id, nome, contato, categoria_cnh, validade_cnh, status, observacoes, usuarios:usuario_id(id, nome, email)"
    )
    .single<MotoristaRow>();

  if (error) throw error;

  return mapRowToMotorista(created);
}

export async function atualizarMotorista(
  id: string,
  data: MotoristaFormData
): Promise<Motorista> {
  const client = ensureSupabase();
  const payload = mapFormToPayload(data);

  const { data: updated, error } = await client
    .from("motoristas")
    .update(payload)
    .eq("id", id)
    .select(
      "id, usuario_id, nome, contato, categoria_cnh, validade_cnh, status, observacoes, usuarios:usuario_id(id, nome, email)"
    )
    .single<MotoristaRow>();

  if (error) throw error;

  return mapRowToMotorista(updated);
}

export async function inativarMotorista(id: string): Promise<Motorista> {
  const client = ensureSupabase();

  const { data: updated, error } = await client
    .from("motoristas")
    .update({ status: "inativo" satisfies StatusMotorista })
    .eq("id", id)
    .select(
      "id, usuario_id, nome, contato, categoria_cnh, validade_cnh, status, observacoes, usuarios:usuario_id(id, nome, email)"
    )
    .single<MotoristaRow>();

  if (error) throw error;

  return mapRowToMotorista(updated);
}
