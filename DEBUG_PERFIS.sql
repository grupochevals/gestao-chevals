-- ========================================
-- DEBUG: Verificar Perfis e Permissões RLS
-- ========================================

-- 1. VERIFICAR SE OS PERFIS EXISTEM
-- ========================================
SELECT
    id,
    nome,
    descricao,
    ativo,
    created_at
FROM perfis
ORDER BY id;

-- 2. VERIFICAR POLÍTICAS RLS EM PERFIS
-- ========================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'perfis';

-- 3. TESTAR ACESSO AOS PERFIS (simula consulta do frontend)
-- ========================================
SET LOCAL ROLE authenticated;
SELECT * FROM perfis WHERE ativo = true ORDER BY nome;
RESET ROLE;

-- 4. VERIFICAR SE HÁ PERFIS ATIVOS
-- ========================================
SELECT
    COUNT(*) as total_perfis,
    COUNT(*) FILTER (WHERE ativo = true) as perfis_ativos,
    COUNT(*) FILTER (WHERE ativo = false) as perfis_inativos
FROM perfis;

-- 5. SE NÃO HOUVER PERFIS, RECRIAR
-- ========================================
DO $$
DECLARE
    perfis_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO perfis_count FROM perfis;

    IF perfis_count = 0 THEN
        RAISE NOTICE 'Nenhum perfil encontrado! Recriando...';

        INSERT INTO perfis (nome, descricao, ativo) VALUES
        ('Administrador', 'Acesso total ao sistema', true),
        ('Gerente', 'Acesso a relatórios e gestão de eventos', true),
        ('Operador', 'Acesso básico para operações diárias', true),
        ('Financeiro', 'Acesso ao módulo financeiro', true),
        ('Visualizador', 'Apenas visualização de dados', true);

        RAISE NOTICE '✅ Perfis criados com sucesso!';
    ELSE
        RAISE NOTICE 'Encontrados % perfis no banco', perfis_count;
    END IF;
END $$;
