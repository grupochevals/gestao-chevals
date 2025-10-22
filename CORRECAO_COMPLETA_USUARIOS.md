# 🔧 Correção Completa - Gerenciamento de Usuários

## 📋 Problema Identificado

O erro 500 ao acessar `/usuarios` é causado por **políticas RLS com recursão infinita** na tabela `users`.

---

## ✅ Solução Completa (Execute na ordem)

### Passo 1: Corrigir Políticas RLS

Execute no **SQL Editor** do Supabase: [FIX_RLS_POLICIES.sql](FIX_RLS_POLICIES.sql)

Este script:
- ✅ Remove a política problemática que causa recursão
- ✅ Cria políticas corretas para usuários e admins
- ✅ Permite que usuários vejam seu próprio perfil
- ✅ Permite que admins gerenciem todos os usuários
- ✅ Permite leitura de perfis, permissões e relações

### Passo 2: Criar Trigger de Usuário

Execute no **SQL Editor** do Supabase: [CREATE_USER_TRIGGER.sql](CREATE_USER_TRIGGER.sql)

Este script:
- ✅ Cria função que insere automaticamente na tabela `users`
- ✅ Trigger que executa quando novo usuário é criado no auth
- ✅ Define perfil padrão (ID 1 - será atualizado depois)

### Passo 3: Adicionar Permissões de Usuários

Execute no **SQL Editor** do Supabase: [USUARIOS_PERMISSIONS.sql](USUARIOS_PERMISSIONS.sql)

Este script:
- ✅ Cria 5 permissões do módulo de usuários
- ✅ Atribui todas ao perfil Administrador

---

## 🧪 Testar

Após executar os 3 scripts:

1. **Recarregue a página** `/usuarios`
2. **Verifique no console** se aparecem os perfis:
   ```
   [UserForm] Perfis recebidos: Array(5)
   [UserForm] Total de perfis: 5
   ```
3. **Clique em "Novo Usuário"**
4. **Verifique se o dropdown de perfis funciona**

---

## 📝 Como Criar Usuário

1. Clique em **"Novo Usuário"**
2. Preencha:
   - **Nome**: Nome completo
   - **Email**: Email válido
   - **Perfil**: Selecione um perfil no dropdown
   - **Senha**: Mínimo 6 caracteres
3. Clique em **"Criar Usuário"**

O sistema irá:
- ✅ Criar o usuário no Supabase Auth
- ✅ Criar registro automático na tabela `users` (via trigger)
- ✅ Atualizar com o perfil selecionado
- ✅ Enviar email de confirmação (se configurado)

---

## 🔍 Debug

Se ainda houver problemas, execute: [DEBUG_PERFIS.sql](DEBUG_PERFIS.sql)

Isso mostrará:
- Quantos perfis existem
- Se as políticas RLS estão corretas
- Se há problemas de acesso

---

## ⚠️ Importante

### Limitações Atuais:

1. **Criação de usuários**: Usa `signUp` normal, então:
   - Email de confirmação pode ser enviado
   - Para desabilitar confirmação de email, configure no Supabase:
     - **Authentication** → **Settings** → **Email Auth**
     - Desmarque "Enable email confirmations"

2. **Redefinição de senha**: Admin não pode alterar senha de outros usuários
   - Solução: Usuário deve usar "Esqueci minha senha"
   - Alternativa futura: Implementar API backend com service_role

3. **Exclusão de usuários**: Usa a API do client
   - Pode não funcionar sem service_role key
   - Solução futura: Implementar API backend

---

## 🚀 Próximas Melhorias

Para funcionalidade completa de admin, será necessário:

1. **Criar API backend** (Supabase Edge Functions ou API separada)
2. **Usar service_role key** no backend
3. **Implementar**:
   - Criação de usuários sem email de confirmação
   - Redefinição de senha por admin
   - Exclusão definitiva de usuários

---

**Execute os 3 scripts SQL na ordem e teste novamente!**
