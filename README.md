# Sistema de Gestão Chevals

Sistema completo de gestão para espaços de eventos, desenvolvido com React, TypeScript, Vite e Supabase.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui (Radix UI)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6

## 📋 Funcionalidades

### ✅ Módulos Implementados

- **Dashboard** - Visão geral do sistema
- **Autenticação** - Login, logout e gestão de senhas
- **Unidades** - Gestão de empresas e espaços (estrutura hierárquica)
- **Entidades** - Clientes, parceiros e fornecedores (suporte a múltiplos tipos)
- **Projetos/Eventos** - Planejamento e gestão de eventos
- **Bilheteria** - Canais de venda e relatórios de ingressos
- **Financeiro** - Receitas, despesas e categorias (regimes de caixa e competência)
- **Contratos** - Gestão de contratos de eventos e locações
- **Configurações** - Perfil do usuário

### 🎯 Principais Características

- **UI Moderna** - Interface limpa e responsiva com Tailwind CSS
- **Componentes Reutilizáveis** - Biblioteca completa de componentes UI
- **Filtros Avançados** - Sistema de filtros por categoria, projeto, período, status
- **Regimes Financeiros** - Suporte a regime de caixa e competência
- **RLS (Row Level Security)** - Segurança a nível de banco de dados
- **TypeScript** - Type-safety em todo o código
- **Validação de Forms** - Validação robusta com Zod

## 🗃️ Estrutura do Banco de Dados

### Tabelas Principais

- usuarios - Usuários do sistema
- unidades - Empresas e espaços (hierárquica: empresa → espaço)
- entidades - Clientes, parceiros e fornecedores
- projetos - Projetos e eventos
- contratos - Contratos de eventos
- movimentacoes_financeiras - Receitas e despesas
- categorias_financeiras - Categorias para classificação financeira
- canais_venda - Canais de venda de ingressos
- vendas_ingressos - Registro de vendas

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Conta no Supabase

### Passos

1. Clone o repositório
2. Instale as dependências: npm install
3. Configure as variáveis de ambiente (.env)
4. Execute as migrations do banco de dados
5. Inicie o servidor: npm run dev

## 📁 Estrutura do Projeto

```
gestao-chevals/
├── src/
│   ├── components/        # Componentes React
│   ├── pages/            # Páginas principais
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   └── lib/              # Utilitários
├── migrations/           # SQL migrations
└── package.json
```

## 🔐 Autenticação

Sistema utiliza Supabase Auth com proteção de rotas e gestão de sessão.

## 💰 Módulo Financeiro

- Regime de Caixa e Competência
- Filtros por categoria, projeto, status e período
- Gestão de receitas e despesas
- Categorias personalizáveis

## 📄 Licença

Projeto privado e proprietário.

## 👨‍💻 Autor

Desenvolvido por Paulo Barbosa

---

Versão 1.0.0 - Outubro 2025
