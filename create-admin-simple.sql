-- Script simplificado para criar usuário admin
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Limpar dados existentes
DELETE FROM public.users WHERE email = 'admin@gestao-chevals.com';

-- 2. Garantir que o perfil Administrador existe
INSERT INTO public.perfis (id, nome, descricao, ativo, created_at, updated_at)
VALUES (1, 'Administrador', 'Perfil com acesso total ao sistema', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- 3. Usar a API do Supabase para criar o usuário (não inserir diretamente em auth.users)
-- Este é apenas um placeholder - o usuário deve ser criado via Dashboard ou API

-- 4. Após criar o usuário via Dashboard/API, inserir na tabela public.users
-- Substitua 'USER_UUID_AQUI' pelo UUID real do usuário criado
/*
INSERT INTO public.users (
    id,
    email,
    nome,
    perfil_id,
    ativo,
    primeiro_login,
    created_at,
    updated_at
) VALUES (
    'USER_UUID_AQUI', -- Substitua pelo UUID real
    'admin@gestao-chevals.com',
    'Administrador',
    1,
    true,
    true,
    NOW(),
    NOW()
);
*/

-- 5. Verificar perfis existentes
SELECT * FROM public.perfis ORDER BY id;

-- 6. Verificar usuários existentes
SELECT * FROM public.users;

-- Instruções:
-- 1. Execute este script primeiro
-- 2. Vá para Authentication > Users no Dashboard do Supabase
-- 3. Clique em "Add user" e crie:
--    - Email: admin@gestao-chevals.com
--    - Password: admin123
--    - Confirm email: true
-- 4. Copie o UUID do usuário criado
-- 5. Descomente e execute o INSERT acima com o UUID correto