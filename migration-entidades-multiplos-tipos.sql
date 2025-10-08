-- Migration: Permitir múltiplos tipos para entidades
-- Uma entidade pode ser cliente, parceiro e fornecedor simultaneamente

-- 1. Adicionar colunas booleanas para cada tipo
ALTER TABLE entidades
ADD COLUMN IF NOT EXISTS e_cliente BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS e_parceiro BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS e_fornecedor BOOLEAN DEFAULT false;

-- 2. Migrar dados existentes da coluna tipo para as novas colunas booleanas
UPDATE entidades
SET
  e_cliente = CASE WHEN tipo = 'cliente' THEN true ELSE false END,
  e_parceiro = CASE WHEN tipo = 'parceiro' THEN true ELSE false END,
  e_fornecedor = CASE WHEN tipo = 'fornecedor' THEN true ELSE false END
WHERE tipo IS NOT NULL;

-- 3. Adicionar constraint para garantir que pelo menos um tipo seja selecionado
ALTER TABLE entidades
ADD CONSTRAINT check_at_least_one_tipo
CHECK (e_cliente = true OR e_parceiro = true OR e_fornecedor = true);

-- 4. A coluna tipo antiga pode ser mantida para compatibilidade ou removida
-- Por enquanto vamos mantê-la como opcional para não quebrar código existente
ALTER TABLE entidades
ALTER COLUMN tipo DROP NOT NULL;

-- 5. Criar índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_entidades_e_cliente ON entidades(e_cliente) WHERE e_cliente = true;
CREATE INDEX IF NOT EXISTS idx_entidades_e_parceiro ON entidades(e_parceiro) WHERE e_parceiro = true;
CREATE INDEX IF NOT EXISTS idx_entidades_e_fornecedor ON entidades(e_fornecedor) WHERE e_fornecedor = true;

-- 6. Comentários para documentação
COMMENT ON COLUMN entidades.e_cliente IS 'Indica se a entidade é um cliente';
COMMENT ON COLUMN entidades.e_parceiro IS 'Indica se a entidade é um parceiro';
COMMENT ON COLUMN entidades.e_fornecedor IS 'Indica se a entidade é um fornecedor';
