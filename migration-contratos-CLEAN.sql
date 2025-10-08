-- Migration: Contratos (Clean Version)
-- Description: Drops and recreates contratos table
-- Created: 2025-10-07
-- WARNING: This will DELETE all existing contract data!

-- Step 1: Drop existing table and start fresh
DROP TABLE IF EXISTS contratos CASCADE;

-- Step 2: Create the contratos table from scratch
CREATE TABLE contratos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero VARCHAR(50) UNIQUE NOT NULL,
    entidade_id UUID,
    unidade_id UUID,
    espaco_id UUID,
    projeto_id UUID,
    nome_evento VARCHAR(255) NOT NULL,
    tipo_evento VARCHAR(100),
    perfil_evento VARCHAR(100),
    data_assinatura DATE,
    inicio_montagem DATE,
    fim_montagem DATE,
    inicio_realizacao DATE NOT NULL,
    fim_realizacao DATE NOT NULL,
    inicio_desmontagem DATE,
    fim_desmontagem DATE,
    num_diarias INTEGER DEFAULT 0,
    num_lint INTEGER DEFAULT 0,
    num_apresentacoes INTEGER DEFAULT 0,
    publico_estimado INTEGER,
    valor_locacao DECIMAL(10,2) DEFAULT 0.00,
    valor_servicos DECIMAL(10,2) DEFAULT 0.00,
    valor_caucao DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'rascunho',
    observacoes TEXT,
    clausulas_especiais TEXT,
    arquivo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT contratos_status_check CHECK (status IN ('rascunho', 'ativo', 'concluido', 'cancelado'))
);

-- Step 3: Add foreign key constraints
ALTER TABLE contratos ADD CONSTRAINT contratos_entidade_id_fkey
    FOREIGN KEY (entidade_id) REFERENCES entidades(id) ON DELETE SET NULL;

ALTER TABLE contratos ADD CONSTRAINT contratos_unidade_id_fkey
    FOREIGN KEY (unidade_id) REFERENCES unidades(id) ON DELETE SET NULL;

ALTER TABLE contratos ADD CONSTRAINT contratos_espaco_id_fkey
    FOREIGN KEY (espaco_id) REFERENCES unidades(id) ON DELETE SET NULL;

ALTER TABLE contratos ADD CONSTRAINT contratos_projeto_id_fkey
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE SET NULL;

-- Step 4: Create function to calculate valor_total
CREATE OR REPLACE FUNCTION calculate_contratos_valor_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.valor_total = COALESCE(NEW.valor_locacao, 0) + COALESCE(NEW.valor_servicos, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to auto-calculate valor_total
CREATE TRIGGER trigger_calculate_contratos_valor_total
    BEFORE INSERT OR UPDATE OF valor_locacao, valor_servicos ON contratos
    FOR EACH ROW
    EXECUTE FUNCTION calculate_contratos_valor_total();

-- Step 6: Create indexes
CREATE INDEX idx_contratos_numero ON contratos(numero);
CREATE INDEX idx_contratos_projeto ON contratos(projeto_id);
CREATE INDEX idx_contratos_entidade ON contratos(entidade_id);
CREATE INDEX idx_contratos_unidade ON contratos(unidade_id);
CREATE INDEX idx_contratos_espaco ON contratos(espaco_id);
CREATE INDEX idx_contratos_status ON contratos(status);
CREATE INDEX idx_contratos_inicio_realizacao ON contratos(inicio_realizacao);
CREATE INDEX idx_contratos_fim_realizacao ON contratos(fim_realizacao);

-- Step 7: Enable Row Level Security
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
CREATE POLICY "Allow authenticated users to view contratos"
    ON contratos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert contratos"
    ON contratos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update contratos"
    ON contratos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete contratos"
    ON contratos FOR DELETE TO authenticated USING (true);

-- Step 9: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_contratos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create updated_at trigger
CREATE TRIGGER trigger_update_contratos_updated_at
    BEFORE UPDATE ON contratos
    FOR EACH ROW
    EXECUTE FUNCTION update_contratos_updated_at();

-- Step 11: Add table comment
COMMENT ON TABLE contratos IS 'Contratos de eventos e locacoes';
