# 🔧 INSTRUÇÕES PARA CORRIGIR O ERRO 500 DE AUTENTICAÇÃO

## Problema Identificado
Schema de autenticação do Supabase corrompido causando erro `500 Internal Server Error` em todas as operações de login.

## Solução em 3 Passos

### ⚡ PASSO 1: Executar Script de Reset (NO DASHBOARD DO SUPABASE)

1. **Acesse o Dashboard do Supabase:**
   - URL: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione o projeto `gestao-chevals`

2. **Abra o SQL Editor:**
   - No menu lateral, clique em `SQL Editor`
   - Clique em `New Query` para criar uma nova consulta

3. **Execute o script de reset:**
   - Abra o arquivo: `reset-auth-schema.sql`
   - Copie TODO o conteúdo do arquivo
   - Cole no SQL Editor do Supabase
   - Clique em `Run` ou pressione `Ctrl/Cmd + Enter`

4. **Aguarde a execução:**
   - O script vai limpar e reconstruir o schema de autenticação
   - Você verá mensagens de sucesso no console
   - Verifique se não há erros na execução

### 👤 PASSO 2: Criar Usuário Admin Manualmente

**IMPORTANTE:** Como o schema `auth.users` estava corrompido, não podemos criar usuários via código. Você DEVE criar manualmente no dashboard.

1. **Navegue para Authentication:**
   - No menu lateral do dashboard, clique em `Authentication`
   - Clique na aba `Users`

2. **Adicione um novo usuário:**
   - Clique no botão `Add User` (ou `Invite User`)
   - Preencha os dados:
     ```
     Email: admin@gestao-chevals.com
     Password: admin123
     ```
   - **IMPORTANTE:** Marque a opção `Auto Confirm User` (ou similar)
     - Isso confirma o email automaticamente
     - Sem isso, o usuário não conseguirá fazer login

3. **Confirme a criação:**
   - Clique em `Create User` ou `Send Invite`
   - Aguarde a confirmação
   - Verifique se o usuário aparece na lista

4. **Verificação automática:**
   - O trigger criado no PASSO 1 automaticamente criará o registro correspondente em `public.users`
   - Você não precisa fazer nada manualmente nessa etapa

### ✅ PASSO 3: Testar o Login

1. **Acesse a aplicação:**
   - URL: http://localhost:5173 (ou a URL que você está usando)

2. **Faça login com as credenciais:**
   ```
   Email: admin@gestao-chevals.com
   Senha: admin123
   ```

3. **Resultado esperado:**
   - ✅ Login bem-sucedido
   - ✅ Redirecionamento para dashboard
   - ✅ Sem erros 500

## 🔍 Verificações Adicionais (Opcional)

### Verificar se o usuário foi criado corretamente:

Execute no SQL Editor:

```sql
-- Verificar usuário no schema auth
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'admin@gestao-chevals.com';

-- Verificar usuário no schema public
SELECT id, email, nome, perfil_id, ativo
FROM public.users
WHERE email = 'admin@gestao-chevals.com';

-- Verificar se há perfis disponíveis
SELECT * FROM public.perfis WHERE ativo = true;
```

## ❓ Troubleshooting

### Se ainda der erro 500:

1. **Verifique as variáveis de ambiente:**
   ```bash
   cat .env | grep SUPABASE
   ```
   - Certifique-se que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas

2. **Reinicie o servidor de desenvolvimento:**
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

3. **Limpe o cache do navegador:**
   - Pressione `Ctrl+Shift+Delete` (ou `Cmd+Shift+Delete` no Mac)
   - Selecione "Cookies e dados de sites"
   - Limpe e recarregue a página

### Se o usuário não for criado em public.users:

Execute manualmente:

```sql
-- Buscar o ID do usuário criado
SELECT id FROM auth.users WHERE email = 'admin@gestao-chevals.com';

-- Inserir manualmente em public.users (substitua <USER_ID> pelo ID encontrado acima)
INSERT INTO public.users (id, email, nome, perfil_id, ativo, primeiro_login)
VALUES (
  '<USER_ID>',
  'admin@gestao-chevals.com',
  'Administrador',
  1,
  true,
  true
);
```

## 📋 O que o script fez?

1. ✅ Limpou dados corrompidos no schema `auth`
2. ✅ Recriou índices críticos
3. ✅ Resetou políticas RLS (Row Level Security)
4. ✅ Criou trigger para sincronização automática auth → public
5. ✅ Configurou permissões corretas
6. ✅ Preparou o ambiente para receber novos usuários

## 🎯 Próximos Passos Após Resolver

Depois que o login funcionar:

1. Mude a senha padrão do admin
2. Crie outros usuários conforme necessário
3. Configure permissões específicas
4. Teste todas as funcionalidades

---

**Dúvidas?** Se ainda tiver problemas, verifique os logs do navegador (F12 > Console) e compartilhe as mensagens de erro.
