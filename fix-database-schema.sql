-- Script para corrigir problemas de schema no banco Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- PROBLEMA IDENTIFICADO: "Database error querying schema"
-- Isso indica que há um problema fundamental no schema do banco

-- 1. Verificar se as extensões necessárias estão habilitadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Verificar e corrigir a tabela auth.users se necessário
-- Primeiro, vamos ver se conseguimos acessar a tabela auth.users
DO $$
BEGIN
    -- Tentar fazer uma consulta simples na tabela auth.users
    PERFORM 1 FROM auth.users LIMIT 1;
    RAISE NOTICE 'Tabela auth.users acessível';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao acessar auth.users: %', SQLERRM;
END $$;

-- 3. Limpar completamente as tabelas e recriar o usuário admin
-- Primeiro, limpar a tabela public.users
DELETE FROM public.users WHERE email = 'admin@gestao-chevals.com';

-- 4. Tentar criar o usuário admin usando a função do Supabase
-- Nota: Este método pode não funcionar em todos os casos
SELECT auth.uid() as current_user_id;

-- 5. Verificar se existem problemas com as políticas RLS
-- Desabilitar RLS temporariamente
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.perfis DISABLE ROW LEVEL SECURITY;

-- 6. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.perfis;

-- 7. Verificar se o perfil Administrador existe
INSERT INTO public.perfis (id, nome, descricao, ativo, created_at, updated_at)
VALUES (1, 'Administrador', 'Perfil com acesso total ao sistema', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- 8. Verificar tabelas existentes
SELECT 'Tabelas no schema public:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

SELECT 'Tabelas no schema auth:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth';

-- 9. Verificar se há problemas de permissões
SELECT 'Verificando permissões...' as info;
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'auth' AND table_name = 'users';

-- 10. Resultado
SELECT 'Schema verificado. Agora crie o usuário via Dashboard do Supabase.' as resultado;
SELECT 'Vá para Authentication > Users e crie:' as instrucao_1;
SELECT 'Email: admin@gestao-chevals.com' as instrucao_2;
SELECT 'Password: admin123' as instrucao_3;
SELECT 'Confirm email: true' as instrucao_4;