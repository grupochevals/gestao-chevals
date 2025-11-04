# 🚀 Guia de Setup Completo - Novo Banco Supabase

## 📊 Informações do Banco

- **URL**: `https://irtnaxveqpjhcjyagbzc.supabase.co`
- **Anon Key**: (configurada no .env)
- **Dashboard**: https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc

---

## ✅ Checklist de Configuração

### Fase 1: Setup do Banco de Dados

- [ ] **1.1** - Executar script de criação de tabelas e dados iniciais
- [ ] **1.2** - Verificar que perfis foram criados
- [ ] **1.3** - Verificar que permissões foram criadas
- [ ] **1.4** - Verificar que trigger foi criado

### Fase 2: Criar e Vincular Usuário Admin

- [ ] **2.1** - Criar usuário pv.barbosa@gmail.com no Authentication
- [ ] **2.2** - Confirmar email do usuário
- [ ] **2.3** - Executar script de vinculação como Administrador
- [ ] **2.4** - Verificar permissões do usuário

### Fase 3: Testar Aplicação

- [ ] **3.1** - Testar login com pv.barbosa@gmail.com
- [ ] **3.2** - Verificar acesso ao dashboard
- [ ] **3.3** - Testar criação de dados
- [ ] **3.4** - Verificar RLS funcionando

---

## 📝 PASSO A PASSO

### PASSO 1: Corrigir Constraints (se o banco já existe)

**Se você está executando em um banco NOVO (recém-criado), PULE este passo.**

**Se o banco já tem tabelas criadas:**

1. **Acesse o SQL Editor do Supabase:**
   ```
   https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/sql/new
   ```

2. **Copie e execute o arquivo:** `FIX_CONSTRAINTS_BANCO.sql`
   - Este script adiciona as constraints necessárias para evitar erros

### PASSO 2: Executar Setup do Banco de Dados

1. **Acesse o SQL Editor do Supabase:**
   ```
   https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/sql/new
   ```

2. **Copie e execute o arquivo:** `SETUP_BANCO_NOVO.sql`
   - Esse script cria:
     - ✅ Tabelas: `perfis`, `permissoes`, `perfil_permissoes`, `users`
     - ✅ 5 perfis: Administrador, Gerente, Operador, Financeiro, Visualizador
     - ✅ 28 permissões (todas as operações do sistema)
     - ✅ Vinculação de todas permissões ao perfil Administrador
     - ✅ Trigger automático para novos usuários
     - ✅ Políticas RLS (Row Level Security)

3. **Execute o script** e aguarde a confirmação

4. **Verifique o resultado:**
   - Você verá mensagens como:
     ```
     Perfis criados: 5
     Permissões criadas: 28
     Perfil Admin tem permissões: 28
     ```

---

### PASSO 3: Criar Usuário no Authentication

#### Opção A: Via Dashboard (Recomendado)

1. **Acesse Authentication > Users:**
   ```
   https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/auth/users
   ```

2. **Clique em "Add User" > "Create new user"**

3. **Preencha os dados:**
   - **Email**: `pv.barbosa@gmail.com`
   - **Password**: (defina uma senha forte)
   - **Auto Confirm User**: ✅ MARCAR (importante!)

4. **Clique em "Create user"**

#### Opção B: Via SQL (se o usuário já foi criado pelo dashboard)

Se você já criou o usuário mas não confirmou o email, execute:

```sql
-- Confirmar email do usuário
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'pv.barbosa@gmail.com';
```

---

### PASSO 4: Vincular Usuário como Administrador

1. **Acesse novamente o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/sql/new
   ```

2. **Copie e execute o arquivo:** `VINCULAR_PV_BARBOSA.sql`
   - Esse script:
     - ✅ Verifica se o usuário existe no `auth.users`
     - ✅ Vincula à tabela `users` com perfil de Administrador
     - ✅ Define nome como "Paulo Barbosa"
     - ✅ Marca como usuário ativo
     - ✅ Verifica todas as permissões

3. **Resultado esperado:**
   - Você verá os dados do usuário com:
     - `perfil_nome`: "Administrador"
     - `ativo`: true
     - Lista de todas as 28 permissões

---

### PASSO 5: Testar o Login

1. **Certifique-se que o .env está correto:**
   ```env
   VITE_SUPABASE_URL=https://irtnaxveqpjhcjyagbzc.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_MOCK_MODE=false
   ```

2. **Inicie a aplicação:**
   ```bash
   npm run dev
   ```

3. **Acesse:** http://localhost:5173/login

4. **Faça login com:**
   - **Email**: `pv.barbosa@gmail.com`
   - **Senha**: (a senha que você definiu)

5. **Verifique:**
   - ✅ Login bem-sucedido
   - ✅ Redirecionamento para o dashboard
   - ✅ Nome "Paulo Barbosa" aparece no header
   - ✅ Todos os menus estão visíveis (admin tem acesso total)

---

## 🔍 Verificações e Troubleshooting

### Verificar se o usuário está vinculado corretamente

```sql
SELECT
    u.email,
    u.nome,
    p.nome as perfil,
    u.ativo
FROM users u
LEFT JOIN perfis p ON u.perfil_id = p.id
WHERE u.email = 'pv.barbosa@gmail.com';
```

**Resultado esperado:**
- email: `pv.barbosa@gmail.com`
- nome: `Paulo Barbosa`
- perfil: `Administrador`
- ativo: `true`

---

### Verificar permissões do usuário

```sql
SELECT COUNT(*) as total_permissoes
FROM users u
JOIN perfil_permissoes pp ON u.perfil_id = pp.perfil_id
WHERE u.email = 'pv.barbosa@gmail.com';
```

**Resultado esperado:**
- total_permissoes: `28`

---

### Verificar se o trigger está ativo

```sql
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Resultado esperado:**
- Deve aparecer o trigger `on_auth_user_created` na tabela `auth.users`

---

## 🎯 Estrutura Criada

### Tabelas

1. **perfis** (5 registros)
   - Administrador
   - Gerente
   - Operador
   - Financeiro
   - Visualizador

2. **permissoes** (28 registros)
   - dashboard_view
   - contratos_view, contratos_create, contratos_edit, contratos_delete
   - entidades_view, entidades_create, entidades_edit, entidades_delete
   - unidades_view, unidades_create, unidades_edit, unidades_delete
   - projetos_view, projetos_create, projetos_edit, projetos_delete
   - financeiro_view, financeiro_create, financeiro_edit, financeiro_delete
   - relatorios_view, relatorios_export
   - configuracoes_view, configuracoes_edit
   - usuarios_view, usuarios_create, usuarios_edit, usuarios_delete

3. **perfil_permissoes** (28 registros para Admin)
   - Administrador tem TODAS as 28 permissões

4. **users** (1 registro - você)
   - pv.barbosa@gmail.com como Administrador

---

## 🔐 Segurança Implementada

### Row Level Security (RLS)

- ✅ Habilitado em todas as tabelas
- ✅ Usuários autenticados podem ver perfis e permissões
- ✅ Usuários podem ver outros usuários
- ✅ Usuários só podem editar seus próprios dados
- ✅ Trigger automático cria entrada na tabela `users` para novos usuários do auth

### Próximos Passos de Segurança

Para produção, você pode adicionar políticas mais restritivas:

```sql
-- Exemplo: Apenas admins podem criar/editar/deletar usuários
CREATE POLICY "Apenas admins podem gerenciar usuários"
    ON users FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN perfis p ON u.perfil_id = p.id
            WHERE u.id = auth.uid()
            AND p.nome = 'Administrador'
        )
    );
```

---

## 📞 Suporte

Se encontrar algum erro:

1. Verifique os logs no console do navegador (F12)
2. Verifique os logs do Supabase em:
   https://supabase.com/dashboard/project/irtnaxveqpjhcjyagbzc/logs/explorer
3. Execute as queries de verificação acima
4. Certifique-se que o email foi confirmado (`email_confirmed_at` não é null)

---

## 🎉 Pronto!

Após seguir todos os passos, você terá:

- ✅ Banco de dados completamente configurado
- ✅ Sistema de permissões funcionando
- ✅ Usuário admin criado e vinculado
- ✅ RLS habilitado
- ✅ Trigger automático para novos usuários
- ✅ Aplicação pronta para uso

**Agora você pode fazer login e começar a usar o sistema!** 🚀
