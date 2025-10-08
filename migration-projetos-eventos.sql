-- Migration: Melhorias na tabela de projetos (eventos)
-- Adiciona campos necessários para gestão completa de eventos

-- 1. Adicionar campos que faltam na tabela projetos
ALTER TABLE projetos
ADD COLUMN IF NOT EXISTS tipo VARCHAR(100),
ADD COLUMN IF NOT EXISTS local VARCHAR(255),
ADD COLUMN IF NOT EXISTS responsavel VARCHAR(255),
ADD COLUMN IF NOT EXISTS entidade_id UUID REFERENCES entidades(id),
ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES unidades(id),
ADD COLUMN IF NOT EXISTS espaco_id UUID REFERENCES unidades(id),
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 2. Atualizar constraint de status para incluir mais opções
DO $$
BEGIN
  -- Remover constraint antiga se existir
  ALTER TABLE projetos DROP CONSTRAINT IF EXISTS projetos_status_check;

  -- Adicionar nova constraint
  ALTER TABLE projetos
  ADD CONSTRAINT projetos_status_check
  CHECK (status IN ('planejamento', 'aprovado', 'em_andamento', 'concluido', 'cancelado'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_data_inicio ON projetos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_projetos_data_fim ON projetos(data_fim);
CREATE INDEX IF NOT EXISTS idx_projetos_contrato_id ON projetos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_projetos_entidade_id ON projetos(entidade_id);
CREATE INDEX IF NOT EXISTS idx_projetos_unidade_id ON projetos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_projetos_espaco_id ON projetos(espaco_id);

-- 4. Adicionar trigger para updated_at
CREATE OR REPLACE FUNCTION update_projetos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_projetos_updated_at ON projetos;
CREATE TRIGGER trigger_update_projetos_updated_at
    BEFORE UPDATE ON projetos
    FOR EACH ROW
    EXECUTE FUNCTION update_projetos_updated_at();

-- 5. Comentários para documentação
COMMENT ON TABLE projetos IS 'Tabela de projetos/eventos do sistema';
COMMENT ON COLUMN projetos.nome IS 'Nome do projeto/evento';
COMMENT ON COLUMN projetos.tipo IS 'Tipo do evento (ex: show, festa, corporativo, etc)';
COMMENT ON COLUMN projetos.descricao IS 'Descrição detalhada do evento';
COMMENT ON COLUMN projetos.local IS 'Local do evento (texto livre)';
COMMENT ON COLUMN projetos.responsavel IS 'Nome do responsável pelo evento';
COMMENT ON COLUMN projetos.contrato_id IS 'Referência ao contrato associado (se houver)';
COMMENT ON COLUMN projetos.entidade_id IS 'Entidade cliente responsável pelo evento';
COMMENT ON COLUMN projetos.unidade_id IS 'Empresa/unidade onde o evento ocorre';
COMMENT ON COLUMN projetos.espaco_id IS 'Espaço específico dentro da unidade';
COMMENT ON COLUMN projetos.data_inicio IS 'Data de início do evento';
COMMENT ON COLUMN projetos.data_fim IS 'Data de término do evento';
COMMENT ON COLUMN projetos.status IS 'Status atual: planejamento, aprovado, em_andamento, concluido, cancelado';
COMMENT ON COLUMN projetos.orcamento IS 'Orçamento previsto para o evento';
COMMENT ON COLUMN projetos.observacoes IS 'Observações e notas adicionais';

-- 6. RLS Policies para projetos
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT (leitura)
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar projetos" ON projetos;
CREATE POLICY "Usuários autenticados podem visualizar projetos"
ON projetos FOR SELECT
TO authenticated
USING (true);

-- Policy para INSERT (criação)
DROP POLICY IF EXISTS "Usuários autenticados podem criar projetos" ON projetos;
CREATE POLICY "Usuários autenticados podem criar projetos"
ON projetos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy para UPDATE (atualização)
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar projetos" ON projetos;
CREATE POLICY "Usuários autenticados podem atualizar projetos"
ON projetos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy para DELETE (exclusão)
DROP POLICY IF EXISTS "Usuários autenticados podem deletar projetos" ON projetos;
CREATE POLICY "Usuários autenticados podem deletar projetos"
ON projetos FOR DELETE
TO authenticated
USING (true);
