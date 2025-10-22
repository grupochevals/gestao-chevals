-- ========================================
-- CORREÇÃO: Políticas RLS causando erro 500
-- ========================================

-- PROBLEMA: A política "allow_admin_manage_users" causa recursão infinita
-- porque ela consulta a tabela users para verificar permissões,
-- mas está sendo aplicada na própria tabela users.

-- 1. REMOVER POLÍTICA PROBLEMÁTICA
-- ========================================
DROP POLICY IF EXISTS "allow_admin_manage_users" ON users;

-- 2. CRIAR POLÍTICAS CORRETAS
-- ========================================

-- Política 1: Usuários podem ver seu próprio registro
CREATE POLICY "users_select_own"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Política 2: Usuários podem atualizar seu próprio registro
CREATE POLICY "users_update_own"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Política 3: Service role pode fazer tudo (usado pelo backend)
-- (Não precisa criar política pois service_role bypassa RLS)

-- 3. PERMITIR LEITURA DE PERFIS PARA TODOS AUTENTICADOS
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_perfis" ON perfis;

CREATE POLICY "perfis_select_all"
    ON perfis
    FOR SELECT
    TO authenticated
    USING (true);

-- 4. PERMITIR LEITURA DE PERMISSÕES PARA TODOS AUTENTICADOS
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_permissoes" ON permissoes;

CREATE POLICY "permissoes_select_all"
    ON permissoes
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. PERMITIR LEITURA DE PERFIL_PERMISSOES PARA TODOS AUTENTICADOS
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_perfil_permissoes" ON perfil_permissoes;

CREATE POLICY "perfil_permissoes_select_all"
    ON perfil_permissoes
    FOR SELECT
    TO authenticated
    USING (true);

-- 6. CRIAR FUNÇÃO PARA VERIFICAR SE USUÁRIO É ADMIN
-- ========================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM users u
        JOIN perfis p ON p.id = u.perfil_id
        WHERE u.id = auth.uid()
        AND p.nome = 'Administrador'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. POLÍTICAS PARA ADMINS GERENCIAREM OUTROS USUÁRIOS
-- ========================================

-- Admin pode ver todos os usuários
CREATE POLICY "admin_select_all_users"
    ON users
    FOR SELECT
    TO authenticated
    USING (is_admin());

-- Admin pode inserir novos usuários
CREATE POLICY "admin_insert_users"
    ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Admin pode atualizar outros usuários
CREATE POLICY "admin_update_all_users"
    ON users
    FOR UPDATE
    TO authenticated
    USING (is_admin());

-- Admin pode deletar usuários
CREATE POLICY "admin_delete_users"
    ON users
    FOR DELETE
    TO authenticated
    USING (is_admin());

-- 8. VERIFICAÇÃO
-- ========================================
DO $$
DECLARE
    policies_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policies_count
    FROM pg_policies
    WHERE tablename = 'users';

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Políticas RLS corrigidas!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Políticas na tabela users: %', policies_count;
    RAISE NOTICE '========================================';
END $$;

-- 9. LISTAR TODAS AS POLÍTICAS
-- ========================================
SELECT
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('users', 'perfis', 'permissoes', 'perfil_permissoes')
ORDER BY tablename, policyname;
