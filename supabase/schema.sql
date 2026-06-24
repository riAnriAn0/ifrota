-- Schema inicial do IFROTA para Supabase/PostgreSQL.
-- Execute este arquivo no SQL Editor do Supabase antes do seed_admin.sql.

create extension if not exists pgcrypto;

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  email text not null,
  contato text not null default '',
  setor text not null default '',
  tipo text not null default 'auditor'
    check (tipo in ('administrador', 'operador', 'motorista', 'auditor')),
  foto_url text,
  ativo boolean not null default true,
  data_criacao timestamptz not null default now()
);

create unique index if not exists usuarios_auth_user_id_key
  on public.usuarios(auth_user_id)
  where auth_user_id is not null;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  sub_setor text not null default '',
  nivel_acesso text not null default 'administrador',
  criado_em timestamptz not null default now()
);

create table if not exists public.motoristas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete set null,
  nome text not null,
  contato text not null default '',
  categoria_cnh text not null,
  validade_cnh date not null,
  status text not null default 'ativo'
    check (status in ('ativo', 'inativo', 'afastado')),
  observacoes text not null default '',
  criado_em timestamptz not null default now()
);

create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  marca text not null,
  modelo text not null,
  placa text not null unique,
  ano integer not null check (ano >= 1950),
  num_assentos integer not null default 1 check (num_assentos > 0),
  km_atual numeric not null default 0 check (km_atual >= 0),
  status text not null default 'disponivel'
    check (status in ('disponivel', 'em_uso', 'em_manutencao', 'inativo')),
  observacoes text not null default '',
  foto_url text,
  data_cadastro timestamptz not null default now()
);

create table if not exists public.viagens (
  id uuid primary key default gen_random_uuid(),
  motorista_id uuid not null references public.motoristas(id) on delete restrict,
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  origem text not null default 'IFMA Campus Caxias',
  destino text not null,
  num_passageiros integer not null default 1 check (num_passageiros >= 0),
  data_saida_prevista timestamptz not null,
  data_chegada_prevista timestamptz not null,
  data_inicio_real timestamptz,
  data_fim_real timestamptz,
  km_inicial numeric,
  km_final numeric,
  status text not null default 'agendada'
    check (status in ('agendada', 'em_andamento', 'finalizada', 'cancelada')),
  observacoes text not null default '',
  criado_em timestamptz not null default now(),
  check (data_chegada_prevista >= data_saida_prevista),
  check (km_inicial is null or km_inicial >= 0),
  check (km_final is null or km_final >= 0),
  check (km_final is null or km_inicial is null or km_final >= km_inicial)
);

create index if not exists viagens_veiculo_periodo_idx
  on public.viagens(veiculo_id, data_saida_prevista, data_chegada_prevista);

create table if not exists public.manutencoes (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  tipo text not null check (tipo in ('corretiva', 'preventiva')),
  categoria text not null,
  data date not null,
  km_registro numeric not null default 0 check (km_registro >= 0),
  custo numeric not null default 0 check (custo >= 0),
  oficina text not null default '',
  descricao text not null default '',
  status text not null default 'pendente'
    check (status in ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  proxima_data_prevista date,
  proximo_km_previsto numeric check (proximo_km_previsto is null or proximo_km_previsto >= 0),
  criado_em timestamptz not null default now()
);

create table if not exists public.abastecimentos (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  motorista_id uuid not null references public.motoristas(id) on delete restrict,
  litros numeric not null check (litros > 0),
  valor_total numeric not null check (valor_total >= 0),
  tipo_combustivel text not null default 'diesel'
    check (tipo_combustivel in ('gasolina', 'etanol', 'diesel', 'diesel_s10', 'flex', 'outro')),
  data date not null,
  km_registro numeric not null default 0 check (km_registro >= 0),
  posto text not null,
  cidade text not null,
  observacoes text not null default '',
  criado_em timestamptz not null default now()
);

create table if not exists public.ocorrencias (
  id uuid primary key default gen_random_uuid(),
  viagem_id uuid not null references public.viagens(id) on delete cascade,
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  motorista_id uuid not null references public.motoristas(id) on delete restrict,
  tipo text not null default 'outro'
    check (tipo in ('problema_mecanico', 'atraso', 'acidente', 'desvio_rota', 'pneu', 'documentacao', 'outro')),
  severidade text not null default 'baixa'
    check (severidade in ('baixa', 'media', 'alta')),
  descricao text not null,
  data_ocorrencia timestamptz not null default now(),
  status text not null default 'aberta'
    check (status in ('aberta', 'em_analise', 'resolvida')),
  criado_em timestamptz not null default now()
);

create table if not exists public.anexos (
  id uuid primary key default gen_random_uuid(),
  entidade_tipo text not null,
  entidade_id uuid not null,
  ocorrencia_id uuid references public.ocorrencias(id) on delete cascade,
  arquivo_url text not null,
  tipo_arquivo text not null default '',
  descricao text not null default '',
  criado_em timestamptz not null default now()
);

create table if not exists public.categorias_gastos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  descricao text not null default '',
  ativo boolean not null default true
);

create table if not exists public.calendario_eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null default '',
  tipo text not null default 'outro',
  veiculo_id uuid references public.veiculos(id) on delete set null,
  viagem_id uuid references public.viagens(id) on delete cascade,
  data_inicio timestamptz not null,
  data_fim timestamptz not null,
  criado_em timestamptz not null default now(),
  check (data_fim >= data_inicio)
);

create table if not exists public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  tipo text not null default 'info',
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

insert into public.categorias_gastos (nome, descricao)
values
  ('abastecimento', 'Gastos com combustivel'),
  ('manutencao_corretiva', 'Gastos com manutencoes corretivas'),
  ('manutencao_preventiva', 'Gastos com manutencoes preventivas'),
  ('multas', 'Multas e penalidades'),
  ('outros', 'Outros gastos identificados')
on conflict (nome) do nothing;

alter table public.usuarios enable row level security;
alter table public.admins enable row level security;
alter table public.motoristas enable row level security;
alter table public.veiculos enable row level security;
alter table public.viagens enable row level security;
alter table public.manutencoes enable row level security;
alter table public.abastecimentos enable row level security;
alter table public.ocorrencias enable row level security;
alter table public.anexos enable row level security;
alter table public.categorias_gastos enable row level security;
alter table public.calendario_eventos enable row level security;
alter table public.notificacoes enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'usuarios',
    'admins',
    'motoristas',
    'veiculos',
    'viagens',
    'manutencoes',
    'abastecimentos',
    'ocorrencias',
    'anexos',
    'categorias_gastos',
    'calendario_eventos',
    'notificacoes'
  ]
  loop
    execute format(
      'drop policy if exists "%I_authenticated_select" on public.%I',
      table_name,
      table_name
    );
    execute format(
      'drop policy if exists "%I_authenticated_insert" on public.%I',
      table_name,
      table_name
    );
    execute format(
      'drop policy if exists "%I_authenticated_update" on public.%I',
      table_name,
      table_name
    );
    execute format(
      'drop policy if exists "%I_authenticated_delete" on public.%I',
      table_name,
      table_name
    );

    execute format(
      'create policy "%I_authenticated_select" on public.%I for select to authenticated using (true)',
      table_name,
      table_name
    );
    execute format(
      'create policy "%I_authenticated_insert" on public.%I for insert to authenticated with check (true)',
      table_name,
      table_name
    );
    execute format(
      'create policy "%I_authenticated_update" on public.%I for update to authenticated using (true) with check (true)',
      table_name,
      table_name
    );
    execute format(
      'create policy "%I_authenticated_delete" on public.%I for delete to authenticated using (true)',
      table_name,
      table_name
    );
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('anexos', 'anexos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "anexos_authenticated_select" on storage.objects;
drop policy if exists "anexos_authenticated_insert" on storage.objects;
drop policy if exists "anexos_authenticated_update" on storage.objects;
drop policy if exists "anexos_authenticated_delete" on storage.objects;

create policy "anexos_authenticated_select"
on storage.objects for select to authenticated
using (bucket_id = 'anexos');

create policy "anexos_authenticated_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'anexos');

create policy "anexos_authenticated_update"
on storage.objects for update to authenticated
using (bucket_id = 'anexos')
with check (bucket_id = 'anexos');

create policy "anexos_authenticated_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'anexos');
