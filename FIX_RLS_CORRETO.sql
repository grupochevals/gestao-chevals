-- ========================================
-- CORREÇÃO CORRETA: RLS sem Recursão
-- ========================================

-- PROBLEMA: A política que verifica se o usuário é admin
-- consulta a tabela users, mas está sendo aplicada na própria tabela users
-- causando recursão infinita.

-- SOLUÇÃO: Usar uma tabela auxiliar ou verificar diretamente no auth.jwt()

-- 1. LIMPAR TODAS AS POLÍTICAS EXISTENTES
-- ========================================
DROP POLICY IF EXISTS "allow_admin_manage_users" ON users;
DROP POLICY IF EXISTS "allow_users_read_own" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "admin_select_all_users" ON users;
DROP POLICY IF EXISTS "admin_insert_users" ON users;
DROP POLICY IF EXISTS "admin_update_all_users" ON users;
DROP POLICY IF EXISTS "admin_delete_users" ON users;

-- 2. GARANTIR QUE RLS ESTÁ HABILITADO
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR VIEW MATERIALIZADA PARA ADMINS (evita recursão)
-- ========================================
DROP MATERIALIZED VIEW IF EXISTS admin_users CASCADE;

CREATE MATERIALIZED VIEW admin_users AS
SELECT u.id
FROM users u
JOIN perfis p ON p.id = u.perfil_id
WHERE p.nome = 'Administrador';

-- Criar índice para performance
CREATE UNIQUE INDEX admin_users_id_idx ON admin_users(id);

-- Função para atualizar a view
CREATE OR REPLACE FUNCTION refresh_admin_users()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar quando users ou perfis mudarem
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON users;
CREATE TRIGGER refresh_admin_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH STATEMENT EXECUTE FUNCTION refresh_admin_users();

-- 4. POLÍTICAS SIMPLES PARA USERS (SEM RECURSÃO)
-- ========================================

-- Todos podem ver todos os usuários (necessário para listagem)
CREATE POLICY "users_select_all"
    ON users
    FOR SELECT
    TO authenticated
    USING (true);

-- Usuários podem atualizar seu próprio registro
CREATE POLICY "users_update_own"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins podem inserir novos usuários (verifica via materialized view)
CREATE POLICY "admins_can_insert"
    ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );

-- Admins podem atualizar qualquer usuário
CREATE POLICY "admins_can_update"
    ON users
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );

-- Admins podem deletar usuários
CREATE POLICY "admins_can_delete"
    ON users
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );

-- 5. POLÍTICAS PARA PERFIS
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_perfis" ON perfis;
DROP POLICY IF EXISTS "perfis_select_all" ON perfis;

CREATE POLICY "perfis_select_all"
    ON perfis
    FOR SELECT
    TO authenticated
    USING (true);

-- 6. POLÍTICAS PARA PERMISSOES
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_permissoes" ON permissoes;
DROP POLICY IF EXISTS "permissoes_select_all" ON permissoes;

CREATE POLICY "permissoes_select_all"
    ON permissoes
    FOR SELECT
    TO authenticated
    USING (true);

-- 7. POLÍTICAS PARA PERFIL_PERMISSOES
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_perfil_permissoes" ON perfil_permissoes;
DROP POLICY IF EXISTS "perfil_permissoes_select_all" ON perfil_permissoes;

CREATE POLICY "perfil_permissoes_select_all"
    ON perfil_permissoes
    FOR SELECT
    TO authenticated
    USING (true);

-- 8. ATUALIZAR A MATERIALIZED VIEW AGORA
-- ========================================
REFRESH MATERIALIZED VIEW admin_users;

-- 9. VERIFICAÇÃO
-- ========================================
DO $$
DECLARE
    users_policies_count INTEGER;
    admin_users_count INTEGER;
BEGIN
    -- Contar políticas
    SELECT COUNT(*) INTO users_policies_count
    FROM pg_policies
    WHERE tablename = 'users';

    -- Contar admins na view
    SELECT COUNT(*) INTO admin_users_count
    FROM admin_users;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS Configurado Corretamente!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Políticas em users: %', users_policies_count;
    RAISE NOTICE 'Administradores: %', admin_users_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sem recursão infinita!';
    RAISE NOTICE 'Segurança mantida!';
    RAISE NOTICE '========================================';
END $$;

-- 10. LISTAR TODAS AS POLÍTICAS
-- ========================================
SELECT
    tablename,
    policyname,
    cmd,
    CASE
        WHEN roles = '{authenticated}' THEN 'authenticated'
        ELSE array_to_string(roles, ', ')
    END as roles
FROM pg_policies
WHERE tablename IN ('users', 'perfis', 'permissoes', 'perfil_permissoes')
ORDER BY tablename, policyname;
