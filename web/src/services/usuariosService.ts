import { isSupabaseConfigured, supabase } from "./supabase/client";
import type { PerfilUsuario, UsuarioFormData, UsuarioPerfil } from "../types/app";

type UsuarioRow = {
  id: string;
  auth_user_id: string | null;
  nome: string | null;
  email: string | null;
  contato: string | null;
  setor: string | null;
  tipo: string | null;
  foto_url: string | null;
  ativo: boolean | null;
};

type UsuarioPayload = {
  auth_user_id: string | null;
  nome: string;
  email: string;
  contato: string;
  setor: string;
  tipo: PerfilUsuario;
  foto_url: string | null;
  ativo: boolean;
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase ainda nao foi configurado no arquivo .env.local.");
  }

  return supabase;
}

function normalizeRole(role: string | null): PerfilUsuario {
  if (
    role === "administrador" ||
    role === "operador" ||
    role === "motorista" ||
    role === "auditor"
  ) {
    return role;
  }

  return "auditor";
}

function mapRowToUsuario(row: UsuarioRow): UsuarioPerfil {
  return {
    id: row.id,
    authUserId: row.auth_user_id || "",
    nome: row.nome || "",
    email: row.email || "",
    contato: row.contato || "",
    setor: row.setor || "",
    tipo: normalizeRole(row.tipo),
    fotoUrl: row.foto_url || "",
    ativo: row.ativo ?? true,
  };
}

function mapFormToPayload(data: UsuarioFormData): UsuarioPayload {
  return {
    auth_user_id: data.authUserId || null,
    nome: data.nome.trim(),
    email: data.email.trim(),
    contato: data.contato?.trim() || "",
    setor: data.setor?.trim() || "",
    tipo: data.tipo,
    foto_url: data.fotoUrl?.trim() || null,
    ativo: data.ativo,
  };
}

const usuarioSelect =
  "id, auth_user_id, nome, email, contato, setor, tipo, foto_url, ativo";

export async function listarUsuarios(): Promise<UsuarioPerfil[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("usuarios")
    .select(usuarioSelect)
    .order("nome", { ascending: true })
    .returns<UsuarioRow[]>();

  if (error) throw error;

  return (data || []).map(mapRowToUsuario);
}

export async function criarUsuario(data: UsuarioFormData): Promise<UsuarioPerfil> {
  const client = ensureSupabase();

  const { data: created, error } = await client
    .from("usuarios")
    .insert(mapFormToPayload(data))
    .select(usuarioSelect)
    .single<UsuarioRow>();

  if (error) throw error;

  return mapRowToUsuario(created);
}

export async function atualizarUsuario(
  id: string,
  data: UsuarioFormData
): Promise<UsuarioPerfil> {
  const client = ensureSupabase();

  const { data: updated, error } = await client
    .from("usuarios")
    .update(mapFormToPayload(data))
    .eq("id", id)
    .select(usuarioSelect)
    .single<UsuarioRow>();

  if (error) throw error;

  return mapRowToUsuario(updated);
}

export async function inativarUsuario(id: string): Promise<void> {
  const client = ensureSupabase();

  const { error } = await client
    .from("usuarios")
    .update({ ativo: false })
    .eq("id", id);

  if (error) throw error;
}
