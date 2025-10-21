# 🐛 Debug - Problema de Login

## 📋 Passos para Testar

1. **Abra o navegador e o DevTools (F12)**
2. **Vá para a aba Console**
3. **Acesse a aplicação**

```bash
npm run dev
```

4. **Faça login com as credenciais:**
   - Email: `admin@gestao-chevals.com`
   - Senha: `123456`

## 🔍 O que Observar no Console

### Ao carregar a aplicação, você deve ver:

```
🎭 [MOCK MODE] Modo mock está ATIVO
📧 [MOCK MODE] Email aceito: admin@gestao-chevals.com
🔑 [MOCK MODE] Senha aceita: 123456
```

### Durante o login, você deve ver:

```
🔐 [MOCK MODE] Tentando login com: admin@gestao-chevals.com
✅ [MOCK MODE] Login bem-sucedido!
👤 [MOCK MODE] Usuário: {id: "mock-user-id", email: "admin@gestao-chevals.com", ...}
```

### Após o login, no ProtectedRoute:

```
🛡️ [ProtectedRoute] Estado: {user: true, loading: false, initialized: true}
✅ [ProtectedRoute] Usuário autenticado, permitindo acesso
```

## ❌ Possíveis Problemas

### Se NÃO ver "🎭 [MOCK MODE] Modo mock está ATIVO":

**Problema:** Modo mock não está ativado

**Solução:**
1. Verifique o arquivo `.env`
2. Confirme que tem: `VITE_MOCK_MODE=true`
3. Reinicie o servidor (`Ctrl+C` e `npm run dev`)

### Se ver "❌ [MOCK MODE] Credenciais inválidas":

**Problema:** Email ou senha incorretos

**Solução:**
- Use exatamente: `admin@gestao-chevals.com` (com `-chevals`)
- Senha: `123456`

### Se ver "🚫 [ProtectedRoute] Sem usuário":

**Problema:** Usuário não está sendo setado no store

**Solução:**
1. Copie TODOS os logs do console
2. Me envie para análise

### Se ficar em loop de loading:

**Problema:** `initialized` não está sendo setado

**Solução:**
1. Limpe o cache do navegador
2. Recarregue com `Ctrl+Shift+R`

## 📸 Me envie as seguintes informações:

1. **Todos os logs do console** (screenshot ou copiar/colar)
2. **Aba Network do DevTools** - Veja se há erros HTTP
3. **Aba Application > Local Storage** - Veja se há dados salvos do Supabase

## 🔧 Comandos Úteis

### Limpar cache e storage:
```javascript
// Cole no console do navegador:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Verificar estado do Zustand:
```javascript
// Cole no console do navegador:
console.log(window);
// Procure por __ZUSTAND__ ou similar
```

### Forçar modo mock via console:
```javascript
// Cole no console do navegador ANTES de fazer login:
sessionStorage.setItem('mockMode', 'true');
```

## 📊 Checklist de Diagnóstico

- [ ] Modo mock está ATIVO (vejo os logs 🎭)
- [ ] Login retorna success (vejo ✅)
- [ ] ProtectedRoute recebe o usuário
- [ ] `initialized` é `true`
- [ ] `loading` é `false`
- [ ] Não há erros no console
- [ ] Arquivo `.env` tem `VITE_MOCK_MODE=true`
- [ ] Servidor foi reiniciado após alterar `.env`

---

**Após o teste, me envie os resultados!**
