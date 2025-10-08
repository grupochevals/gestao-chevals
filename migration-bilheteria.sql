-- Migration: Sistema de Bilheteria
-- Criação de tabelas para gestão de vendas de ingressos e canais de venda

-- 1. Tabela de canais de venda
CREATE TABLE IF NOT EXISTS canais_venda (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('presencial', 'online', 'telefone', 'terceiro', 'cortesia')) NOT NULL,
    responsavel VARCHAR(255),
    contato VARCHAR(100),
    taxa_servico DECIMAL(5,2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de vendas de ingressos
CREATE TABLE IF NOT EXISTS vendas_ingressos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    projeto_id UUID REFERENCES projetos(id),
    contrato_id UUID REFERENCES contratos(id),
    canal_venda_id UUID REFERENCES canais_venda(id),
    data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo_ingresso VARCHAR(100) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    taxa_servico DECIMAL(10,2) DEFAULT 0.00,
    valor_liquido DECIMAL(10,2) NOT NULL,
    cliente_nome VARCHAR(255),
    cliente_documento VARCHAR(20),
    cliente_email VARCHAR(255),
    cliente_telefone VARCHAR(20),
    status VARCHAR(20) CHECK (status IN ('confirmado', 'cancelado', 'reembolsado')) DEFAULT 'confirmado',
    forma_pagamento VARCHAR(50),
    numero_pedido VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de tipos de ingresso (por projeto/evento)
CREATE TABLE IF NOT EXISTS tipos_ingresso (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL,
    quantidade_disponivel INTEGER,
    quantidade_vendida INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_canais_venda_tipo ON canais_venda(tipo);
CREATE INDEX IF NOT EXISTS idx_canais_venda_ativo ON canais_venda(ativo) WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_vendas_ingressos_projeto ON vendas_ingressos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_vendas_ingressos_contrato ON vendas_ingressos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_vendas_ingressos_canal ON vendas_ingressos(canal_venda_id);
CREATE INDEX IF NOT EXISTS idx_vendas_ingressos_data ON vendas_ingressos(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_ingressos_status ON vendas_ingressos(status);

CREATE INDEX IF NOT EXISTS idx_tipos_ingresso_projeto ON tipos_ingresso(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tipos_ingresso_ativo ON tipos_ingresso(ativo) WHERE ativo = true;

-- 5. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_canais_venda_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_canais_venda_updated_at ON canais_venda;
CREATE TRIGGER trigger_update_canais_venda_updated_at
    BEFORE UPDATE ON canais_venda
    FOR EACH ROW
    EXECUTE FUNCTION update_canais_venda_updated_at();

CREATE OR REPLACE FUNCTION update_vendas_ingressos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vendas_ingressos_updated_at ON vendas_ingressos;
CREATE TRIGGER trigger_update_vendas_ingressos_updated_at
    BEFORE UPDATE ON vendas_ingressos
    FOR EACH ROW
    EXECUTE FUNCTION update_vendas_ingressos_updated_at();

CREATE OR REPLACE FUNCTION update_tipos_ingresso_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tipos_ingresso_updated_at ON tipos_ingresso;
CREATE TRIGGER trigger_update_tipos_ingresso_updated_at
    BEFORE UPDATE ON tipos_ingresso
    FOR EACH ROW
    EXECUTE FUNCTION update_tipos_ingresso_updated_at();

-- 6. Comentários para documentação
COMMENT ON TABLE canais_venda IS 'Canais de venda de ingressos (presencial, online, etc)';
COMMENT ON COLUMN canais_venda.tipo IS 'Tipo do canal: presencial, online, telefone, terceiro, cortesia';
COMMENT ON COLUMN canais_venda.taxa_servico IS 'Taxa de serviço cobrada pelo canal (percentual)';

COMMENT ON TABLE vendas_ingressos IS 'Registro de todas as vendas de ingressos';
COMMENT ON COLUMN vendas_ingressos.valor_liquido IS 'Valor total menos taxas de serviço';
COMMENT ON COLUMN vendas_ingressos.status IS 'Status da venda: confirmado, cancelado, reembolsado';

COMMENT ON TABLE tipos_ingresso IS 'Tipos de ingresso disponíveis por evento/projeto';
COMMENT ON COLUMN tipos_ingresso.quantidade_disponivel IS 'Quantidade total disponível para venda';
COMMENT ON COLUMN tipos_ingresso.quantidade_vendida IS 'Quantidade já vendida';

-- 7. RLS Policies
ALTER TABLE canais_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_ingressos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_ingresso ENABLE ROW LEVEL SECURITY;

-- Policies para canais_venda
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar canais" ON canais_venda;
CREATE POLICY "Usuários autenticados podem visualizar canais"
ON canais_venda FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar canais" ON canais_venda;
CREATE POLICY "Usuários autenticados podem criar canais"
ON canais_venda FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar canais" ON canais_venda;
CREATE POLICY "Usuários autenticados podem atualizar canais"
ON canais_venda FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários autenticados podem deletar canais" ON canais_venda;
CREATE POLICY "Usuários autenticados podem deletar canais"
ON canais_venda FOR DELETE TO authenticated USING (true);

-- Policies para vendas_ingressos
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar vendas" ON vendas_ingressos;
CREATE POLICY "Usuários autenticados podem visualizar vendas"
ON vendas_ingressos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar vendas" ON vendas_ingressos;
CREATE POLICY "Usuários autenticados podem criar vendas"
ON vendas_ingressos FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar vendas" ON vendas_ingressos;
CREATE POLICY "Usuários autenticados podem atualizar vendas"
ON vendas_ingressos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários autenticados podem deletar vendas" ON vendas_ingressos;
CREATE POLICY "Usuários autenticados podem deletar vendas"
ON vendas_ingressos FOR DELETE TO authenticated USING (true);

-- Policies para tipos_ingresso
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar tipos" ON tipos_ingresso;
CREATE POLICY "Usuários autenticados podem visualizar tipos"
ON tipos_ingresso FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar tipos" ON tipos_ingresso;
CREATE POLICY "Usuários autenticados podem criar tipos"
ON tipos_ingresso FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar tipos" ON tipos_ingresso;
CREATE POLICY "Usuários autenticados podem atualizar tipos"
ON tipos_ingresso FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários autenticados podem deletar tipos" ON tipos_ingresso;
CREATE POLICY "Usuários autenticados podem deletar tipos"
ON tipos_ingresso FOR DELETE TO authenticated USING (true);

-- 8. Dados iniciais (canais padrão)
INSERT INTO canais_venda (nome, tipo, taxa_servico, ativo) VALUES
('Bilheteria Física', 'presencial', 0.00, true),
('Site Oficial', 'online', 10.00, true),
('Telefone', 'telefone', 5.00, true),
('Cortesias', 'cortesia', 0.00, true)
ON CONFLICT DO NOTHING;
