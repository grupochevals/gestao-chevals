# 🔐 Adicionar Permissões ao Repositório

## ❌ Problema

O repositório `grupochevals/gestao-chevals` existe, mas você (`pvbarbosa`) não tem permissão de escrita (push).

```
Permissões atuais:
- admin: false
- push: false ❌
- pull: true ✅
```

## ✅ Solução

O **administrador/owner da conta `grupochevals`** precisa adicionar você como colaborador.

### 📋 Passos para o Administrador

#### Opção 1: Via Interface Web (Mais Fácil)

1. Acessar: https://github.com/grupochevals/gestao-chevals/settings/access
2. Clicar em **"Add people"** ou **"Invite a collaborator"**
3. Buscar por: `pvbarbosa`
4. Selecionar role: **Write** (ou Admin se preferir)
5. Clicar em **"Add pvbarbosa to this repository"**

#### Opção 2: Via GitHub CLI

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/grupochevals/gestao-chevals/collaborators/pvbarbosa \
  -f permission='push'
```

### 🎯 Após Receber o Convite

Você receberá um email ou notificação do GitHub. Então:

1. Aceitar o convite em: https://github.com/grupochevals/gestao-chevals/invitations

2. Depois fazer push:

```bash
git push -u origin main
```

## 🔄 Alternativa: Usar SSH em vez de HTTPS

Se você tem SSH configurado, pode usar:

```bash
# Atualizar remote para usar SSH
git remote set-url origin git@github.com:grupochevals/gestao-chevals.git

# Verificar
git remote -v

# Fazer push
git push -u origin main
```

## 🚀 Comandos Prontos (Após ter permissão)

```bash
# Verificar status
git status

# Push de todos os commits
git push -u origin main

# Push de todas as branches (se houver)
git push -u origin --all

# Push de todas as tags (se houver)
git push -u origin --tags
```

## 📊 Verificar Permissões

Você pode verificar suas permissões a qualquer momento:

```bash
gh api /repos/grupochevals/gestao-chevals | grep -A 5 "permissions"
```

Deve mostrar:
```json
"permissions": {
  "admin": false,
  "push": true,   ← PRECISA SER TRUE
  "pull": true
}
```

## 🔗 Links Úteis

- Repositório: https://github.com/grupochevals/gestao-chevals
- Configurações de acesso: https://github.com/grupochevals/gestao-chevals/settings/access
- Seus convites pendentes: https://github.com/grupochevals/gestao-chevals/invitations

## ⚠️ Importante

Enquanto não tiver permissão de push, o código está salvo localmente e no seu repositório pessoal como backup:
- Local: `/Users/pvbarbosa/Documents/Cursor/gestao-chevals`
- Backup: https://github.com/pvbarbosa/gestao-chevals (se manteve o remote)

---

**Aguarde o administrador adicionar você como colaborador!**
