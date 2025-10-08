export interface Contrato {
  id: string;
  numero: string;

  // Relações
  projeto_id: string | null;
  entidade_id: string | null;
  unidade_id: string | null;
  espaco_id: string | null;

  // Informações do Evento
  nome_evento: string;
  tipo_evento: string | null;
  perfil_evento: string | null;

  // Períodos
  data_assinatura: string | null;
  inicio_montagem: string | null;
  fim_montagem: string | null;
  inicio_realizacao: string;
  fim_realizacao: string;
  inicio_desmontagem: string | null;
  fim_desmontagem: string | null;

  // Métricas
  num_diarias: number;
  num_lint: number;
  num_apresentacoes: number;
  publico_estimado: number | null;

  // Valores Financeiros
  valor_locacao: number;
  valor_servicos: number;
  valor_caucao: number;
  valor_total: number;

  // Status e Observações
  status: 'rascunho' | 'ativo' | 'concluido' | 'cancelado';
  observacoes: string | null;
  clausulas_especiais: string | null;

  // Arquivos
  arquivo_url: string | null;

  // Audit
  created_at: string;
  updated_at: string;

  // Relações expandidas (opcional)
  projetos?: { nome: string };
  entidades?: { nome: string };
  unidades?: { nome: string };
  espacos?: { nome: string };
}

export interface ContratoFormData {
  numero: string;

  // Relações
  projeto_id: string | null;
  entidade_id: string | null;
  unidade_id: string | null;
  espaco_id: string | null;

  // Informações do Evento
  nome_evento: string;
  tipo_evento: string;
  perfil_evento: string;

  // Períodos
  data_assinatura: string;
  inicio_montagem: string;
  fim_montagem: string;
  inicio_realizacao: string;
  fim_realizacao: string;
  inicio_desmontagem: string;
  fim_desmontagem: string;

  // Métricas
  num_diarias: number;
  num_lint: number;
  num_apresentacoes: number;
  publico_estimado: number;

  // Valores Financeiros
  valor_locacao: number;
  valor_servicos: number;
  valor_caucao: number;

  // Status e Observações
  status: 'rascunho' | 'ativo' | 'concluido' | 'cancelado';
  observacoes: string;
  clausulas_especiais: string;
}
