-- Script temporário para desabilitar RLS e testar login
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Desabilitar RLS temporariamente para debug
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.perfis;

-- 3. Verificar se existem usuários na tabela auth.users
SELECT 'Usuários em auth.users:' as info;
SELECT email, created_at, email_confirmed_at FROM auth.users;

-- 4. Verificar se existem usuários na tabela public.users
SELECT 'Usuários em public.users:' as info;
SELECT * FROM public.users;

-- 5. Verificar perfis
SELECT 'Perfis disponíveis:' as info;
SELECT * FROM public.perfis ORDER BY id;

-- 6. Limpar qualquer usuário admin existente
DELETE FROM public.users WHERE email = 'admin@gestao-chevals.com';

-- 7. Instruções para criar usuário:
-- Vá para Authentication > Users no Dashboard do Supabase
-- Clique em "Add user" e crie:
-- - Email: admin@gestao-chevals.com
-- - Password: admin123
-- - Confirm email: true

SELECT 'RLS desabilitado temporariamente. Crie o usuário via Dashboard.' as resultado;