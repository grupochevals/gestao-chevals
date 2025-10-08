-- ============================================================================
-- MIGRAÇÃO: ADICIONAR ESTRUTURA EMPRESAS → ESPAÇOS
-- ============================================================================
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- ETAPA 1: Criar tabela de empresas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    responsavel VARCHAR(255),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ETAPA 2: Adicionar coluna empresa_id na tabela unidades
-- ----------------------------------------------------------------------------
ALTER TABLE unidades
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL;

-- ETAPA 3: Criar índices para performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_unidades_empresa_id ON unidades(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresas_ativo ON empresas(ativo);

-- ETAPA 4: Habilitar RLS para empresas
-- ----------------------------------------------------------------------------
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- ETAPA 5: Criar políticas RLS para empresas
-- ----------------------------------------------------------------------------
CREATE POLICY "Permitir acesso para usuários autenticados"
ON empresas FOR ALL
USING (auth.role() = 'authenticated');

-- ETAPA 6: Adicionar trigger para updated_at em empresas
-- ----------------------------------------------------------------------------
CREATE TRIGGER update_empresas_updated_at
BEFORE UPDATE ON empresas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ETAPA 7: Inserir dados de exemplo (opcional)
-- ----------------------------------------------------------------------------
-- Empresa exemplo
INSERT INTO empresas (nome, razao_social, cnpj, ativo) VALUES
('Empresa Exemplo', 'Empresa Exemplo LTDA', '00.000.000/0001-00', true)
ON CONFLICT DO NOTHING;

-- VERIFICAÇÃO FINAL
-- ----------------------------------------------------------------------------
SELECT
    'Migração concluída!' as status,
    (SELECT count(*) FROM empresas) as total_empresas,
    (SELECT count(*) FROM unidades) as total_unidades;

-- ============================================================================
-- ESTRUTURA FINAL:
-- - empresas (nova tabela para gerenciar empresas/locais)
-- - unidades (agora referencia empresa_id)
-- ============================================================================
