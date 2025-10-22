-- ========================================
-- SCRIPT DE INICIALIZAÇÃO - SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ========================================

-- 1. CRIAR PERFIS
-- ========================================
CREATE TABLE IF NOT EXISTS perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CRIAR PERMISSÕES
-- ========================================
CREATE TABLE IF NOT EXISTS permissoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    modulo VARCHAR NOT NULL,
    acao VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. RELACIONAMENTO PERFIL-PERMISSÕES
-- ========================================
CREATE TABLE IF NOT EXISTS perfil_permissoes (
    perfil_id INTEGER REFERENCES perfis(id) ON DELETE CASCADE,
    permissao_id INTEGER REFERENCES permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (perfil_id, permissao_id)
);

-- 4. CRIAR TABELA USERS
-- ========================================
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

-- 5. INSERIR PERFIS PADRÃO
-- ========================================
DO $$
BEGIN
    INSERT INTO perfis (nome, descricao) VALUES ('Administrador', 'Acesso total ao sistema')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO perfis (nome, descricao) VALUES ('Gerente', 'Acesso a gestão de projetos e relatórios')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO perfis (nome, descricao) VALUES ('Operador', 'Acesso a operações básicas')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO perfis (nome, descricao) VALUES ('Financeiro', 'Acesso ao módulo financeiro')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO perfis (nome, descricao) VALUES ('Visualizador', 'Apenas visualização de dados')
    ON CONFLICT (nome) DO NOTHING;
END $$;

-- 6. INSERIR PERMISSÕES BÁSICAS
-- ========================================
DO $$
BEGIN
    -- Dashboard
    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('dashboard_view', 'Visualizar dashboard', 'dashboard', 'view')
    ON CONFLICT (nome) DO NOTHING;

    -- Contratos
    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('contratos_view', 'Visualizar contratos', 'contratos', 'view')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('contratos_create', 'Criar contratos', 'contratos', 'create')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('contratos_edit', 'Editar contratos', 'contratos', 'edit')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('contratos_delete', 'Excluir contratos', 'contratos', 'delete')
    ON CONFLICT (nome) DO NOTHING;

    -- Entidades
    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('entidades_view', 'Visualizar entidades', 'entidades', 'view')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('entidades_create', 'Criar entidades', 'entidades', 'create')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('entidades_edit', 'Editar entidades', 'entidades', 'edit')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('entidades_delete', 'Excluir entidades', 'entidades', 'delete')
    ON CONFLICT (nome) DO NOTHING;

    -- Financeiro
    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('financeiro_view', 'Visualizar financeiro', 'financeiro', 'view')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('financeiro_create', 'Criar movimentações', 'financeiro', 'create')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('financeiro_edit', 'Editar movimentações', 'financeiro', 'edit')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('financeiro_delete', 'Excluir movimentações', 'financeiro', 'delete')
    ON CONFLICT (nome) DO NOTHING;

    -- Configurações
    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('configuracoes_view', 'Visualizar configurações', 'configuracoes', 'view')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
    ('configuracoes_edit', 'Editar configurações', 'configuracoes', 'edit')
    ON CONFLICT (nome) DO NOTHING;
END $$;

-- 7. ATRIBUIR PERMISSÕES AO ADMINISTRADOR
-- ========================================
INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT
    (SELECT id FROM perfis WHERE nome = 'Administrador'),
    p.id
FROM permissoes p
WHERE NOT EXISTS (
    SELECT 1 FROM perfil_permissoes pp
    WHERE pp.perfil_id = (SELECT id FROM perfis WHERE nome = 'Administrador')
    AND pp.permissao_id = p.id
);

-- 8. HABILITAR RLS
-- ========================================
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLÍTICAS RLS
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_perfis" ON perfis;
CREATE POLICY "allow_authenticated_read_perfis" ON perfis
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_authenticated_read_permissoes" ON permissoes;
CREATE POLICY "allow_authenticated_read_permissoes" ON permissoes
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_authenticated_read_perfil_permissoes" ON perfil_permissoes;
CREATE POLICY "allow_authenticated_read_perfil_permissoes" ON perfil_permissoes
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_users_read_own" ON users;
CREATE POLICY "allow_users_read_own" ON users
FOR SELECT TO authenticated USING (auth.uid() = id);

-- 10. CONCEDER PERMISSÕES
-- ========================================
GRANT SELECT ON perfis TO authenticated;
GRANT SELECT ON permissoes TO authenticated;
GRANT SELECT ON perfil_permissoes TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ========================================
-- VERIFICAÇÃO
-- ========================================
SELECT 'Perfis criados:' as info, COUNT(*) as total FROM perfis;
SELECT 'Permissões criadas:' as info, COUNT(*) as total FROM permissoes;
SELECT 'Permissões do Admin:' as info, COUNT(*) as total
FROM perfil_permissoes pp
JOIN perfis p ON p.id = pp.perfil_id
WHERE p.nome = 'Administrador';

-- ========================================
-- PRÓXIMO PASSO: CRIAR USUÁRIO ADMIN
-- ========================================
-- Vá em: Authentication > Users > Add User
-- Email: admin@gestao-chevals.com
-- Senha: (defina uma senha forte)
-- Marcar: Auto Confirm User

-- Depois execute:
/*
INSERT INTO public.users (id, email, nome, perfil_id, ativo, primeiro_login)
SELECT
    auth.users.id,
    'admin@gestao-chevals.com',
    'Administrador do Sistema',
    (SELECT id FROM perfis WHERE nome = 'Administrador'),
    true,
    true
FROM auth.users
WHERE email = 'admin@gestao-chevals.com'
ON CONFLICT (id) DO NOTHING;
*/
