-- Criação das tabelas principais do sistema de gestão de eventos

-- Tabela de perfis de usuário
CREATE TABLE perfis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de permissões
CREATE TABLE permissoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    modulo VARCHAR(50) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(modulo, acao)
);

-- Tabela de relacionamento perfil-permissão
CREATE TABLE perfil_permissoes (
    perfil_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    permissao_id UUID REFERENCES permissoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (perfil_id, permissao_id)
);

-- Tabela de usuários (estende auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    perfil_id UUID REFERENCES perfis(id),
    ativo BOOLEAN DEFAULT true,
    primeiro_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entidades (clientes, parceiros, fornecedores)
CREATE TABLE entidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('cliente', 'parceiro', 'fornecedor')) NOT NULL,
    documento VARCHAR(20),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de unidades/áreas para locação
CREATE TABLE unidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    localizacao VARCHAR(255),
    capacidade INTEGER,
    valor_base DECIMAL(10,2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contratos
CREATE TABLE contratos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    entidade_id UUID REFERENCES entidades(id),
    unidade_id UUID REFERENCES unidades(id),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('ativo', 'inativo', 'cancelado')) DEFAULT 'ativo',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de documentos do contrato
CREATE TABLE documentos_contrato (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    url TEXT NOT NULL,
    tamanho BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos (eventos)
CREATE TABLE projetos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    contrato_id UUID REFERENCES contratos(id),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('planejamento', 'em_andamento', 'concluido', 'cancelado')) DEFAULT 'planejamento',
    orcamento DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de movimentações financeiras
CREATE TABLE movimentacoes_financeiras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    projeto_id UUID REFERENCES projetos(id),
    tipo VARCHAR(10) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) CHECK (status IN ('pendente', 'pago', 'cancelado')) DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fechamentos de eventos
CREATE TABLE fechamentos_eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    projeto_id UUID REFERENCES projetos(id),
    data_fechamento DATE NOT NULL,
    total_receitas DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_despesas DECIMAL(12,2) NOT NULL DEFAULT 0,
    resultado DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('pendente', 'validado', 'rejeitado')) DEFAULT 'pendente',
    observacoes TEXT,
    email_enviado BOOLEAN DEFAULT false,
    data_validacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tickets/chamados
CREATE TABLE tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    prioridade VARCHAR(10) CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')) DEFAULT 'media',
    status VARCHAR(20) CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')) DEFAULT 'aberto',
    categoria VARCHAR(100) NOT NULL,
    usuario_criador_id UUID REFERENCES users(id),
    usuario_responsavel_id UUID REFERENCES users(id),
    projeto_id UUID REFERENCES projetos(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir perfis padrão
INSERT INTO perfis (nome, descricao) VALUES
('Administrador', 'Acesso total ao sistema'),
('Gerente', 'Acesso a gestão de projetos e relatórios'),
('Operador', 'Acesso a operações básicas'),
('Financeiro', 'Acesso ao módulo financeiro'),
('Visualizador', 'Apenas visualização de dados');

-- Inserir permissões básicas
INSERT INTO permissoes (nome, descricao, modulo, acao) VALUES
-- Dashboard
('Ver Dashboard', 'Visualizar dashboard principal', 'dashboard', 'view'),

-- Contratos
('Ver Contratos', 'Visualizar contratos', 'contratos', 'view'),
('Criar Contratos', 'Criar novos contratos', 'contratos', 'create'),
('Editar Contratos', 'Editar contratos existentes', 'contratos', 'edit'),
('Excluir Contratos', 'Excluir contratos', 'contratos', 'delete'),

-- Entidades
('Ver Entidades', 'Visualizar entidades', 'entidades', 'view'),
('Criar Entidades', 'Criar novas entidades', 'entidades', 'create'),
('Editar Entidades', 'Editar entidades existentes', 'entidades', 'edit'),
('Excluir Entidades', 'Excluir entidades', 'entidades', 'delete'),

-- Unidades
('Ver Unidades', 'Visualizar unidades', 'unidades', 'view'),
('Criar Unidades', 'Criar novas unidades', 'unidades', 'create'),
('Editar Unidades', 'Editar unidades existentes', 'unidades', 'edit'),
('Excluir Unidades', 'Excluir unidades', 'unidades', 'delete'),

-- Projetos
('Ver Projetos', 'Visualizar projetos', 'projetos', 'view'),
('Criar Projetos', 'Criar novos projetos', 'projetos', 'create'),
('Editar Projetos', 'Editar projetos existentes', 'projetos', 'edit'),
('Excluir Projetos', 'Excluir projetos', 'projetos', 'delete'),

-- Financeiro
('Ver Financeiro', 'Visualizar módulo financeiro', 'financeiro', 'view'),
('Criar Movimentações', 'Criar movimentações financeiras', 'financeiro', 'create'),
('Editar Movimentações', 'Editar movimentações financeiras', 'financeiro', 'edit'),
('Excluir Movimentações', 'Excluir movimentações financeiras', 'financeiro', 'delete'),
('Fechar Eventos', 'Realizar fechamento de eventos', 'financeiro', 'close'),

-- Configurações
('Ver Configurações', 'Visualizar configurações', 'configuracoes', 'view'),
('Gerenciar Usuários', 'Gerenciar usuários do sistema', 'configuracoes', 'users'),
('Gerenciar Permissões', 'Gerenciar permissões e perfis', 'configuracoes', 'permissions');

-- Atribuir todas as permissões ao perfil Administrador
INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id 
FROM perfis p, permissoes perm 
WHERE p.nome = 'Administrador';

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE fechamentos_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir acesso para usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver perfis" ON perfis FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver permissões" ON permissoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver perfil_permissões" ON perfil_permissoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver entidades" ON entidades FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver unidades" ON unidades FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver contratos" ON contratos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver documentos_contrato" ON documentos_contrato FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver projetos" ON projetos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver movimentacoes_financeiras" ON movimentacoes_financeiras FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver fechamentos_eventos" ON fechamentos_eventos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver tickets" ON tickets FOR SELECT USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissoes_updated_at BEFORE UPDATE ON permissoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entidades_updated_at BEFORE UPDATE ON entidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON unidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_contrato_updated_at BEFORE UPDATE ON documentos_contrato FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON projetos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movimentacoes_financeiras_updated_at BEFORE UPDATE ON movimentacoes_financeiras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fechamentos_eventos_updated_at BEFORE UPDATE ON fechamentos_eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();