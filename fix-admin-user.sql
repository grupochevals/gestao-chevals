-- Script para corrigir o usuário admin no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, vamos limpar qualquer usuário admin existente que possa estar corrompido
DELETE FROM public.users WHERE email = 'admin@gestao-chevals.com';
DELETE FROM auth.users WHERE email = 'admin@gestao-chevals.com';

-- 2. Garantir que o perfil Administrador existe
INSERT INTO public.perfis (id, nome, descricao, ativo, created_at, updated_at)
VALUES (1, 'Administrador', 'Perfil com acesso total ao sistema', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- 3. Criar o usuário admin usando a abordagem mais simples
-- Primeiro criar na auth.users usando a função do Supabase
SELECT auth.uid() as current_user;

-- Usar a função administrativa do Supabase para criar usuário
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@gestao-chevals.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nome":"Administrador"}',
    NOW(),
    NOW()
) RETURNING id;

-- Criar o registro na tabela public.users
INSERT INTO public.users (
    id,
    email,
    nome,
    perfil_id,
    ativo,
    primeiro_login,
    created_at,
    updated_at
)
SELECT 
    au.id,
    'admin@gestao-chevals.com',
    'Administrador',
    1,
    true,
    true,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'admin@gestao-chevals.com';

-- 4. Verificar se o usuário foi criado corretamente
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created_at,
    pu.nome,
    pu.perfil_id,
    pu.ativo,
    pu.primeiro_login
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'admin@gestao-chevals.com';

-- Mensagem de sucesso
SELECT 'Usuário admin criado com sucesso!' as resultado;