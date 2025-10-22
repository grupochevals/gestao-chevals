-- ========================================
-- VINCULAR USUÁRIA VIRGINIA MANUALMENTE
-- ========================================

-- Inserir Virginia na tabela users usando o ID do auth.users
INSERT INTO public.users (id, email, nome, perfil_id, ativo, primeiro_login)
SELECT
    au.id,
    'virginia@beflyminascentro.com.br',
    COALESCE(au.raw_user_meta_data->>'nome', 'Virginia'),
    (SELECT id FROM perfis WHERE nome = 'Gerente'), -- Altere aqui se quiser outro perfil
    true,
    true
FROM auth.users au
WHERE au.email = 'virginia@beflyminascentro.com.br'
AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = 'virginia@beflyminascentro.com.br'
);

-- Verificar se foi inserido
SELECT
    u.id,
    u.email,
    u.nome,
    u.perfil_id,
    p.nome as perfil_nome,
    u.ativo,
    u.primeiro_login
FROM users u
LEFT JOIN perfis p ON p.id = u.perfil_id
WHERE u.email = 'virginia@beflyminascentro.com.br';
