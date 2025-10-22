# 🚀 Configuração Vercel - Variáveis de Ambiente

## ⚠️ IMPORTANTE: Configure estas variáveis no Vercel

O deploy está falhando porque as variáveis de ambiente não foram configuradas.

### 📋 Passo a Passo

1. **Acesse**: https://vercel.com/grupo-chevals-projects/gestao-chevals/settings/environment-variables

2. **Adicione as seguintes variáveis**:

#### Variável 1: VITE_SUPABASE_URL
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://afgjyonvafajmyusrfih.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variável 2: VITE_SUPABASE_ANON_KEY
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZ2p5b252YWZham15dXNyZmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTA2MjMsImV4cCI6MjA3NjYyNjYyM30.s-q7c1PGLOYQ3oAugjca9J8m25DolllABt76A4pBwco`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variável 3: VITE_MOCK_MODE
- **Key**: `VITE_MOCK_MODE`
- **Value**: `false`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

3. **Salve as variáveis**

4. **Aguarde o novo deploy automático** ou force um redeploy:
   - Vá em **Deployments**
   - Clique nos 3 pontos do último deployment
   - Selecione **"Redeploy"**

### ✅ Verificação

Após o deploy, acesse a URL de produção e teste o login com:
- **Email**: pv.barbosa@gmail.com
- **Senha**: (a senha que você definiu)

---

**Nota**: Este commit força um novo deploy automático no Vercel. Após configurar as variáveis, o sistema funcionará corretamente.
