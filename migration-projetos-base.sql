-- Migration: Projetos Base
-- Description: Creates base table for projects/events
-- Created: 2025-10-07
-- Run this BEFORE migration-projetos-eventos.sql

-- Create projetos table
CREATE TABLE IF NOT EXISTS projetos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio DATE,
    data_fim DATE,
    orcamento DECIMAL(10,2),
    status VARCHAR(20) CHECK (status IN ('planejamento', 'aprovado', 'em_andamento', 'concluido', 'cancelado')) DEFAULT 'planejamento',
    contrato_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projetos_nome ON projetos(nome);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_data_inicio ON projetos(data_inicio);

-- Enable RLS
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to view projetos" ON projetos;
DROP POLICY IF EXISTS "Allow authenticated users to insert projetos" ON projetos;
DROP POLICY IF EXISTS "Allow authenticated users to update projetos" ON projetos;
DROP POLICY IF EXISTS "Allow authenticated users to delete projetos" ON projetos;

-- RLS Policies
CREATE POLICY "Allow authenticated users to view projetos"
    ON projetos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert projetos"
    ON projetos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update projetos"
    ON projetos FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete projetos"
    ON projetos FOR DELETE
    TO authenticated
    USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_projetos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_update_projetos_updated_at ON projetos;
CREATE TRIGGER trigger_update_projetos_updated_at
    BEFORE UPDATE ON projetos
    FOR EACH ROW
    EXECUTE FUNCTION update_projetos_updated_at();

COMMENT ON TABLE projetos IS 'Projetos e eventos do sistema';
