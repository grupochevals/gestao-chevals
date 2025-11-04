-- ========================================
-- DIAGNÓSTICO - ERRO AO CRIAR USUÁRIO
-- Execute este script para identificar o problema
-- ========================================

-- 1. VERIFICAR SE A TABELA USERS EXISTE
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE O TRIGGER EXISTE E ESTÁ ATIVO
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
   OR trigger_name = 'on_auth_user_created';

-- 3. VERIFICAR SE A FUNÇÃO handle_new_user EXISTE
SELECT
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 4. VERIFICAR SE A TABELA PERFIS TEM DADOS
SELECT * FROM perfis ORDER BY id;

-- 5. VERIFICAR CONSTRAINTS DA TABELA USERS
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users';

-- 6. VERIFICAR POLICIES RLS NA TABELA USERS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users';

-- 7. TENTAR CRIAR MANUALMENTE UM USUÁRIO DE TESTE
-- (Descomente e execute se necessário)
-- INSERT INTO users (id, email, nome, perfil_id, ativo, primeiro_login)
-- VALUES (
--     gen_random_uuid(),
--     'teste@example.com',
--     'Usuario Teste',
--     (SELECT id FROM perfis WHERE nome = 'Visualizador' LIMIT 1),
--     true,
--     true
-- );
