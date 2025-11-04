-- ========================================
-- VINCULAR USUÁRIO pv.barbosa@gmail.com COMO ADMINISTRADOR
-- Execute APÓS criar o usuário no Authentication
-- ========================================

-- PASSO 1: Verificar se o usuário existe no auth.users
SELECT
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'pv.barbosa@gmail.com';

-- PASSO 2: Verificar se o perfil de Administrador existe
SELECT id, nome, descricao
FROM perfis
WHERE nome = 'Administrador';

-- PASSO 3: Vincular o usuário à tabela users com perfil de Administrador
INSERT INTO public.users (
    id,
    email,
    nome,
    perfil_id,
    ativo,
    primeiro_login
)
SELECT
    au.id,
    'pv.barbosa@gmail.com',
    'Paulo Barbosa',
    (SELECT id FROM perfis WHERE nome = 'Administrador' LIMIT 1),
    true,
    false  -- false porque já é um usuário existente
FROM auth.users au
WHERE au.email = 'pv.barbosa@gmail.com'
ON CONFLICT (id) DO UPDATE
SET
    perfil_id = (SELECT id FROM perfis WHERE nome = 'Administrador' LIMIT 1),
    nome = 'Paulo Barbosa',
    ativo = true,
    updated_at = NOW();

-- PASSO 4: Verificar se o vínculo foi criado corretamente
SELECT
    u.id,
    u.email,
    u.nome,
    u.perfil_id,
    p.nome as perfil_nome,
    u.ativo,
    u.primeiro_login,
    u.created_at
FROM users u
LEFT JOIN perfis p ON u.perfil_id = p.id
WHERE u.email = 'pv.barbosa@gmail.com';

-- PASSO 5: Verificar todas as permissões do usuário
SELECT
    u.email,
    u.nome,
    p.nome as perfil,
    perm.modulo,
    perm.acao,
    perm.descricao
FROM users u
JOIN perfis p ON u.perfil_id = p.id
JOIN perfil_permissoes pp ON p.id = pp.perfil_id
JOIN permissoes perm ON pp.permissao_id = perm.id
WHERE u.email = 'pv.barbosa@gmail.com'
ORDER BY perm.modulo, perm.acao;

-- ========================================
-- RESULTADO ESPERADO:
-- - Usuário vinculado ao perfil "Administrador"
-- - Deve ter acesso a TODAS as permissões do sistema
-- - Perfil com todas as operações (view, create, edit, delete)
--   em todos os módulos
-- ========================================
