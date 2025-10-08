-- ============================================================================
-- DIAGNÓSTICO COMPLETO DO BANCO DE DADOS
-- ============================================================================
-- Execute no SQL Editor para verificar a extensão da corrupção
-- ============================================================================

-- TESTE 1: Verificar estrutura da tabela auth.users
-- ----------------------------------------------------------------------------
SELECT
    'Estrutura auth.users' as teste,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- TESTE 2: Verificar estrutura da tabela auth.refresh_tokens
-- ----------------------------------------------------------------------------
SELECT
    'Estrutura auth.refresh_tokens' as teste,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'refresh_tokens'
ORDER BY ordinal_position;

-- TESTE 3: Tentar ler dados de auth.users
-- ----------------------------------------------------------------------------
SELECT
    'Teste de leitura auth.users' as teste,
    COUNT(*) as total,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmados,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as nao_confirmados
FROM auth.users;

-- TESTE 4: Verificar se há dados corrompidos
-- ----------------------------------------------------------------------------
SELECT
    'Usuários em auth.users' as fonte,
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE
        WHEN email_confirmed_at IS NULL THEN 'Não confirmado'
        ELSE 'Confirmado'
    END as status
FROM auth.users
LIMIT 10;

-- TESTE 5: Verificar tabela public.users
-- ----------------------------------------------------------------------------
SELECT
    'Usuários em public.users' as fonte,
    id,
    email,
    nome,
    perfil_id,
    ativo,
    primeiro_login
FROM public.users;

-- TESTE 6: Verificar perfis disponíveis
-- ----------------------------------------------------------------------------
SELECT
    'Perfis disponíveis' as teste,
    id,
    nome,
    descricao,
    ativo
FROM public.perfis;

-- ============================================================================
-- ANÁLISE DOS RESULTADOS:
-- ============================================================================
-- Se TESTE 1 ou TESTE 2 mostrarem tipos de dados incorretos (varchar vs uuid),
-- isso confirma CORRUPÇÃO ESTRUTURAL no schema auth.
--
-- RECOMENDAÇÃO: Criar novo projeto Supabase
-- ============================================================================
