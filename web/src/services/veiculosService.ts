import { isSupabaseConfigured, supabase } from "./supabase/client";
import type { StatusVeiculo, Veiculo, VeiculoFormData } from "../types/app";

type VeiculoRow = {
  id: string;
  marca: string | null;
  modelo: string | null;
  placa: string | null;
  ano: number | null;
  num_assentos: number | null;
  km_atual: number | null;
  status: string | null;
  observacoes: string | null;
  foto_url: string | null;
};

type VeiculoPayload = {
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
  num_assentos: number;
  km_atual: number;
  status: StatusVeiculo;
  observacoes: string;
  foto_url: string | null;
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase ainda nao foi configurado no arquivo .env.local.");
  }

  return supabase;
}

function normalizeStatus(status: string | null): StatusVeiculo {
  if (
    status === "disponivel" ||
    status === "em_uso" ||
    status === "em_manutencao" ||
    status === "inativo"
  ) {
    return status;
  }

  return "disponivel";
}

function mapRowToVeiculo(row: VeiculoRow): Veiculo {
  return {
    id: row.id,
    marca: row.marca || "",
    modelo: row.modelo || "",
    placa: row.placa || "",
    ano: row.ano || new Date().getFullYear(),
    numAssentos: row.num_assentos || 0,
    kmAtual: row.km_atual || 0,
    status: normalizeStatus(row.status),
    observacoes: row.observacoes || "",
    fotoUrl: row.foto_url || "",
  };
}

function mapFormToPayload(data: VeiculoFormData): VeiculoPayload {
  return {
    marca: data.marca.trim(),
    modelo: data.modelo.trim(),
    placa: data.placa.trim().toUpperCase(),
    ano: data.ano,
    num_assentos: data.numAssentos,
    km_atual: data.kmAtual,
    status: data.status,
    observacoes: data.observacoes.trim(),
    foto_url: data.fotoUrl.trim() || null,
  };
}

export async function listarVeiculos(): Promise<Veiculo[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("veiculos")
    .select(
      "id, marca, modelo, placa, ano, num_assentos, km_atual, status, observacoes, foto_url"
    )
    .order("marca", { ascending: true })
    .returns<VeiculoRow[]>();

  if (error) throw error;

  return (data || []).map(mapRowToVeiculo);
}

export async function criarVeiculo(data: VeiculoFormData): Promise<Veiculo> {
  const client = ensureSupabase();
  const payload = mapFormToPayload(data);

  const { data: created, error } = await client
    .from("veiculos")
    .insert(payload)
    .select(
      "id, marca, modelo, placa, ano, num_assentos, km_atual, status, observacoes, foto_url"
    )
    .single<VeiculoRow>();

  if (error) throw error;

  return mapRowToVeiculo(created);
}

export async function atualizarVeiculo(
  id: string,
  data: VeiculoFormData
): Promise<Veiculo> {
  const client = ensureSupabase();
  const payload = mapFormToPayload(data);

  const { data: updated, error } = await client
    .from("veiculos")
    .update(payload)
    .eq("id", id)
    .select(
      "id, marca, modelo, placa, ano, num_assentos, km_atual, status, observacoes, foto_url"
    )
    .single<VeiculoRow>();

  if (error) throw error;

  return mapRowToVeiculo(updated);
}

export async function inativarVeiculo(id: string): Promise<Veiculo> {
  const client = ensureSupabase();

  const { data: updated, error } = await client
    .from("veiculos")
    .update({ status: "inativo" satisfies StatusVeiculo })
    .eq("id", id)
    .select(
      "id, marca, modelo, placa, ano, num_assentos, km_atual, status, observacoes, foto_url"
    )
    .single<VeiculoRow>();

  if (error) throw error;

  return mapRowToVeiculo(updated);
}
