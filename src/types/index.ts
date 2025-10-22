// Tipos globais do sistema
export interface User {
  id: string;
  email: string;
  nome: string;
  perfil_id: number;
  ativo: boolean;
  primeiro_login: boolean;
  created_at: string;
  updated_at: string;
}

export interface Perfil {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permissao {
  id: string;
  nome: string;
  descricao?: string;
  modulo: string;
  acao: string;
  created_at: string;
  updated_at: string;
}

export interface PerfilPermissao {
  perfil_id: string;
  permissao_id: string;
  created_at: string;
}

export interface Entidade {
  id: string;
  nome: string;
  tipo: 'cliente' | 'parceiro' | 'fornecedor';
  documento?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Unidade {
  id: string;
  nome: string;
  descricao?: string;
  localizacao?: string;
  capacidade?: number;
  valor_base?: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contrato {
  id: string;
  numero: string;
  entidade_id: string;
  unidade_id: string;
  data_inicio: string;
  data_fim: string;
  valor_total: number;
  status: 'ativo' | 'inativo' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentoContrato {
  id: string;
  contrato_id: string;
  nome: string;
  tipo: string;
  url: string;
  tamanho: number;
  created_at: string;
  updated_at: string;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao?: string;
  contrato_id: string;
  data_inicio: string;
  data_fim: string;
  status: 'planejamento' | 'em_andamento' | 'concluido' | 'cancelado';
  orcamento?: number;
  created_at: string;
  updated_at: string;
}

export interface MovimentacaoFinanceira {
  id: string;
  projeto_id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface FechamentoEvento {
  id: string;
  projeto_id: string;
  data_fechamento: string;
  total_receitas: number;
  total_despesas: number;
  resultado: number;
  status: 'pendente' | 'validado' | 'rejeitado';
  observacoes?: string;
  email_enviado: boolean;
  data_validacao?: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
  categoria: string;
  usuario_criador_id: string;
  usuario_responsavel_id?: string;
  projeto_id?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para autenticação
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    nome?: string;
  };
}

// Tipos para dashboard
export interface DashboardKPI {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}