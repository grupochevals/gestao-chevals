-- ============================================================================
-- MIGRAÇÃO: ADICIONAR ESTRUTURA EMPRESAS → ESPAÇOS (V2)
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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'unidades' AND column_name = 'empresa_id'
    ) THEN
        ALTER TABLE unidades ADD COLUMN empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ETAPA 3: Criar índices para performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_unidades_empresa_id ON unidades(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresas_ativo ON empresas(ativo);

-- ETAPA 4: Habilitar RLS para empresas
-- ----------------------------------------------------------------------------
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- ETAPA 5: Limpar políticas antigas (se existirem)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir acesso para usuários autenticados" ON empresas;
END $$;

-- ETAPA 6: Criar políticas RLS para empresas
-- ----------------------------------------------------------------------------
CREATE POLICY "Permitir acesso para usuários autenticados"
ON empresas FOR ALL
USING (auth.role() = 'authenticated');

-- ETAPA 7: Adicionar trigger para updated_at em empresas
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
CREATE TRIGGER update_empresas_updated_at
BEFORE UPDATE ON empresas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ETAPA 8: Verificar se já existe dados antes de inserir
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM empresas LIMIT 1) THEN
        INSERT INTO empresas (nome, razao_social, cnpj, ativo) VALUES
        ('Empresa Exemplo', 'Empresa Exemplo LTDA', '00.000.000/0001-00', true);
    END IF;
END $$;

-- VERIFICAÇÃO FINAL
-- ----------------------------------------------------------------------------
SELECT
    'Migração concluída!' as status,
    (SELECT count(*) FROM empresas) as total_empresas,
    (SELECT count(*) FROM unidades) as total_unidades;
