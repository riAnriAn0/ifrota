-- Dados de demonstracao do IFROTA.
-- Execute depois de supabase/schema.sql.
--
-- Contas criadas para teste:
-- admin@ifrota.local      / Admin@123456
-- operador@ifrota.local   / Operador@123456
-- motorista@ifrota.local  / Motorista@123456
-- auditor@ifrota.local    / Auditor@123456

create extension if not exists pgcrypto;

do $$
declare
  admin_auth_id uuid := '11111111-1111-1111-1111-111111111111';
  operador_auth_id uuid := '22222222-2222-2222-2222-222222222222';
  motorista_auth_id uuid := '33333333-3333-3333-3333-333333333333';
  auditor_auth_id uuid := '44444444-4444-4444-4444-444444444444';

  admin_usuario_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  operador_usuario_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  motorista_usuario_id uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  auditor_usuario_id uuid := 'dddddddd-dddd-dddd-dddd-dddddddddddd';

  motorista_joao_id uuid := '10000000-0000-0000-0000-000000000001';
  motorista_maria_id uuid := '10000000-0000-0000-0000-000000000002';
  motorista_carlos_id uuid := '10000000-0000-0000-0000-000000000003';

  veiculo_onibus_id uuid := '20000000-0000-0000-0000-000000000001';
  veiculo_van_id uuid := '20000000-0000-0000-0000-000000000002';
  veiculo_pickup_id uuid := '20000000-0000-0000-0000-000000000003';
  veiculo_carro_id uuid := '20000000-0000-0000-0000-000000000004';

  viagem_1_id uuid := '30000000-0000-0000-0000-000000000001';
  viagem_2_id uuid := '30000000-0000-0000-0000-000000000002';
  viagem_3_id uuid := '30000000-0000-0000-0000-000000000003';
  viagem_4_id uuid := '30000000-0000-0000-0000-000000000004';

  manutencao_1_id uuid := '40000000-0000-0000-0000-000000000001';
  manutencao_2_id uuid := '40000000-0000-0000-0000-000000000002';
  manutencao_3_id uuid := '40000000-0000-0000-0000-000000000003';

  abastecimento_1_id uuid := '50000000-0000-0000-0000-000000000001';
  abastecimento_2_id uuid := '50000000-0000-0000-0000-000000000002';
  abastecimento_3_id uuid := '50000000-0000-0000-0000-000000000003';

  ocorrencia_1_id uuid := '60000000-0000-0000-0000-000000000001';
  ocorrencia_2_id uuid := '60000000-0000-0000-0000-000000000002';

  calendario_1_id uuid := '70000000-0000-0000-0000-000000000001';
  calendario_2_id uuid := '70000000-0000-0000-0000-000000000002';
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values
    (
      admin_auth_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@ifrota.local',
      crypt('Admin@123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nome":"Administrador IFROTA","tipo":"administrador"}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    ),
    (
      operador_auth_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'operador@ifrota.local',
      crypt('Operador@123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nome":"Operador de Frota","tipo":"operador"}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    ),
    (
      motorista_auth_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'motorista@ifrota.local',
      crypt('Motorista@123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nome":"Joao Motorista","tipo":"motorista"}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    ),
    (
      auditor_auth_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'auditor@ifrota.local',
      crypt('Auditor@123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nome":"Auditor IFROTA","tipo":"auditor"}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    )
  on conflict (id) do update
  set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    updated_at = now(),
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data;

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values
    (
      admin_auth_id,
      admin_auth_id,
      'admin@ifrota.local',
      jsonb_build_object('sub', admin_auth_id::text, 'email', 'admin@ifrota.local', 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    ),
    (
      operador_auth_id,
      operador_auth_id,
      'operador@ifrota.local',
      jsonb_build_object('sub', operador_auth_id::text, 'email', 'operador@ifrota.local', 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    ),
    (
      motorista_auth_id,
      motorista_auth_id,
      'motorista@ifrota.local',
      jsonb_build_object('sub', motorista_auth_id::text, 'email', 'motorista@ifrota.local', 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    ),
    (
      auditor_auth_id,
      auditor_auth_id,
      'auditor@ifrota.local',
      jsonb_build_object('sub', auditor_auth_id::text, 'email', 'auditor@ifrota.local', 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    )
  on conflict (provider, provider_id) do update
  set
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();

  insert into public.usuarios (
    id,
    auth_user_id,
    nome,
    email,
    contato,
    setor,
    tipo,
    foto_url,
    ativo,
    data_criacao
  )
  values
    (
      admin_usuario_id,
      admin_auth_id,
      'Administrador IFROTA',
      'admin@ifrota.local',
      '(99) 0000-0001',
      'Direcao Administrativa',
      'administrador',
      null,
      true,
      now()
    ),
    (
      operador_usuario_id,
      operador_auth_id,
      'Operador de Frota',
      'operador@ifrota.local',
      '(99) 0000-0002',
      'Transporte',
      'operador',
      null,
      true,
      now()
    ),
    (
      motorista_usuario_id,
      motorista_auth_id,
      'Joao Motorista',
      'motorista@ifrota.local',
      '(99) 0000-0003',
      'Transporte',
      'motorista',
      null,
      true,
      now()
    ),
    (
      auditor_usuario_id,
      auditor_auth_id,
      'Auditor IFROTA',
      'auditor@ifrota.local',
      '(99) 0000-0004',
      'Controle Interno',
      'auditor',
      null,
      true,
      now()
    )
  on conflict (id) do update
  set
    auth_user_id = excluded.auth_user_id,
    nome = excluded.nome,
    email = excluded.email,
    contato = excluded.contato,
    setor = excluded.setor,
    tipo = excluded.tipo,
    foto_url = excluded.foto_url,
    ativo = excluded.ativo;

  insert into public.admins (id, usuario_id, sub_setor, nivel_acesso)
  values
    ('90000000-0000-0000-0000-000000000001', admin_usuario_id, 'Administracao', 'total'),
    ('90000000-0000-0000-0000-000000000002', operador_usuario_id, 'Agendamento', 'operacional')
  on conflict (id) do update
  set
    usuario_id = excluded.usuario_id,
    sub_setor = excluded.sub_setor,
    nivel_acesso = excluded.nivel_acesso;

  insert into public.motoristas (
    id,
    usuario_id,
    nome,
    contato,
    categoria_cnh,
    validade_cnh,
    status,
    observacoes
  )
  values
    (
      motorista_joao_id,
      motorista_usuario_id,
      'Joao Motorista',
      '(99) 98111-0001',
      'D',
      current_date + interval '180 days',
      'ativo',
      'Motorista principal para viagens intermunicipais.'
    ),
    (
      motorista_maria_id,
      null,
      'Maria Condutora',
      '(99) 98111-0002',
      'B',
      current_date + interval '25 days',
      'ativo',
      'CNH proxima do vencimento para testar alerta.'
    ),
    (
      motorista_carlos_id,
      null,
      'Carlos Afastado',
      '(99) 98111-0003',
      'D',
      current_date - interval '10 days',
      'afastado',
      'CNH vencida para testar bloqueio de viagem.'
    )
  on conflict (id) do update
  set
    usuario_id = excluded.usuario_id,
    nome = excluded.nome,
    contato = excluded.contato,
    categoria_cnh = excluded.categoria_cnh,
    validade_cnh = excluded.validade_cnh,
    status = excluded.status,
    observacoes = excluded.observacoes;

  insert into public.veiculos (
    id,
    marca,
    modelo,
    placa,
    ano,
    num_assentos,
    km_atual,
    status,
    observacoes,
    foto_url
  )
  values
    (
      veiculo_onibus_id,
      'Volkswagen',
      'Onibus Escolar',
      'IFM1A23',
      2018,
      44,
      84200,
      'disponivel',
      'Veiculo usado em viagens com turmas e eventos institucionais.',
      null
    ),
    (
      veiculo_van_id,
      'Mercedes-Benz',
      'Sprinter',
      'IFM2B34',
      2020,
      16,
      52600,
      'em_uso',
      'Van para deslocamentos administrativos e viagens curtas.',
      null
    ),
    (
      veiculo_pickup_id,
      'Toyota',
      'Hilux',
      'IFM3C45',
      2021,
      5,
      39850,
      'em_manutencao',
      'Pickup em revisao preventiva.',
      null
    ),
    (
      veiculo_carro_id,
      'Fiat',
      'Cronos',
      'IFM4D56',
      2022,
      5,
      21400,
      'disponivel',
      'Carro de apoio para atividades locais.',
      null
    )
  on conflict (id) do update
  set
    marca = excluded.marca,
    modelo = excluded.modelo,
    placa = excluded.placa,
    ano = excluded.ano,
    num_assentos = excluded.num_assentos,
    km_atual = excluded.km_atual,
    status = excluded.status,
    observacoes = excluded.observacoes,
    foto_url = excluded.foto_url;

  insert into public.viagens (
    id,
    motorista_id,
    veiculo_id,
    origem,
    destino,
    num_passageiros,
    data_saida_prevista,
    data_chegada_prevista,
    data_inicio_real,
    data_fim_real,
    km_inicial,
    km_final,
    status,
    observacoes
  )
  values
    (
      viagem_1_id,
      motorista_joao_id,
      veiculo_onibus_id,
      'IFMA Campus Caxias',
      'IFMA Campus Sao Luis',
      32,
      date_trunc('day', now()) + interval '2 days 07 hours',
      date_trunc('day', now()) + interval '2 days 18 hours',
      null,
      null,
      null,
      null,
      'agendada',
      'Visita tecnica com estudantes.'
    ),
    (
      viagem_2_id,
      motorista_maria_id,
      veiculo_van_id,
      'IFMA Campus Caxias',
      'Prefeitura de Caxias',
      6,
      date_trunc('day', now()) + interval '1 hour',
      date_trunc('day', now()) + interval '4 hours',
      now() - interval '30 minutes',
      null,
      52600,
      null,
      'em_andamento',
      'Reuniao administrativa externa.'
    ),
    (
      viagem_3_id,
      motorista_joao_id,
      veiculo_carro_id,
      'IFMA Campus Caxias',
      'Centro de Caxias',
      3,
      date_trunc('day', now()) - interval '3 days' + interval '08 hours',
      date_trunc('day', now()) - interval '3 days' + interval '11 hours',
      date_trunc('day', now()) - interval '3 days' + interval '08 hours 10 minutes',
      date_trunc('day', now()) - interval '3 days' + interval '10 hours 40 minutes',
      21120,
      21205,
      'finalizada',
      'Entrega de documentos.'
    ),
    (
      viagem_4_id,
      motorista_joao_id,
      veiculo_onibus_id,
      'IFMA Campus Caxias',
      'UEMA Caxias',
      20,
      date_trunc('day', now()) + interval '2 days 10 hours',
      date_trunc('day', now()) + interval '2 days 15 hours',
      null,
      null,
      null,
      null,
      'agendada',
      'Viagem propositalmente sobreposta para testar conflito no calendario.'
    )
  on conflict (id) do update
  set
    motorista_id = excluded.motorista_id,
    veiculo_id = excluded.veiculo_id,
    origem = excluded.origem,
    destino = excluded.destino,
    num_passageiros = excluded.num_passageiros,
    data_saida_prevista = excluded.data_saida_prevista,
    data_chegada_prevista = excluded.data_chegada_prevista,
    data_inicio_real = excluded.data_inicio_real,
    data_fim_real = excluded.data_fim_real,
    km_inicial = excluded.km_inicial,
    km_final = excluded.km_final,
    status = excluded.status,
    observacoes = excluded.observacoes;

  insert into public.manutencoes (
    id,
    veiculo_id,
    tipo,
    categoria,
    data,
    km_registro,
    custo,
    oficina,
    descricao,
    status,
    proxima_data_prevista,
    proximo_km_previsto
  )
  values
    (
      manutencao_1_id,
      veiculo_pickup_id,
      'preventiva',
      'Revisao geral',
      current_date - interval '5 days',
      39850,
      850.00,
      'Oficina Central Caxias',
      'Troca de oleo, filtros e revisao de freios.',
      'em_andamento',
      current_date + interval '20 days',
      45000
    ),
    (
      manutencao_2_id,
      veiculo_onibus_id,
      'preventiva',
      'Pneus e alinhamento',
      current_date - interval '20 days',
      83500,
      1250.00,
      'Pneus Caxias',
      'Alinhamento, balanceamento e verificacao de pneus.',
      'concluida',
      current_date + interval '10 days',
      86000
    ),
    (
      manutencao_3_id,
      veiculo_van_id,
      'corretiva',
      'Sistema eletrico',
      current_date - interval '2 days',
      52580,
      320.00,
      'Auto Eletrica Sao Jose',
      'Correcao de falha intermitente nos farois.',
      'concluida',
      null,
      null
    )
  on conflict (id) do update
  set
    veiculo_id = excluded.veiculo_id,
    tipo = excluded.tipo,
    categoria = excluded.categoria,
    data = excluded.data,
    km_registro = excluded.km_registro,
    custo = excluded.custo,
    oficina = excluded.oficina,
    descricao = excluded.descricao,
    status = excluded.status,
    proxima_data_prevista = excluded.proxima_data_prevista,
    proximo_km_previsto = excluded.proximo_km_previsto;

  insert into public.abastecimentos (
    id,
    veiculo_id,
    motorista_id,
    litros,
    valor_total,
    tipo_combustivel,
    data,
    km_registro,
    posto,
    cidade,
    observacoes
  )
  values
    (
      abastecimento_1_id,
      veiculo_onibus_id,
      motorista_joao_id,
      120.5,
      730.00,
      'diesel_s10',
      current_date - interval '4 days',
      84010,
      'Posto Avenida',
      'Caxias',
      'Abastecimento antes de viagem intermunicipal.'
    ),
    (
      abastecimento_2_id,
      veiculo_van_id,
      motorista_maria_id,
      62.0,
      375.00,
      'diesel_s10',
      current_date - interval '1 day',
      52590,
      'Posto Sao Francisco',
      'Caxias',
      'Registro com cartao corporativo.'
    ),
    (
      abastecimento_3_id,
      veiculo_carro_id,
      motorista_joao_id,
      38.4,
      235.00,
      'gasolina',
      current_date - interval '3 days',
      21180,
      'Posto Centro',
      'Caxias',
      'Abastecimento urbano.'
    )
  on conflict (id) do update
  set
    veiculo_id = excluded.veiculo_id,
    motorista_id = excluded.motorista_id,
    litros = excluded.litros,
    valor_total = excluded.valor_total,
    tipo_combustivel = excluded.tipo_combustivel,
    data = excluded.data,
    km_registro = excluded.km_registro,
    posto = excluded.posto,
    cidade = excluded.cidade,
    observacoes = excluded.observacoes;

  insert into public.ocorrencias (
    id,
    viagem_id,
    veiculo_id,
    motorista_id,
    tipo,
    severidade,
    descricao,
    data_ocorrencia,
    status
  )
  values
    (
      ocorrencia_1_id,
      viagem_2_id,
      veiculo_van_id,
      motorista_maria_id,
      'atraso',
      'media',
      'Atraso no deslocamento por bloqueio temporario no centro.',
      now() - interval '20 minutes',
      'aberta'
    ),
    (
      ocorrencia_2_id,
      viagem_3_id,
      veiculo_carro_id,
      motorista_joao_id,
      'pneu',
      'alta',
      'Pneu apresentou perda de pressao durante o retorno. Veiculo recolhido em seguranca.',
      date_trunc('day', now()) - interval '3 days' + interval '10 hours',
      'em_analise'
    )
  on conflict (id) do update
  set
    viagem_id = excluded.viagem_id,
    veiculo_id = excluded.veiculo_id,
    motorista_id = excluded.motorista_id,
    tipo = excluded.tipo,
    severidade = excluded.severidade,
    descricao = excluded.descricao,
    data_ocorrencia = excluded.data_ocorrencia,
    status = excluded.status;

  insert into public.calendario_eventos (
    id,
    titulo,
    descricao,
    tipo,
    veiculo_id,
    viagem_id,
    data_inicio,
    data_fim
  )
  values
    (
      calendario_1_id,
      'Indisponibilidade para limpeza',
      'Onibus reservado para limpeza interna antes da viagem.',
      'indisponibilidade',
      veiculo_onibus_id,
      null,
      date_trunc('day', now()) + interval '1 day 14 hours',
      date_trunc('day', now()) + interval '1 day 17 hours'
    ),
    (
      calendario_2_id,
      'Manutencao preventiva programada',
      'Revisao preventiva da pickup.',
      'manutencao',
      veiculo_pickup_id,
      null,
      date_trunc('day', now()) + interval '5 days 08 hours',
      date_trunc('day', now()) + interval '5 days 12 hours'
    )
  on conflict (id) do update
  set
    titulo = excluded.titulo,
    descricao = excluded.descricao,
    tipo = excluded.tipo,
    veiculo_id = excluded.veiculo_id,
    viagem_id = excluded.viagem_id,
    data_inicio = excluded.data_inicio,
    data_fim = excluded.data_fim;

  insert into public.notificacoes (
    id,
    usuario_id,
    titulo,
    mensagem,
    tipo,
    lida
  )
  values
    (
      '80000000-0000-0000-0000-000000000001',
      admin_usuario_id,
      'Ocorrencia de alta severidade',
      'Ha uma ocorrencia de pneu em analise no historico recente.',
      'alerta',
      false
    ),
    (
      '80000000-0000-0000-0000-000000000002',
      operador_usuario_id,
      'CNH proxima do vencimento',
      'A motorista Maria Condutora possui CNH proxima do vencimento.',
      'aviso',
      false
    )
  on conflict (id) do update
  set
    usuario_id = excluded.usuario_id,
    titulo = excluded.titulo,
    mensagem = excluded.mensagem,
    tipo = excluded.tipo,
    lida = excluded.lida;
end $$;
