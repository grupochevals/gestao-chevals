# 🚀 Setup Completo do Supabase - Gestão Chevals

## ⚠️ SITUAÇÃO ATUAL
O projeto Supabase em `.env` foi removido/pausado (HTTP 410).

**Você precisa criar um NOVO projeto Supabase e seguir este guia.**

---

## 📋 PASSO 1: Criar Novo Projeto Supabase

1. Acesse: https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: gestao-chevals
   - **Database Password**: (anote uma senha forte!)
   - **Region**: São Paulo (South America)
   - **Pricing Plan**: Free

4. Aguarde a criação (1-2 minutos)

---

## 📋 PASSO 2: Copiar Credenciais

1. No dashboard do projeto, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (https://XXXXX.supabase.co)
   - **anon/public key** (eyJhbGc...)

3. Atualize o arquivo `.env`:
```env
VITE_SUPABASE_URL=https://XXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_MOCK_MODE=false
```

---

## 📋 PASSO 3: Executar Script de Criação

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **"New Query"**
3. Cole TODO o conteúdo do arquivo: **`FIX_PERFIL_ID_TYPE.sql`**
4. Clique em **RUN** (ou pressione Ctrl+Enter)

### ✅ Resultado Esperado:
```
NOTICE: Tipo atual de perfis.id: ...
NOTICE: ========================================
NOTICE: ✅ Correção completada!
NOTICE: ========================================
NOTICE: Tipo de perfis.id: integer
NOTICE: Perfis criados: 5
NOTICE: Permissões criadas: 25
NOTICE: Permissões do Administrador: 25
NOTICE: ========================================
```

---

## 📋 PASSO 4: Criar Usuário Admin

### 4.1 Criar no Supabase Auth

1. No dashboard, vá em **Authentication** → **Users**
2. Clique em **"Add User"** → **"Create new user"**
3. Preencha:
   - **Email**: admin@gestao-chevals.com
   - **Password**: (escolha uma senha forte, ex: Admin@Chevals2025)
   - ✅ **Auto Confirm User**: MARCAR ESSA OPÇÃO!
4. Clique em **Create User**
5. **IMPORTANTE**: Copie o UUID do usuário criado (será algo como: 12345678-abcd-...)

### 4.2 Vincular ao Perfil Admin

1. Volte ao **SQL Editor**
2. Execute este script (substitua o UUID):

```sql
-- Substitua 'SEU-UUID-AQUI' pelo UUID do usuário criado acima
INSERT INTO public.users (id, email, nome, perfil_id, ativo, primeiro_login)
VALUES (
    'SEU-UUID-AQUI',  -- ← COLOCAR O UUID DO PASSO 4.1
    'admin@gestao-chevals.com',
    'Administrador do Sistema',
    (SELECT id FROM perfis WHERE nome = 'Administrador'),
    true,
    true
);
```

### 4.3 Verificar Tudo

Execute no SQL Editor:
```sql
SELECT
    u.id,
    u.email,
    u.nome,
    u.perfil_id,
    p.nome as perfil,
    COUNT(pp.permissao_id) as total_permissoes
FROM users u
JOIN perfis p ON p.id = u.perfil_id
LEFT JOIN perfil_permissoes pp ON pp.perfil_id = u.perfil_id
WHERE u.email = 'admin@gestao-chevals.com'
GROUP BY u.id, u.email, u.nome, u.perfil_id, p.nome;
```

**Resultado esperado:**
| id | email | nome | perfil_id | perfil | total_permissoes |
|----|-------|------|-----------|---------|------------------|
| (uuid) | admin@gestao-chevals.com | Administrador do Sistema | 1 | Administrador | 25 |

---

## 📋 PASSO 5: Testar Login

1. Certifique-se que `.env` tem:
   ```env
   VITE_MOCK_MODE=false
   ```

2. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse: http://localhost:5173

4. Faça login:
   - **Email**: admin@gestao-chevals.com
   - **Senha**: (a senha que você definiu no passo 4.1)

5. ✅ Deve redirecionar para o dashboard!

---

## 🎯 RESUMO DOS PERFIS CRIADOS

| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| **Administrador** | Acesso total | Todas (25) |
| **Gerente** | Relatórios e eventos | A configurar |
| **Operador** | Operações diárias | A configurar |
| **Financeiro** | Módulo financeiro | A configurar |
| **Visualizador** | Somente leitura | A configurar |

Para atribuir permissões aos outros perfis, use:
```sql
-- Exemplo: Dar permissões de dashboard ao Gerente
INSERT INTO perfil_permissoes (perfil_id, permissao_id)
VALUES (
    (SELECT id FROM perfis WHERE nome = 'Gerente'),
    (SELECT id FROM permissoes WHERE nome = 'dashboard_view')
);
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Invalid login credentials"
- Verifique se marcou **"Auto Confirm User"** ao criar o usuário
- Tente resetar a senha do usuário no Supabase Auth

### Erro: "User not found"
- Execute novamente o script do passo 4.2
- Verifique se o UUID está correto

### Erro: "perfil_id cannot be null"
- Execute o passo 4.2 com o UUID correto do usuário

### Aplicação não redireciona após login
- Verifique se `VITE_MOCK_MODE=false` no `.env`
- Limpe o cache do navegador (Ctrl+Shift+Del)
- Verifique o console do navegador (F12) para erros

---

## 📞 PRÓXIMOS PASSOS

Após login funcionando:

1. ✅ Criar outros usuários (Gerente, Operador, etc)
2. ✅ Atribuir permissões específicas a cada perfil
3. ✅ Fazer deploy no Vercel com as novas credenciais
4. ✅ Configurar variáveis de ambiente no Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MOCK_MODE=false`

---

**🎉 Pronto! Seu sistema estará funcionando com Supabase!**
