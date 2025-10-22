-- ========================================
-- VERIFICAR SE USUÁRIO FOI CRIADO
-- ========================================

-- 1. VERIFICAR NO AUTH.USERS
-- ========================================
SELECT
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users
WHERE email = 'virginia@beflyminascentro.com.br';

-- 2. VERIFICAR NA TABELA USERS
-- ========================================
SELECT
    id,
    email,
    nome,
    perfil_id,
    ativo,
    primeiro_login,
    created_at
FROM users
WHERE email = 'virginia@beflyminascentro.com.br';

-- 3. VERIFICAR TODOS OS USUÁRIOS NA TABELA USERS
-- ========================================
SELECT
    u.id,
    u.email,
    u.nome,
    u.perfil_id,
    p.nome as perfil_nome,
    u.ativo
FROM users u
LEFT JOIN perfis p ON p.id = u.perfil_id
ORDER BY u.created_at DESC
LIMIT 10;

-- 4. VERIFICAR SE O TRIGGER EXISTE
-- ========================================
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. VERIFICAR SE A FUNÇÃO DO TRIGGER EXISTE
-- ========================================
SELECT
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
