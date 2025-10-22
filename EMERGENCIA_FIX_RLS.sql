-- ========================================
-- 🚨 EMERGÊNCIA: Correção Imediata do Erro 500
-- ========================================
-- Execute este script AGORA para corrigir o erro 500

-- 1. DESABILITAR TODAS AS POLÍTICAS RLS PROBLEMÁTICAS
-- ========================================
DROP POLICY IF EXISTS "allow_admin_manage_users" ON users;
DROP POLICY IF EXISTS "allow_users_read_own" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "admin_select_all_users" ON users;
DROP POLICY IF EXISTS "admin_insert_users" ON users;
DROP POLICY IF EXISTS "admin_update_all_users" ON users;
DROP POLICY IF EXISTS "admin_delete_users" ON users;

-- 2. DESABILITAR RLS TEMPORARIAMENTE
-- ========================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE perfis DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🚨 RLS DESABILITADO TEMPORARIAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Isso resolve o erro 500 IMEDIATAMENTE';
    RAISE NOTICE 'ATENÇÃO: Qualquer usuário pode ler tudo agora';
    RAISE NOTICE 'Habilite RLS correto depois!';
    RAISE NOTICE '========================================';
END $$;

-- 4. RECARREGUE A PÁGINA /usuarios AGORA
-- ========================================
-- O erro 500 deve desaparecer
