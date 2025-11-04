-- ========================================
-- CORRIGIR CONSTRAINTS NO BANCO EXISTENTE
-- Execute ANTES do SETUP_BANCO_NOVO.sql
-- ========================================

-- 1. VERIFICAR E ADICIONAR CONSTRAINT PRIMARY KEY EM perfil_permissoes
-- ========================================

-- Remover constraint antiga se existir
ALTER TABLE IF EXISTS perfil_permissoes
    DROP CONSTRAINT IF EXISTS perfil_permissoes_pkey;

-- Adicionar PRIMARY KEY composta
DO $$
BEGIN
    -- Verificar se a tabela existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'perfil_permissoes') THEN
        -- Adicionar constraint PRIMARY KEY se não existir
        IF NOT EXISTS (
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = 'perfil_permissoes'
            AND constraint_type = 'PRIMARY KEY'
        ) THEN
            ALTER TABLE perfil_permissoes
                ADD PRIMARY KEY (perfil_id, permissao_id);
            RAISE NOTICE 'PRIMARY KEY adicionada à tabela perfil_permissoes';
        ELSE
            RAISE NOTICE 'PRIMARY KEY já existe em perfil_permissoes';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela perfil_permissoes não existe ainda';
    END IF;
END $$;

-- 2. VERIFICAR CONSTRAINTS UNIQUE EM perfis
-- ========================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'perfis') THEN
        IF NOT EXISTS (
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = 'perfis'
            AND constraint_name = 'perfis_nome_key'
        ) THEN
            ALTER TABLE perfis ADD CONSTRAINT perfis_nome_key UNIQUE (nome);
            RAISE NOTICE 'UNIQUE constraint adicionada em perfis.nome';
        ELSE
            RAISE NOTICE 'UNIQUE constraint já existe em perfis.nome';
        END IF;
    END IF;
END $$;

-- 3. VERIFICAR CONSTRAINTS UNIQUE EM permissoes
-- ========================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'permissoes') THEN
        IF NOT EXISTS (
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = 'permissoes'
            AND constraint_name = 'permissoes_nome_key'
        ) THEN
            ALTER TABLE permissoes ADD CONSTRAINT permissoes_nome_key UNIQUE (nome);
            RAISE NOTICE 'UNIQUE constraint adicionada em permissoes.nome';
        ELSE
            RAISE NOTICE 'UNIQUE constraint já existe em permissoes.nome';
        END IF;
    END IF;
END $$;

-- 4. VERIFICAR CONSTRAINTS UNIQUE EM users
-- ========================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        IF NOT EXISTS (
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = 'users'
            AND constraint_name = 'users_email_key'
        ) THEN
            ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
            RAISE NOTICE 'UNIQUE constraint adicionada em users.email';
        ELSE
            RAISE NOTICE 'UNIQUE constraint já existe em users.email';
        END IF;
    END IF;
END $$;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================
SELECT
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('perfis', 'permissoes', 'perfil_permissoes', 'users')
ORDER BY table_name, constraint_type;
