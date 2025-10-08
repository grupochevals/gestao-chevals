-- Script corrigido para criar usuário administrador no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, criar o perfil Administrador se não existir
-- A tabela perfis tem PRIMARY KEY em 'id', então podemos usar ON CONFLICT sem especificar coluna
INSERT INTO public.perfis (id, nome, descricao, ativo, created_at, updated_at)
VALUES (1, 'Administrador', 'Perfil com acesso total ao sistema', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. Criar o usuário na tabela auth.users
-- Como auth.users não tem constraint UNIQUE no email, usamos uma abordagem com DO block
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Verificar se o usuário já existe
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@gestao-chevals.com';
    
    -- Se não existir, criar o usuário
    IF admin_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_sent_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_sent_at,
            recovery_token
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'admin@gestao-chevals.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            NOW(),
            ''
        );
        RAISE NOTICE 'Usuário admin criado na tabela auth.users';
    ELSE
        RAISE NOTICE 'Usuário admin já existe na tabela auth.users com ID: %', admin_user_id;
    END IF;
END $$;

-- 3. Inserir o usuário na tabela public.users
-- A tabela public.users tem PRIMARY KEY em 'id', então podemos usar ON CONFLICT sem especificar coluna
WITH admin_user AS (
    SELECT id FROM auth.users WHERE email = 'admin@gestao-chevals.com'
)
INSERT INTO public.users (
    id,
    email,
    nome,
    perfil_id,
    ativo,
    primeiro_login,
    created_at,
    updated_at
)
SELECT 
    admin_user.id,
    'admin@gestao-chevals.com',
    'Administrador',
    1,
    true,
    true,
    NOW(),
    NOW()
FROM admin_user
ON CONFLICT DO NOTHING;

-- 4. Verificar se o usuário foi criado corretamente
SELECT 
    au.id,
    au.email as auth_email,
    au.created_at as auth_created,
    pu.nome,
    pu.perfil_id,
    pu.ativo,
    pu.primeiro_login,
    p.nome as perfil_nome
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
LEFT JOIN public.perfis p ON pu.perfil_id = p.id
WHERE au.email = 'admin@gestao-chevals.com';