-- Criar tabelas faltantes para o sistema de gestão de eventos

-- Tabela de perfis (roles/grupos de usuários)
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

-- Tabela de entidades (clientes, parceiros, fornecedores)
CREATE TABLE IF NOT EXISTS entidades (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR NOT NULL CHECK (tipo IN ('cliente', 'parceiro', 'fornecedor')),
    nome VARCHAR NOT NULL,
    documento VARCHAR,
    email VARCHAR,
    telefone VARCHAR,
    endereco TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tickets/chamados
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
    prioridade VARCHAR DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    categoria VARCHAR,
    usuario_id UUID REFERENCES auth.users(id),
    responsavel_id UUID REFERENCES auth.users(id),
    contrato_id INTEGER REFERENCES contratos(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de fechamentos de eventos
CREATE TABLE IF NOT EXISTS fechamentos_eventos (
    id SERIAL PRIMARY KEY,
    contrato_id INTEGER REFERENCES contratos(id) NOT NULL,
    status VARCHAR DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pendente_aprovacao', 'aprovado', 'rejeitado')),
    total_receitas DECIMAL(15,2) DEFAULT 0,
    total_despesas DECIMAL(15,2) DEFAULT 0,
    resultado_liquido DECIMAL(15,2) DEFAULT 0,
    observacoes TEXT,
    aprovado_por UUID REFERENCES auth.users(id),
    aprovado_em TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir perfis padrão
INSERT INTO perfis (nome, descricao) VALUES 
('Administrador', 'Acesso total ao sistema'),
('Gerente', 'Acesso a relatórios e gestão de eventos'),
('Operador', 'Acesso básico para operações diárias')
ON CONFLICT (nome) DO NOTHING;

-- Inserir permissões básicas
INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES 
('dashboard_view', 'Visualizar dashboard', 'dashboard', 'view'),
('contratos_view', 'Visualizar contratos', 'contratos', 'view'),
('contratos_create', 'Criar contratos', 'contratos', 'create'),
('contratos_edit', 'Editar contratos', 'contratos', 'edit'),
('contratos_delete', 'Excluir contratos', 'contratos', 'delete'),
('entidades_view', 'Visualizar entidades', 'entidades', 'view'),
('entidades_create', 'Criar entidades', 'entidades', 'create'),
('entidades_edit', 'Editar entidades', 'entidades', 'edit'),
('entidades_delete', 'Excluir entidades', 'entidades', 'delete'),
('financeiro_view', 'Visualizar financeiro', 'financeiro', 'view'),
('financeiro_create', 'Criar movimentações financeiras', 'financeiro', 'create'),
('financeiro_edit', 'Editar movimentações financeiras', 'financeiro', 'edit'),
('financeiro_delete', 'Excluir movimentações financeiras', 'financeiro', 'delete'),
('tickets_view', 'Visualizar tickets', 'tickets', 'view'),
('tickets_create', 'Criar tickets', 'tickets', 'create'),
('tickets_edit', 'Editar tickets', 'tickets', 'edit'),
('configuracoes_view', 'Visualizar configurações', 'configuracoes', 'view'),
('configuracoes_edit', 'Editar configurações', 'configuracoes', 'edit')
ON CONFLICT (nome) DO NOTHING;

-- Atribuir todas as permissões ao perfil Administrador
INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT 
    (SELECT id FROM perfis WHERE nome = 'Administrador'),
    p.id
FROM permissoes p
ON CONFLICT DO NOTHING;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at nas novas tabelas
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissoes_updated_at BEFORE UPDATE ON permissoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entidades_updated_at BEFORE UPDATE ON entidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fechamentos_eventos_updated_at BEFORE UPDATE ON fechamentos_eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS em todas as tabelas
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fechamentos_eventos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir acesso para usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver perfis" ON perfis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem ver permissões" ON permissoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem ver perfil_permissões" ON perfil_permissoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem ver seus próprios dados" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Usuários autenticados podem ver entidades" ON entidades FOR ALL TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem gerenciar tickets" ON tickets FOR ALL TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem ver fechamentos" ON fechamentos_eventos FOR SELECT TO authenticated USING (true);

-- Conceder permissões básicas aos roles
GRANT SELECT ON perfis TO anon, authenticated;
GRANT SELECT ON permissoes TO anon, authenticated;
GRANT SELECT ON perfil_permissoes TO anon, authenticated;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON entidades TO authenticated;
GRANT ALL PRIVILEGES ON tickets TO authenticated;
GRANT ALL PRIVILEGES ON fechamentos_eventos TO authenticated;