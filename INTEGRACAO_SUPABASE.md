# 🔗 Integração com Supabase - Gestão de Usuários

## 📊 Situação Atual

### ✅ O que já existe:

1. **Perfis de Usuário** (5 tipos):
   - **Administrador** - Acesso total ao sistema
   - **Gerente** - Acesso a gestão de projetos e relatórios
   - **Operador** - Acesso a operações básicas
   - **Financeiro** - Acesso ao módulo financeiro
   - **Visualizador** - Apenas visualização de dados

2. **Sistema de Permissões**:
   - Granular por módulo e ação (view, create, edit, delete)
   - Módulos: dashboard, contratos, entidades, unidades, projetos, financeiro, etc.

3. **Estrutura de Banco de Dados**:
   ```sql
   perfis (id, nome, descricao, ativo)
   ├── perfil_permissoes (perfil_id, permissao_id)
   │   └── permissoes (id, nome, descricao, modulo, acao)
   └── users (id, email, nome, perfil_id, ativo, primeiro_login)
       └── auth.users (Supabase Auth)
   ```

4. **Configuração Supabase**:
   - URL: `https://irtnaxveqpjhcjyagbzc.supabase.co`
   - Migrations prontas em `supabase/migrations/`
   - RLS (Row Level Security) configurado

### ⚠️ Estado Atual:

- **Modo Mock ATIVO** (`VITE_MOCK_MODE=true`)
- Sistema funciona 100% offline sem Supabase
- Credenciais mock: `admin@gestao-chevals.com` / `123456`

## 🎯 Plano de Integração

### Fase 1: Ativar Supabase (Mantendo Fallback)

1. **Verificar/Executar Migrations no Supabase**
2. **Criar usuário admin inicial**
3. **Desativar modo mock**
4. **Testar autenticação real**

### Fase 2: Gestão de Usuários

1. **Interface de criação de usuários**
2. **Atribuição de perfis**
3. **Gestão de permissões**
4. **Reset de senha**

## 📝 Passo a Passo - Ativação do Supabase

### 1. Verificar se as migrations foram executadas

Acesse o Supabase Dashboard:
https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/editor

Execute as migrations na ordem:

```bash
# Localmente (se tiver Supabase CLI)
supabase db push

# OU copie e execute manualmente no SQL Editor
```

**Arquivos de Migration:**
- `001_initial_schema.sql` - Tabelas principais e perfis
- `002_missing_tables.sql` - Tabelas complementares
- `003_create_admin_user.sql` - Usuário administrador
- `004_fix_admin_user.sql` - Correções
- `005_check_rls_policies.sql` - Políticas RLS
- `006_fix_admin_user_proper.sql` - Correções finais

### 2. Criar Usuário Administrador

**Opção A: Via SQL (Recomendado)**

Execute no SQL Editor do Supabase:

```sql
-- Criar usuário via Supabase Auth
-- Primeiro, vá em Authentication > Users > Add User
-- Email: admin@gestao-chevals.com
-- Senha: (defina uma senha forte)
-- Auto Confirm User: TRUE

-- Depois, vincule ao perfil de Administrador
INSERT INTO public.users (
    id,
    email,
    nome,
    perfil_id,
    ativo,
    primeiro_login
)
SELECT
    auth.users.id,
    'admin@gestao-chevals.com',
    'Administrador do Sistema',
    (SELECT id FROM perfis WHERE nome = 'Administrador' LIMIT 1),
    true,
    true
FROM auth.users
WHERE email = 'admin@gestao-chevals.com'
ON CONFLICT (id) DO NOTHING;
```

**Opção B: Via Dashboard**

1. Acesse: https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/auth/users
2. Clique em "Add User"
3. Email: `admin@gestao-chevals.com`
4. Senha: (defina uma senha forte)
5. Marcar "Auto Confirm User"
6. Execute o SQL acima para vincular ao perfil

### 3. Desativar Modo Mock

Edite o arquivo `.env`:

```env
# Mock Mode - Ativar para funcionar sem banco de dados
# true = Modo Mock (sem Supabase) | false ou vazio = Modo Normal (com Supabase)
VITE_MOCK_MODE=false
```

### 4. Testar Login

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Acesse: http://localhost:5173/login
3. Use as credenciais do admin criado
4. Verifique os logs no console do navegador

## 🔐 Estrutura de Permissões

### Perfis e Suas Permissões

#### 1. Administrador
- ✅ Acesso total a todos os módulos
- ✅ Todas as ações (view, create, edit, delete)
- ✅ Gestão de usuários e perfis

#### 2. Gerente
- ✅ Dashboard, Projetos, Contratos, Relatórios
- ✅ View, Create, Edit
- ❌ Não pode deletar dados críticos

#### 3. Operador
- ✅ Operações básicas do dia-a-dia
- ✅ Entidades, Unidades, Projetos (view, create, edit)
- ❌ Sem acesso a financeiro e configurações

#### 4. Financeiro
- ✅ Módulo financeiro completo
- ✅ Relatórios financeiros
- ⚠️ Acesso limitado a outros módulos (apenas view)

#### 5. Visualizador
- ✅ Apenas visualização (view)
- ❌ Não pode criar, editar ou deletar

## 🛠️ Próximas Implementações

### 1. Interface de Gestão de Usuários (/configuracoes)

**Já existe parcialmente em:**
- `src/components/settings/UserForm.tsx`
- `src/components/settings/UsersList.tsx`
- `src/pages/Configuracoes.tsx`

**Necessário:**
- ✅ Formulário de criação via Supabase Admin API
- ✅ Seleção de perfil
- ✅ Ativação/Desativação de usuários
- ✅ Reset de senha

### 2. Fluxo de Criação de Usuário

```typescript
// Exemplo de criação de usuário
async function createUser(data: {
  email: string;
  nome: string;
  perfil_id: string;
  senha_temporaria: string;
}) {
  // 1. Criar usuário no Supabase Auth (precisa de service_role key)
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.senha_temporaria,
    email_confirm: true
  });

  // 2. Criar registro na tabela users
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      email: data.email,
      nome: data.nome,
      perfil_id: data.perfil_id,
      ativo: true,
      primeiro_login: true
    });

  // 3. Enviar email com senha temporária
  // (Supabase envia automaticamente)
}
```

### 3. Gestão de Perfis e Permissões

**Interface para:**
- Criar novos perfis personalizados
- Atribuir permissões específicas
- Clonar perfis existentes

## 📋 Checklist de Integração

### Preparação
- [ ] Verificar conexão com Supabase
- [ ] Confirmar URL e ANON_KEY corretos
- [ ] Executar todas as migrations

### Criação de Usuários
- [ ] Criar usuário administrador inicial
- [ ] Testar login com usuário real
- [ ] Verificar permissões do administrador

### Desativação do Mock
- [ ] Alterar `.env`: `VITE_MOCK_MODE=false`
- [ ] Reiniciar aplicação
- [ ] Testar todas as funcionalidades

### Testes
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Troca de senha funciona
- [ ] Permissões são respeitadas
- [ ] RLS está ativo

## 🔗 Links Úteis

- **Supabase Dashboard**: https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc
- **SQL Editor**: https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/editor
- **Auth Users**: https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/auth/users
- **Table Editor**: https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/editor

## ⚠️ Importante

### Service Role Key vs Anon Key

- **Anon Key** (atual): Usado no frontend, permissões limitadas
- **Service Role Key**: Necessária para criar usuários via código
  - Nunca exponha no frontend!
  - Use apenas em funções serverless ou backend

### RLS (Row Level Security)

Está ativo e configurado. Usuários só veem seus próprios dados ou dados permitidos por suas permissões.

## 🚀 Começar Agora

**Comando para começar:**

1. Execute as migrations no Supabase
2. Crie o usuário admin
3. Altere `.env` para `VITE_MOCK_MODE=false`
4. Teste o login

**Quer que eu ajude com algum passo específico?**

---

**Documentação criada:** Outubro 2025
**Status:** Pronto para integração
