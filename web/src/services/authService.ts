import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase/client";
import type { PerfilUsuario, UsuarioPerfil } from "../types/app";

type UsuarioRow = {
  id: string;
  auth_user_id: string;
  nome: string | null;
  email: string | null;
  tipo: string | null;
  foto_url: string | null;
  ativo: boolean | null;
};

function normalizeRole(role: string | null | undefined): PerfilUsuario {
  if (role === "admin") return "administrador";
  if (
    role === "administrador" ||
    role === "operador" ||
    role === "motorista" ||
    role === "auditor"
  ) {
    return role;
  }

  return "administrador";
}

function profileFromSession(session: Session): UsuarioPerfil {
  const metadata = session.user.user_metadata;
  const fullName = metadata.nome || metadata.name || session.user.email || "Usuario";

  return {
    id: session.user.id,
    authUserId: session.user.id,
    nome: String(fullName),
    email: session.user.email || "",
    tipo: normalizeRole(String(metadata.tipo || metadata.role || "")),
    fotoUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined,
    ativo: true,
  };
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase ainda nao foi configurado no arquivo .env.local.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data.session;
}

export async function signOut() {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  return data.session;
}

export async function getUsuarioPerfil(session: Session): Promise<UsuarioPerfil> {
  if (!supabase) return profileFromSession(session);

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, auth_user_id, nome, email, tipo, foto_url, ativo")
    .eq("auth_user_id", session.user.id)
    .maybeSingle<UsuarioRow>();

  if (error || !data) return profileFromSession(session);

  return {
    id: data.id,
    authUserId: data.auth_user_id,
    nome: data.nome || session.user.email || "Usuario",
    email: data.email || session.user.email || "",
    tipo: normalizeRole(data.tipo),
    fotoUrl: data.foto_url || undefined,
    ativo: data.ativo ?? true,
  };
}
