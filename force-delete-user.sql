-- ============================================================================
-- SCRIPT PARA FORÇAR DELEÇÃO DE USUÁRIO CORROMPIDO
-- ============================================================================
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================================

-- ETAPA 1: Encontrar o ID do usuário
-- ----------------------------------------------------------------------------
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'admin@gestao-chevals.com';

-- Copie o ID retornado acima e use nas próximas etapas
-- Exemplo: 12345678-1234-1234-1234-123456789abc

-- ETAPA 2: Deletar dados relacionados (use o ID copiado acima)
-- ----------------------------------------------------------------------------
-- IMPORTANTE: Substitua 'USER_ID_AQUI' pelo ID que você copiou acima

DO $$
DECLARE
    user_id_to_delete UUID;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO user_id_to_delete
    FROM auth.users
    WHERE email = 'admin@gestao-chevals.com'
    LIMIT 1;

    IF user_id_to_delete IS NULL THEN
        RAISE NOTICE 'Usuário não encontrado';
        RETURN;
    END IF;

    RAISE NOTICE 'Deletando dados do usuário: %', user_id_to_delete;

    -- Deletar de public.users primeiro
    DELETE FROM public.users WHERE id = user_id_to_delete;
    RAISE NOTICE 'Deletado de public.users';

    -- Deletar identidades
    DELETE FROM auth.identities WHERE user_id = user_id_to_delete;
    RAISE NOTICE 'Deletado de auth.identities';

    -- Deletar refresh tokens
    DELETE FROM auth.refresh_tokens WHERE user_id = user_id_to_delete;
    RAISE NOTICE 'Deletado de auth.refresh_tokens';

    -- Deletar sessões
    DELETE FROM auth.sessions WHERE user_id = user_id_to_delete;
    RAISE NOTICE 'Deletado de auth.sessions';

    -- Deletar MFA factors
    DELETE FROM auth.mfa_factors WHERE user_id = user_id_to_delete;
    RAISE NOTICE 'Deletado de auth.mfa_factors';

    -- Deletar MFA challenges
    DELETE FROM auth.mfa_challenges
    WHERE factor_id IN (
        SELECT id FROM auth.mfa_factors WHERE user_id = user_id_to_delete
    );
    RAISE NOTICE 'Deletado de auth.mfa_challenges';

    -- Finalmente, deletar o usuário
    DELETE FROM auth.users WHERE id = user_id_to_delete;
    RAISE NOTICE 'Deletado de auth.users';

    RAISE NOTICE 'Usuário deletado com sucesso!';
END $$;

-- ETAPA 3: Verificar se foi deletado
-- ----------------------------------------------------------------------------
SELECT
    'Verificação após deleção' as status,
    (SELECT count(*) FROM auth.users WHERE email = 'admin@gestao-chevals.com') as usuarios_auth,
    (SELECT count(*) FROM public.users WHERE email = 'admin@gestao-chevals.com') as usuarios_public;

-- ============================================================================
-- PRÓXIMO PASSO:
-- ============================================================================
-- Agora crie um NOVO usuário no Dashboard:
-- Authentication > Users > Add User
-- Email: admin@gestao-chevals.com
-- Password: admin123
-- ✅ Marcar "Auto Confirm User"
-- ============================================================================
