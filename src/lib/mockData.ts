// Mock data para desenvolvimento sem banco de dados
import type { User } from '@/types';

export const MOCK_ENABLED = import.meta.env.VITE_MOCK_MODE === 'true';

// Log de inicialização
if (MOCK_ENABLED) {
  console.log('🎭 [MOCK MODE] Modo mock está ATIVO');
  console.log('📧 [MOCK MODE] Email aceito:', 'admin@gestao-chevals.com');
  console.log('🔑 [MOCK MODE] Senha aceita:', '123456');
} else {
  console.log('🔌 [NORMAL MODE] Conectando ao Supabase');
}

// Usuário mock (Supabase Auth User)
export const MOCK_USER = {
  id: 'mock-user-id',
  email: 'admin@gestao-chevals.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
};

// Perfil mock (User do sistema)
export const MOCK_PROFILE: User = {
  id: 'mock-user-id',
  email: 'admin@gestao-chevals.com',
  nome: 'Administrador',
  perfil_id: '1',
  ativo: true,
  primeiro_login: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Credenciais válidas para mock
export const MOCK_CREDENTIALS = {
  email: 'admin@gestao-chevals.com',
  password: '123456',
};

// Validar credenciais mock
export const validateMockCredentials = (email: string, password: string): boolean => {
  return email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password;
};

// Dados mockados de empresas
export const MOCK_EMPRESAS = [
  {
    id: '1',
    nome: 'Chevals Eventos',
    tipo: 'empresa',
    cnpj: '12.345.678/0001-90',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Eventos Premium',
    tipo: 'empresa',
    cnpj: '98.765.432/0001-10',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Dados mockados de espaços
export const MOCK_ESPACOS = [
  {
    id: '3',
    nome: 'Salão Principal',
    tipo: 'espaco',
    empresa_id: '1',
    capacidade: 500,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    nome: 'Área VIP',
    tipo: 'espaco',
    empresa_id: '1',
    capacidade: 100,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Dados mockados de entidades
export const MOCK_ENTIDADES = [
  {
    id: '1',
    nome: 'João Silva',
    tipo: 'cliente',
    documento: '123.456.789-00',
    email: 'joao@email.com',
    telefone: '(11) 98765-4321',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Maria Santos',
    tipo: 'parceiro',
    documento: '987.654.321-00',
    email: 'maria@email.com',
    telefone: '(11) 91234-5678',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Dados mockados de projetos
export const MOCK_PROJETOS = [
  {
    id: '1',
    nome: 'Festa Corporativa 2025',
    descricao: 'Evento anual da empresa',
    data_inicio: '2025-12-15',
    data_fim: '2025-12-15',
    status: 'planejamento',
    espaco_id: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Casamento - Ana e Carlos',
    descricao: 'Cerimônia e recepção',
    data_inicio: '2025-11-20',
    data_fim: '2025-11-20',
    status: 'confirmado',
    espaco_id: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Dados mockados de movimentações financeiras
export const MOCK_MOVIMENTACOES = [
  {
    id: '1',
    tipo: 'receita',
    descricao: 'Pagamento evento corporativo',
    valor: 15000.00,
    data_vencimento: '2025-10-25',
    data_pagamento: '2025-10-20',
    status: 'pago',
    projeto_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    tipo: 'despesa',
    descricao: 'Fornecedor de decoração',
    valor: 3500.00,
    data_vencimento: '2025-10-30',
    data_pagamento: null,
    status: 'pendente',
    projeto_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
