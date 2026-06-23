-- Usuario administrador padrao para ambiente de desenvolvimento do IFROTA.
-- Execute este arquivo no SQL Editor do Supabase ou com Supabase CLI.
--
-- Login: admin@ifrota.local
-- Senha: Admin@123456
--
-- Troque a senha apos o primeiro acesso em ambientes reais.

create extension if not exists pgcrypto;

do $$
declare
  admin_user_id uuid := '11111111-1111-1111-1111-111111111111';
  admin_email text := 'admin@ifrota.local';
  admin_password text := 'Admin@123456';
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
  values (
    admin_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
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
  values (
    admin_user_id,
    admin_user_id,
    admin_email,
    jsonb_build_object(
      'sub', admin_user_id::text,
      'email', admin_email,
      'email_verified', true,
      'phone_verified', false
    ),
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

  if exists (
    select 1
    from public.usuarios
    where auth_user_id = admin_user_id
  ) then
    update public.usuarios
    set
      nome = 'Administrador IFROTA',
      email = admin_email,
      tipo = 'administrador',
      ativo = true
    where auth_user_id = admin_user_id;
  else
    insert into public.usuarios (
      auth_user_id,
      nome,
      email,
      tipo,
      ativo,
      data_criacao
    )
    values (
      admin_user_id,
      'Administrador IFROTA',
      admin_email,
      'administrador',
      true,
      now()
    );
  end if;
end $$;
