# Modo Mock - Sistema sem Banco de Dados

## 📋 Visão Geral

O sistema agora suporta um **Modo Mock** que permite executar a aplicação sem conexão com o Supabase. Ideal para:

- Desenvolvimento sem banco de dados
- Testes de interface
- Demonstrações
- Situações onde o banco de dados não está disponível

## 🚀 Como Ativar

### 1. Configurar variável de ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# Mock Mode - Ativar para funcionar sem banco de dados
VITE_MOCK_MODE=true
```

### 2. Iniciar o sistema

```bash
npm run dev
```

## 🔐 Credenciais de Acesso (Modo Mock)

**Email:** `admin@gestao-chevals.com`
**Senha:** `123456`

## 📊 Dados Disponíveis

O modo mock inclui dados de exemplo para:

- ✅ **Autenticação** - Login/logout funcionais
- ✅ **Empresas** - 2 empresas de exemplo
- ✅ **Espaços** - 2 espaços vinculados às empresas
- ✅ **Entidades** - Clientes e parceiros de exemplo
- ✅ **Projetos** - Eventos de exemplo
- ✅ **Financeiro** - Receitas e despesas mockadas

## 🔄 Alternar entre Modos

### Ativar Modo Mock (sem banco)
```env
VITE_MOCK_MODE=true
```

### Desativar Modo Mock (com banco)
```env
VITE_MOCK_MODE=false
```
ou simplesmente remova/comente a linha.

## ⚙️ Funcionalidades no Modo Mock

### ✅ Funcionam Normalmente
- Login/Logout
- Navegação entre páginas
- Interface completa
- Dados de exemplo exibidos

### ⚠️ Limitações
- **Não persiste dados** - Alterações são perdidas ao recarregar
- **CRUD limitado** - Operações de criar/editar/excluir não salvam permanentemente
- **Sem validações de backend** - Apenas validações de frontend
- **Sem permissões reais** - Todos têm acesso de administrador

## 🛠️ Arquivos Modificados

1. **src/lib/mockData.ts** - Dados mockados e configuração
2. **src/lib/supabase.ts** - Suporte ao modo mock
3. **src/stores/authStore.ts** - Autenticação mockada
4. **.env** - Variável VITE_MOCK_MODE

## 📝 Extensão dos Dados Mock

Para adicionar mais dados mockados, edite o arquivo `src/lib/mockData.ts`:

```typescript
// Exemplo: Adicionar mais empresas
export const MOCK_EMPRESAS = [
  // ... empresas existentes
  {
    id: '3',
    nome: 'Nova Empresa',
    tipo: 'empresa',
    cnpj: '00.000.000/0001-00',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
```

## 🔄 Retornar ao Modo Normal

Quando o banco de dados estiver disponível:

1. Configure as variáveis do Supabase no `.env`
2. Desative o modo mock: `VITE_MOCK_MODE=false`
3. Execute as migrations do banco
4. Reinicie a aplicação

## 📚 Referência Técnica

### Estrutura de Verificação

O sistema verifica o modo mock usando:

```typescript
const MOCK_ENABLED = import.meta.env.VITE_MOCK_MODE === 'true';
```

### Fluxo de Autenticação

```
User Login
    ↓
MOCK_ENABLED?
    ↓ (true)          ↓ (false)
Mock Auth         Supabase Auth
    ↓                  ↓
Return MOCK_USER   Return DB User
```

## ❓ FAQ

**Q: Posso usar o modo mock em produção?**
A: Não recomendado. O modo mock é apenas para desenvolvimento/teste.

**Q: Os dados são salvos em algum lugar?**
A: Não. Todos os dados existem apenas em memória durante a sessão.

**Q: Posso criar novos usuários no modo mock?**
A: Não. Apenas o usuário admin padrão está disponível.

**Q: Como sei se estou no modo mock?**
A: Você pode adicionar um indicador visual ou verificar o console do navegador.

## 🐛 Troubleshooting

### Problema: Página em branco após ativar modo mock
**Solução:** Limpe o cache do navegador e reinicie o dev server

### Problema: Login não funciona
**Solução:** Verifique se VITE_MOCK_MODE=true está no .env

### Problema: Erro "Missing Supabase environment variables"
**Solução:** O modo mock ignora essa validação. Reinicie o servidor.

---

**Versão:** 1.0
**Data:** Outubro 2025
**Autor:** Paulo Barbosa
