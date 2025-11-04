-- ========================================
-- SETUP COMPLETO - NOVO BANCO SUPABASE
-- Database: irtnaxveqpjhcjyagbzc
-- Execute este script no SQL Editor do Supabase
-- ========================================

-- PASSO 1: CRIAR TABELAS
-- ========================================

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    modulo VARCHAR NOT NULL,
    acao VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de relacionamento perfil-permissões
CREATE TABLE IF NOT EXISTS perfil_permissoes (
    perfil_id INTEGER REFERENCES perfis(id) ON DELETE CASCADE,
    permissao_id INTEGER REFERENCES permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (perfil_id, permissao_id)
);

-- Tabela de usuários (estende auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    perfil_id INTEGER REFERENCES perfis(id),
    nome VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    primeiro_login BOOLEAN DEFAULT true,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PASSO 2: INSERIR PERFIS
-- ========================================
INSERT INTO perfis (nome, descricao) VALUES
    ('Administrador', 'Acesso total ao sistema'),
    ('Gerente', 'Acesso a gestão de projetos e relatórios'),
    ('Operador', 'Acesso a operações básicas'),
    ('Financeiro', 'Acesso ao módulo financeiro'),
    ('Visualizador', 'Apenas visualização de dados')
ON CONFLICT (nome) DO NOTHING;

-- PASSO 3: INSERIR PERMISSÕES
-- ========================================
-- Garantir que existe constraint UNIQUE em (modulo, acao)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'permissoes'
        AND constraint_name = 'permissoes_modulo_acao_key'
    ) THEN
        ALTER TABLE permissoes ADD CONSTRAINT permissoes_modulo_acao_key UNIQUE (modulo, acao);
    END IF;
END $$;

-- Inserir permissões usando INSERT com ON CONFLICT
INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    -- Dashboard
    ('dashboard_view', 'Visualizar dashboard', 'dashboard', 'view'),

    -- Contratos
    ('contratos_view', 'Visualizar contratos', 'contratos', 'view'),
    ('contratos_create', 'Criar contratos', 'contratos', 'create'),
    ('contratos_edit', 'Editar contratos', 'contratos', 'edit'),
    ('contratos_delete', 'Excluir contratos', 'contratos', 'delete'),

    -- Entidades
    ('entidades_view', 'Visualizar entidades', 'entidades', 'view'),
    ('entidades_create', 'Criar entidades', 'entidades', 'create'),
    ('entidades_edit', 'Editar entidades', 'entidades', 'edit'),
    ('entidades_delete', 'Excluir entidades', 'entidades', 'delete'),

    -- Unidades
    ('unidades_view', 'Visualizar unidades', 'unidades', 'view'),
    ('unidades_create', 'Criar unidades', 'unidades', 'create'),
    ('unidades_edit', 'Editar unidades', 'unidades', 'edit'),
    ('unidades_delete', 'Excluir unidades', 'unidades', 'delete'),

    -- Projetos
    ('projetos_view', 'Visualizar projetos', 'projetos', 'view'),
    ('projetos_create', 'Criar projetos', 'projetos', 'create'),
    ('projetos_edit', 'Editar projetos', 'projetos', 'edit'),
    ('projetos_delete', 'Excluir projetos', 'projetos', 'delete'),

    -- Financeiro
    ('financeiro_view', 'Visualizar financeiro', 'financeiro', 'view'),
    ('financeiro_create', 'Criar movimentações', 'financeiro', 'create'),
    ('financeiro_edit', 'Editar movimentações', 'financeiro', 'edit'),
    ('financeiro_delete', 'Excluir movimentações', 'financeiro', 'delete'),

    -- Relatórios
    ('relatorios_view', 'Visualizar relatórios', 'relatorios', 'view'),
    ('relatorios_export', 'Exportar relatórios', 'relatorios', 'export'),

    -- Configurações
    ('configuracoes_view', 'Visualizar configurações', 'configuracoes', 'view'),
    ('configuracoes_edit', 'Editar configurações', 'configuracoes', 'edit'),

    -- Usuários
    ('usuarios_view', 'Visualizar usuários', 'usuarios', 'view'),
    ('usuarios_create', 'Criar usuários', 'usuarios', 'create'),
    ('usuarios_edit', 'Editar usuários', 'usuarios', 'edit'),
    ('usuarios_delete', 'Excluir usuários', 'usuarios', 'delete')
ON CONFLICT (modulo, acao) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao;

-- PASSO 4: ATRIBUIR TODAS AS PERMISSÕES AO ADMINISTRADOR
-- ========================================
-- Usar abordagem com WHERE NOT EXISTS para evitar duplicatas
INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT
    (SELECT id FROM perfis WHERE nome = 'Administrador') as perfil_id,
    p.id as permissao_id
FROM permissoes p
WHERE NOT EXISTS (
    SELECT 1
    FROM perfil_permissoes pp
    WHERE pp.perfil_id = (SELECT id FROM perfis WHERE nome = 'Administrador')
    AND pp.permissao_id = p.id
);

-- PASSO 5: CRIAR TRIGGER PARA AUTO-VINCULAR USUÁRIOS
-- ========================================
-- Função para criar entrada automática na tabela users quando um usuário é criado no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar entrada na tabela users
    INSERT INTO public.users (id, email, nome, perfil_id, ativo, primeiro_login)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', SPLIT_PART(NEW.email, '@', 1)),
        (SELECT id FROM perfis WHERE nome = 'Visualizador' LIMIT 1),
        true,
        true
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- PASSO 6: HABILITAR RLS (Row Level Security)
-- ========================================
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler perfis
CREATE POLICY "Perfis são visíveis para todos usuários autenticados"
    ON perfis FOR SELECT
    TO authenticated
    USING (true);

-- Política: Todos podem ler permissões
CREATE POLICY "Permissões são visíveis para todos usuários autenticados"
    ON permissoes FOR SELECT
    TO authenticated
    USING (true);

-- Política: Todos podem ler perfil_permissoes
CREATE POLICY "Perfil permissões são visíveis para todos usuários autenticados"
    ON perfil_permissoes FOR SELECT
    TO authenticated
    USING (true);

-- Política: Usuários podem ver todos os usuários
CREATE POLICY "Usuários podem ver outros usuários"
    ON users FOR SELECT
    TO authenticated
    USING (true);

-- Política: Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Usuários podem atualizar próprios dados"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- ========================================
-- FIM DO SCRIPT DE SETUP
-- ========================================

-- VERIFICAÇÃO: Execute para confirmar que tudo foi criado
SELECT 'Perfis criados:' as info, COUNT(*) as total FROM perfis;
SELECT 'Permissões criadas:' as info, COUNT(*) as total FROM permissoes;
SELECT 'Perfil Admin tem permissões:' as info, COUNT(*) as total
FROM perfil_permissoes
WHERE perfil_id = (SELECT id FROM perfis WHERE nome = 'Administrador');
