-- ========================================
-- PERMISSÕES DO MÓDULO DE USUÁRIOS
-- ========================================

-- 1. ADICIONAR PERMISSÕES DE USUÁRIOS
-- ========================================
INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
('usuarios_view', 'Visualizar usuários', 'usuarios', 'view'),
('usuarios_create', 'Criar usuários', 'usuarios', 'create'),
('usuarios_edit', 'Editar usuários', 'usuarios', 'edit'),
('usuarios_delete', 'Excluir usuários', 'usuarios', 'delete'),
('usuarios_manage_permissions', 'Gerenciar permissões de usuários', 'usuarios', 'manage_permissions')
ON CONFLICT (modulo, acao) DO UPDATE
SET descricao = EXCLUDED.descricao;

-- 2. ATRIBUIR PERMISSÕES AO ADMINISTRADOR
-- ========================================
INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT
    (SELECT id FROM perfis WHERE nome = 'Administrador'),
    p.id
FROM permissoes p
WHERE p.modulo = 'usuarios'
ON CONFLICT (perfil_id, permissao_id) DO NOTHING;

-- 3. CRIAR POLÍTICA RLS PARA ADMIN GERENCIAR TODOS OS USUÁRIOS
-- ========================================
DROP POLICY IF EXISTS "allow_admin_manage_users" ON users;

CREATE POLICY "allow_admin_manage_users"
    ON users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM users u
            JOIN perfis p ON p.id = u.perfil_id
            WHERE u.id = auth.uid()
            AND p.nome = 'Administrador'
        )
    );

-- 4. VERIFICAÇÃO
-- ========================================
DO $$
DECLARE
    permissoes_usuarios_count INTEGER;
    admin_usuarios_perms_count INTEGER;
BEGIN
    -- Contar permissões de usuários
    SELECT COUNT(*) INTO permissoes_usuarios_count
    FROM permissoes
    WHERE modulo = 'usuarios';

    -- Contar permissões do admin para usuários
    SELECT COUNT(*) INTO admin_usuarios_perms_count
    FROM perfil_permissoes pp
    JOIN permissoes p ON p.id = pp.permissao_id
    JOIN perfis pf ON pf.id = pp.perfil_id
    WHERE pf.nome = 'Administrador'
    AND p.modulo = 'usuarios';

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Permissões de Usuários configuradas!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Permissões de usuários criadas: %', permissoes_usuarios_count;
    RAISE NOTICE 'Permissões do Administrador: %', admin_usuarios_perms_count;
    RAISE NOTICE '========================================';
END $$;
