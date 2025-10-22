-- ========================================
-- CORREÇÃO: Tipo de perfil_id
-- Este script corrige a incompatibilidade de tipos
-- ========================================

-- IMPORTANTE: Este script vai recriar as tabelas de perfis/permissões
-- Se você já tem dados importantes nelas, faça backup primeiro!

-- 1. VERIFICAR TIPO ATUAL
-- ========================================
DO $$
DECLARE
    current_type TEXT;
BEGIN
    SELECT data_type INTO current_type
    FROM information_schema.columns
    WHERE table_name = 'perfis' AND column_name = 'id';

    RAISE NOTICE 'Tipo atual de perfis.id: %', current_type;
END $$;

-- 2. DROPAR TABELAS DEPENDENTES (em ordem correta)
-- ========================================
DROP TABLE IF EXISTS perfil_permissoes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS perfis CASCADE;
DROP TABLE IF EXISTS permissoes CASCADE;

-- 3. RECRIAR PERFIS COM INTEGER
-- ========================================
CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. RECRIAR PERMISSÕES COM INTEGER
-- ========================================
CREATE TABLE permissoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    modulo VARCHAR NOT NULL,
    acao VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(modulo, acao)
);

-- 5. RECRIAR PERFIL_PERMISSOES
-- ========================================
CREATE TABLE perfil_permissoes (
    perfil_id INTEGER REFERENCES perfis(id) ON DELETE CASCADE,
    permissao_id INTEGER REFERENCES permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (perfil_id, permissao_id)
);

-- 6. RECRIAR USERS COM INTEGER
-- ========================================
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    perfil_id INTEGER REFERENCES perfis(id),
    nome VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    primeiro_login BOOLEAN DEFAULT true,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. INSERIR PERFIS
-- ========================================
INSERT INTO perfis (nome, descricao) VALUES
('Administrador', 'Acesso total ao sistema'),
('Gerente', 'Acesso a relatórios e gestão de eventos'),
('Operador', 'Acesso básico para operações diárias'),
('Financeiro', 'Acesso ao módulo financeiro'),
('Visualizador', 'Apenas visualização de dados');

-- 8. INSERIR PERMISSÕES
-- ========================================
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

-- Tickets
('tickets_view', 'Visualizar tickets', 'tickets', 'view'),
('tickets_create', 'Criar tickets', 'tickets', 'create'),
('tickets_edit', 'Editar tickets', 'tickets', 'edit'),

-- Configurações
('configuracoes_view', 'Visualizar configurações', 'configuracoes', 'view'),
('configuracoes_edit', 'Editar configurações', 'configuracoes', 'edit');

-- 9. ATRIBUIR PERMISSÕES AO ADMINISTRADOR
-- ========================================
INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT
    (SELECT id FROM perfis WHERE nome = 'Administrador'),
    p.id
FROM permissoes p;

-- 10. CRIAR FUNÇÃO UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. CRIAR TRIGGERS
-- ========================================
CREATE TRIGGER update_perfis_updated_at
    BEFORE UPDATE ON perfis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissoes_updated_at
    BEFORE UPDATE ON permissoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. HABILITAR RLS
-- ========================================
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 13. CRIAR POLÍTICAS RLS
-- ========================================
CREATE POLICY "allow_authenticated_read_perfis"
    ON perfis FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_authenticated_read_permissoes"
    ON permissoes FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_authenticated_read_perfil_permissoes"
    ON perfil_permissoes FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_users_read_own"
    ON users FOR SELECT TO authenticated USING (auth.uid() = id);

-- 14. CONCEDER PERMISSÕES
-- ========================================
GRANT SELECT ON perfis TO authenticated;
GRANT SELECT ON permissoes TO authenticated;
GRANT SELECT ON perfil_permissoes TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ========================================
-- 15. VERIFICAÇÃO FINAL
-- ========================================
DO $$
DECLARE
    perfis_count INTEGER;
    permissoes_count INTEGER;
    admin_perms_count INTEGER;
    perfil_id_type TEXT;
BEGIN
    -- Verificar tipo
    SELECT data_type INTO perfil_id_type
    FROM information_schema.columns
    WHERE table_name = 'perfis' AND column_name = 'id';

    -- Contar dados
    SELECT COUNT(*) INTO perfis_count FROM perfis;
    SELECT COUNT(*) INTO permissoes_count FROM permissoes;
    SELECT COUNT(*) INTO admin_perms_count
    FROM perfil_permissoes pp
    JOIN perfis p ON p.id = pp.perfil_id
    WHERE p.nome = 'Administrador';

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Correção completada!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tipo de perfis.id: %', perfil_id_type;
    RAISE NOTICE 'Perfis criados: %', perfis_count;
    RAISE NOTICE 'Permissões criadas: %', permissoes_count;
    RAISE NOTICE 'Permissões do Administrador: %', admin_perms_count;
    RAISE NOTICE '========================================';
END $$;

-- ========================================
-- PRÓXIMO PASSO: CRIAR USUÁRIO ADMIN
-- ========================================
/*
AGORA VOCÊ PODE:

1. Criar usuário no Supabase Auth:
   - Authentication > Users > Add User
   - Email: admin@gestao-chevals.com
   - Senha: (sua escolha - forte!)
   - ✅ Marcar: Auto Confirm User

2. Vincular ao perfil de Administrador:

INSERT INTO public.users (id, email, nome, perfil_id, ativo, primeiro_login)
SELECT
    auth.users.id,
    'admin@gestao-chevals.com',
    'Administrador do Sistema',
    (SELECT id FROM perfis WHERE nome = 'Administrador'),
    true,
    true
FROM auth.users
WHERE email = 'admin@gestao-chevals.com';

3. Verificar tudo:

SELECT
    u.id,
    u.email,
    u.nome,
    u.perfil_id,
    p.nome as perfil,
    COUNT(pp.permissao_id) as total_permissoes
FROM users u
JOIN perfis p ON p.id = u.perfil_id
LEFT JOIN perfil_permissoes pp ON pp.perfil_id = u.perfil_id
WHERE u.email = 'admin@gestao-chevals.com'
GROUP BY u.id, u.email, u.nome, u.perfil_id, p.nome;

4. No arquivo .env do projeto, mudar:
   VITE_MOCK_MODE=false

5. Testar login na aplicação!
*/
