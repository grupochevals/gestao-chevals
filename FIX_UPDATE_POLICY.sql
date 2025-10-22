-- ========================================
-- CORREÇÃO: Política de UPDATE conflitante
-- ========================================

-- PROBLEMA: Duas políticas UPDATE causando conflito:
-- 1. users_update_own (permite atualizar próprio perfil)
-- 2. admins_can_update (permite admin atualizar qualquer um)
-- Elas se sobrepõem e causam erro 500

-- SOLUÇÃO: Remover as políticas separadas e criar UMA política combinada

-- 1. REMOVER POLÍTICAS DE UPDATE CONFLITANTES
-- ========================================
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "admins_can_update" ON users;

-- 2. CRIAR POLÍTICA ÚNICA DE UPDATE (usuário OU admin)
-- ========================================
CREATE POLICY "users_can_update"
    ON users
    FOR UPDATE
    TO authenticated
    USING (
        -- Pode atualizar se:
        -- 1. É o próprio usuário OU
        -- 2. É um administrador
        auth.uid() = id
        OR
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    )
    WITH CHECK (
        -- Mesmo check para garantir consistência
        auth.uid() = id
        OR
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );

-- 3. VERIFICAR POLÍTICAS
-- ========================================
DO $$
DECLARE
    update_policies_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO update_policies_count
    FROM pg_policies
    WHERE tablename = 'users' AND cmd = 'UPDATE';

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Política de UPDATE corrigida!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Políticas UPDATE em users: %', update_policies_count;
    RAISE NOTICE '========================================';
END $$;

-- 4. LISTAR TODAS AS POLÍTICAS DE USERS
-- ========================================
SELECT
    policyname,
    cmd,
    qual::text as using_expression,
    with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;
