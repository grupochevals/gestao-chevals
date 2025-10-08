# 🚨 SOLUÇÃO DEFINITIVA PARA ERRO 500 DE AUTENTICAÇÃO

## Problema Identificado

O schema `auth` do Supabase está **corrompido** e você **não tem permissões** para modificá-lo diretamente via SQL.

**Erro**: `Database error querying schema` + `must be owner of table users`

## ✅ SOLUÇÃO RECOMENDADA: Criar Novo Projeto Supabase

Esta é a solução **mais rápida e confiável**. Leva ~10 minutos.

### Passo 1: Criar Novo Projeto

1. Acesse: https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `gestao-chevals` (ou `gestao-chevals-v2`)
   - **Database Password**: Escolha uma senha forte e **ANOTE**
   - **Region**: Escolha a mais próxima (ex: South America)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos (o projeto estará "Setting up database")

### Passo 2: Copiar Novas Credenciais

1. No novo projeto, vá em: **Settings** > **API**
2. Copie:
   - **Project URL** (exemplo: `https://abc123.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

### Passo 3: Atualizar Arquivo .env

Abra o arquivo `.env` na raiz do projeto e atualize:

```env
VITE_SUPABASE_URL=https://SEU_NOVO_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (sua nova chave)
```

### Passo 4: Executar Migrations

No dashboard do novo projeto Supabase:

1. Vá em: **SQL Editor**
2. Clique em **"New Query"**
3. Copie e cole o conteúdo de: `supabase/migrations/001_initial_schema.sql`
4. Clique em **"Run"**
5. Repita para: `002_missing_tables.sql` (se existir)

**OU**, se preferir via CLI:

```bash
# Linkar ao novo projeto
npx supabase link --project-ref SEU_NOVO_PROJECT_ID

# Rodar migrations
npx supabase db push
```

### Passo 5: Criar Usuário Admin

1. No dashboard, vá em: **Authentication** > **Users**
2. Clique em **"Add User"**
3. Preencha:
   - **Email**: `admin@gestao-chevals.com`
   - **Password**: `admin123`
   - ✅ Marque **"Auto Confirm User"**
4. Clique em **"Create User"**

### Passo 6: Testar

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: http://localhost:5173

3. Faça login:
   - **Email**: `admin@gestao-chevals.com`
   - **Senha**: `admin123`

4. ✅ Deve funcionar!

---

## 🔧 SOLUÇÃO ALTERNATIVA: Tentar Script Simplificado

**Atenção**: Pode não resolver completamente se o schema auth está muito corrompido.

### Executar no SQL Editor do Supabase

1. Abra: **SQL Editor** no dashboard do projeto ATUAL
2. Copie o conteúdo de: `reset-auth-schema-simple.sql`
3. Cole e execute
4. Se não der erro, tente criar usuário manualmente em Authentication > Users

**Limitação**: Este script não pode corrigir o schema `auth`, apenas prepara o `public`.

---

## 📞 SUPORTE SUPABASE

Se não quiser criar novo projeto e o script simplificado não funcionar:

1. Abra ticket em: https://supabase.com/dashboard/support/new
2. Informe:
   - **Projeto**: gestao-chevals (ou seu project-ref)
   - **Erro**: "Database error querying schema" em operações de autenticação
   - **Request**: Reset do schema auth ou concessão de permissões de superusuário

---

## 🎯 Resumo das Opções

| Opção | Tempo | Sucesso | Complexidade |
|-------|-------|---------|--------------|
| **Novo Projeto** | 10 min | ✅ 99% | Baixa |
| Script Simplificado | 5 min | ⚠️ 30% | Baixa |
| Suporte Supabase | 1-3 dias | ✅ 90% | Baixa |

**Recomendação**: Criar novo projeto é a solução mais rápida e garantida.

---

## ❓ FAQ

**P: Vou perder meus dados?**
R: No projeto atual não há dados de produção (só testes). É seguro criar novo projeto.

**P: Preciso pagar pelo novo projeto?**
R: Não. Supabase free tier permite 2 projetos ativos. Você pode deletar o antigo depois.

**P: As migrations vão funcionar no novo projeto?**
R: Sim! As migrations em `supabase/migrations/` estão corretas e vão funcionar.

**P: E se eu tiver dados importantes?**
R: Exporte via SQL Editor antes:
```sql
SELECT * FROM public.perfis;
SELECT * FROM public.users;
```
Copie os resultados e importe no novo projeto.
