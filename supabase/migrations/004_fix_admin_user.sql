-- Verificar e corrigir o usuário administrador
-- Este script verifica se o usuário admin existe e o cria se necessário

-- Primeiro, vamos verificar se o usuário existe na tabela auth.users
DO $$
DECLARE
    admin_user_id UUID;
    admin_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se o usuário admin existe
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@gestao-chevals.com';
    
    IF admin_user_id IS NOT NULL THEN
        admin_exists := TRUE;
        RAISE NOTICE 'Usuário admin encontrado com ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Usuário admin não encontrado, será criado';
    END IF;
    
    -- Se não existe, criar o usuário usando a função auth.users
    IF NOT admin_exists THEN
        -- Inserir diretamente na tabela auth.users (método correto para Supabase)
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            invited_at,
            confirmation_token,
            confirmation_sent_at,
            recovery_token,
            recovery_sent_at,
            email_change_token_new,
            email_change,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at,
            is_sso_user,
            deleted_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@gestao-chevals.com',
            crypt('123456', gen_salt('bf')), -- Hash da senha usando bcrypt
            NOW(),
            NOW(),
            '',
            NOW(),
            '',
            NULL,
            '',
            '',
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            FALSE,
            NOW(),
            NOW(),
            NULL,
            NULL,
            '',
            '',
            NULL,
            '',
            0,
            NULL,
            '',
            NULL,
            FALSE,
            NULL
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Usuário admin criado com ID: %', admin_user_id;
    END IF;
    
    -- Verificar se existe na tabela public.users
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@gestao-chevals.com') THEN
        -- Inserir na tabela public.users
        INSERT INTO public.users (
            id,
            email,
            nome,
            perfil_id,
            ativo,
            primeiro_login,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'admin@gestao-chevals.com',
            'Administrador',
            1, -- ID do perfil Administrador
            true,
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Usuário admin inserido na tabela public.users';
    ELSE
        RAISE NOTICE 'Usuário admin já existe na tabela public.users';
    END IF;
    
END $$;