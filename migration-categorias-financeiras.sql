-- Migration: Categorias Financeiras
-- Description: Creates table for financial categories management
-- Created: 2025-10-07

-- Create categorias_financeiras table
CREATE TABLE IF NOT EXISTS categorias_financeiras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa', 'ambos')) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    cor VARCHAR(20), -- hex color code for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default receita categories
INSERT INTO categorias_financeiras (nome, tipo, cor, descricao) VALUES
('Bilheteria', 'receita', '#10b981', 'Vendas de ingressos para eventos'),
('Patrocínio', 'receita', '#3b82f6', 'Receitas de patrocinadores'),
('Locação de Espaço', 'receita', '#8b5cf6', 'Aluguel de espaços para terceiros'),
('Serviços', 'receita', '#06b6d4', 'Prestação de serviços diversos'),
('Venda de Produtos', 'receita', '#f59e0b', 'Venda de produtos diversos'),
('Outras', 'receita', '#6b7280', 'Outras receitas não categorizadas');

-- Insert default despesa categories
INSERT INTO categorias_financeiras (nome, tipo, cor, descricao) VALUES
('Pessoal', 'despesa', '#ef4444', 'Salários, encargos e benefícios'),
('Material', 'despesa', '#f97316', 'Compra de materiais e suprimentos'),
('Marketing', 'despesa', '#ec4899', 'Despesas com marketing e publicidade'),
('Infraestrutura', 'despesa', '#84cc16', 'Manutenção e infraestrutura'),
('Outras', 'despesa', '#6b7280', 'Outras despesas não categorizadas');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_ativo ON categorias_financeiras(ativo);

-- Enable Row Level Security
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view categorias"
    ON categorias_financeiras FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert categorias"
    ON categorias_financeiras FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categorias"
    ON categorias_financeiras FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete categorias"
    ON categorias_financeiras FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_categorias_financeiras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_categorias_financeiras_updated_at
    BEFORE UPDATE ON categorias_financeiras
    FOR EACH ROW
    EXECUTE FUNCTION update_categorias_financeiras_updated_at();

-- Add comments
COMMENT ON TABLE categorias_financeiras IS 'Categorias para classificação de receitas e despesas';
COMMENT ON COLUMN categorias_financeiras.tipo IS 'Tipo da categoria: receita, despesa ou ambos';
COMMENT ON COLUMN categorias_financeiras.cor IS 'Código hexadecimal da cor para exibição na interface';
