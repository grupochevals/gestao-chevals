-- Verificar políticas RLS que podem estar bloqueando o login
-- Este script verifica as políticas de segurança de linha (RLS) nas tabelas

-- Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'perfis');

-- Verificar políticas existentes na tabela users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Verificar políticas existentes na tabela perfis
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'perfis';

-- Verificar se o usuário admin existe em ambas as tabelas
SELECT 'auth.users' as tabela, email, id, email_confirmed_at, encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 'admin@gestao-chevals.com'
UNION ALL
SELECT 'public.users' as tabela, email, id::text, created_at::timestamptz, ativo::text
FROM public.users 
WHERE email = 'admin@gestao-chevals.com';

-- Verificar se o perfil Administrador existe
SELECT id, nome, ativo 
FROM public.perfis 
WHERE id = 1 OR nome ILIKE '%admin%';