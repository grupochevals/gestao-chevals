-- ========================================
-- SETUP INCREMENTAL - SUPABASE
-- Este script pode ser executado múltiplas vezes sem erros
-- ========================================

-- 1. CRIAR/VERIFICAR TABELAS
-- ========================================

-- Perfis
CREATE TABLE IF NOT EXISTS perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissões
CREATE TABLE IF NOT EXISTS permissoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    modulo VARCHAR NOT NULL,
    acao VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(modulo, acao)
);

-- Perfil-Permissões
CREATE TABLE IF NOT EXISTS perfil_permissoes (
    perfil_id INTEGER REFERENCES perfis(id) ON DELETE CASCADE,
    permissao_id INTEGER REFERENCES permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (perfil_id, permissao_id)
);

-- Users
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

-- 2. INSERIR/ATUALIZAR PERFIS
-- ========================================
DO $$
BEGIN
    -- Administrador
    IF NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'Administrador') THEN
        INSERT INTO perfis (nome, descricao) VALUES ('Administrador', 'Acesso total ao sistema');
    END IF;

    -- Gerente
    IF NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'Gerente') THEN
        INSERT INTO perfis (nome, descricao) VALUES ('Gerente', 'Acesso a relatórios e gestão de eventos');
    END IF;

    -- Operador
    IF NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'Operador') THEN
        INSERT INTO perfis (nome, descricao) VALUES ('Operador', 'Acesso básico para operações diárias');
    END IF;

    -- Financeiro
    IF NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'Financeiro') THEN
        INSERT INTO perfis (nome, descricao) VALUES ('Financeiro', 'Acesso ao módulo financeiro');
    END IF;

    -- Visualizador
    IF NOT EXISTS (SELECT 1 FROM perfis WHERE nome = 'Visualizador') THEN
        INSERT INTO perfis (nome, descricao) VALUES ('Visualizador', 'Apenas visualização de dados');
    END IF;
END $$;

-- 3. INSERIR/ATUALIZAR PERMISSÕES (COM UPSERT)
-- ========================================
DO $$
BEGIN
    -- Dashboard
    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('dashboard_view', 'Visualizar dashboard', 'dashboard', 'view')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    -- Contratos
    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('contratos_view', 'Visualizar contratos', 'contratos', 'view')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('contratos_create', 'Criar contratos', 'contratos', 'create')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('contratos_edit', 'Editar contratos', 'contratos', 'edit')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('contratos_delete', 'Excluir contratos', 'contratos', 'delete')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    -- Entidades
    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('entidades_view', 'Visualizar entidades', 'entidades', 'view')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('entidades_create', 'Criar entidades', 'entidades', 'create')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('entidades_edit', 'Editar entidades', 'entidades', 'edit')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('entidades_delete', 'Excluir entidades', 'entidades', 'delete')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    -- Unidades
    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('unidades_view', 'Visualizar unidades', 'unidades', 'view')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('unidades_create', 'Criar unidades', 'unidades', 'create')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('unidades_edit', 'Editar unidades', 'unidades', 'edit')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('unidades_delete', 'Excluir unidades', 'unidades', 'delete')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    -- Projetos
    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('projetos_view', 'Visualizar projetos', 'projetos', 'view')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('projetos_create', 'Criar projetos', 'projetos', 'create')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('projetos_edit', 'Editar projetos', 'projetos', 'edit')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('projetos_delete', 'Excluir projetos', 'projetos', 'delete')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    -- Financeiro
    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('financeiro_view', 'Visualizar financeiro', 'financeiro', 'view')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('financeiro_create', 'Criar movimentações', 'financeiro', 'create')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('financeiro_edit', 'Editar movimentações', 'financeiro', 'edit')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('financeiro_delete', 'Excluir movimentações', 'financeiro', 'delete')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    -- Tickets
    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('tickets_view', 'Visualizar tickets', 'tickets', 'view')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('tickets_create', 'Criar tickets', 'tickets', 'create')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('tickets_edit', 'Editar tickets', 'tickets', 'edit')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    -- Configurações
    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('configuracoes_view', 'Visualizar configurações', 'configuracoes', 'view')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;

    INSERT INTO permissoes (nome, descricao, modulo, acao)
    VALUES ('configuracoes_edit', 'Editar configurações', 'configuracoes', 'edit')
    ON CONFLICT (modulo, acao) DO UPDATE
    SET descricao = EXCLUDED.descricao;
END $$;

-- 4. ATRIBUIR PERMISSÕES AO ADMINISTRADOR
-- ========================================
DO $$
DECLARE
    admin_id INTEGER;
    perm_id INTEGER;
BEGIN
    -- Buscar ID do perfil Administrador
    SELECT id INTO admin_id FROM perfis WHERE nome = 'Administrador';

    IF admin_id IS NOT NULL THEN
        -- Atribuir todas as permissões que ainda não foram atribuídas
        FOR perm_id IN (SELECT id FROM permissoes) LOOP
            IF NOT EXISTS (
                SELECT 1 FROM perfil_permissoes
                WHERE perfil_id = admin_id AND permissao_id = perm_id
            ) THEN
                INSERT INTO perfil_permissoes (perfil_id, permissao_id)
                VALUES (admin_id, perm_id);
            END IF;
        END LOOP;
    END IF;
END $$;

-- 5. CRIAR FUNÇÃO PARA UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. CRIAR TRIGGERS
-- ========================================
DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
CREATE TRIGGER update_perfis_updated_at
    BEFORE UPDATE ON perfis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permissoes_updated_at ON permissoes;
CREATE TRIGGER update_permissoes_updated_at
    BEFORE UPDATE ON permissoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. HABILITAR RLS
-- ========================================
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICAS RLS
-- ========================================
DROP POLICY IF EXISTS "allow_authenticated_read_perfis" ON perfis;
CREATE POLICY "allow_authenticated_read_perfis"
    ON perfis FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "allow_authenticated_read_permissoes" ON permissoes;
CREATE POLICY "allow_authenticated_read_permissoes"
    ON permissoes FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "allow_authenticated_read_perfil_permissoes" ON perfil_permissoes;
CREATE POLICY "allow_authenticated_read_perfil_permissoes"
    ON perfil_permissoes FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "allow_users_read_own" ON users;
CREATE POLICY "allow_users_read_own"
    ON users FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 9. CONCEDER PERMISSÕES
-- ========================================
GRANT SELECT ON perfis TO authenticated;
GRANT SELECT ON permissoes TO authenticated;
GRANT SELECT ON perfil_permissoes TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ========================================
-- 10. VERIFICAÇÃO FINAL
-- ========================================
DO $$
DECLARE
    perfis_count INTEGER;
    permissoes_count INTEGER;
    admin_perms_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO perfis_count FROM perfis;
    SELECT COUNT(*) INTO permissoes_count FROM permissoes;
    SELECT COUNT(*) INTO admin_perms_count
    FROM perfil_permissoes pp
    JOIN perfis p ON p.id = pp.perfil_id
    WHERE p.nome = 'Administrador';

    RAISE NOTICE '✅ Setup completado!';
    RAISE NOTICE 'Perfis criados: %', perfis_count;
    RAISE NOTICE 'Permissões criadas: %', permissoes_count;
    RAISE NOTICE 'Permissões do Administrador: %', admin_perms_count;
END $$;

-- ========================================
-- PRÓXIMO PASSO: CRIAR USUÁRIO ADMIN
-- ========================================
/*
1. Vá em: Authentication > Users > Add User
   - Email: admin@gestao-chevals.com
   - Senha: (defina uma senha forte)
   - Marcar: Auto Confirm User

2. Depois execute este SQL:

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
ON CONFLICT (id) DO UPDATE
SET perfil_id = EXCLUDED.perfil_id;

3. Verificar:

SELECT
    u.id,
    u.email,
    u.nome,
    p.nome as perfil,
    COUNT(pp.permissao_id) as total_permissoes
FROM users u
JOIN perfis p ON p.id = u.perfil_id
LEFT JOIN perfil_permissoes pp ON pp.perfil_id = u.perfil_id
WHERE u.email = 'admin@gestao-chevals.com'
GROUP BY u.id, u.email, u.nome, p.nome;
*/
