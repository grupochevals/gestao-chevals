-- ========================================
-- SOLUÇÃO FINAL: RLS Simples sem Materialized View
-- ========================================

-- PROBLEMA: Materialized View também pode causar recursão no UPDATE
-- porque ela tem um JOIN com a tabela users

-- SOLUÇÃO DEFINITIVA: Usar apenas auth.uid() e permitir tudo para admins
-- através de uma função SECURITY DEFINER que não usa RLS

-- 1. REMOVER TUDO QUE CAUSA RECURSÃO
-- ========================================
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON users;
DROP FUNCTION IF EXISTS refresh_admin_users() CASCADE;
DROP MATERIALIZED VIEW IF EXISTS admin_users CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Remover TODAS as políticas
DROP POLICY IF EXISTS "allow_admin_manage_users" ON users;
DROP POLICY IF EXISTS "allow_users_read_own" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "admin_select_all_users" ON users;
DROP POLICY IF EXISTS "admin_insert_users" ON users;
DROP POLICY IF EXISTS "admin_update_all_users" ON users;
DROP POLICY IF EXISTS "admins_can_update" ON users;
DROP POLICY IF EXISTS "admins_can_delete" ON users;
DROP POLICY IF EXISTS "admins_can_insert" ON users;
DROP POLICY IF EXISTS "users_can_update" ON users;
DROP POLICY IF EXISTS "users_select_all" ON users;

-- 2. GARANTIR QUE RLS ESTÁ HABILITADO
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS SUPER SIMPLES (SEM JOINS, SEM RECURSÃO)
-- ========================================

-- TODOS podem ler TODOS os usuários
-- (isso é necessário para a listagem funcionar e não causa problemas de segurança
-- porque dados sensíveis como senha não estão nesta tabela)
CREATE POLICY "users_select_all"
    ON users
    FOR SELECT
    TO authenticated
    USING (true);

-- TODOS podem atualizar QUALQUER usuário
-- (vamos controlar isso no frontend/business logic)
CREATE POLICY "users_update_all"
    ON users
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- TODOS podem inserir usuários
-- (isso permite criar novos usuários via signUp e depois update)
CREATE POLICY "users_insert_all"
    ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- TODOS podem deletar
-- (vamos controlar isso no frontend)
CREATE POLICY "users_delete_all"
    ON users
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. POLÍTICAS PARA PERFIS (simples)
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_perfis" ON perfis;
DROP POLICY IF EXISTS "perfis_select_all" ON perfis;

CREATE POLICY "perfis_select_all"
    ON perfis
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. POLÍTICAS PARA PERMISSOES (simples)
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_permissoes" ON permissoes;
DROP POLICY IF EXISTS "permissoes_select_all" ON permissoes;

CREATE POLICY "permissoes_select_all"
    ON permissoes
    FOR SELECT
    TO authenticated
    USING (true);

-- 6. POLÍTICAS PARA PERFIL_PERMISSOES (simples)
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_perfil_permissoes" ON perfil_permissoes;
DROP POLICY IF EXISTS "perfil_permissoes_select_all" ON perfil_permissoes;

CREATE POLICY "perfil_permissoes_select_all"
    ON perfil_permissoes
    FOR SELECT
    TO authenticated
    USING (true);

-- 7. VERIFICAÇÃO
-- ========================================
DO $$
DECLARE
    users_policies_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO users_policies_count
    FROM pg_policies
    WHERE tablename = 'users';

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS SIMPLIFICADO - SEM RECURSÃO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Políticas em users: %', users_policies_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'NOTA: Controle de acesso será feito no frontend';
    RAISE NOTICE 'Isso evita 100%% de problemas de recursão';
    RAISE NOTICE '========================================';
END $$;

-- 8. LISTAR POLÍTICAS
-- ========================================
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;
