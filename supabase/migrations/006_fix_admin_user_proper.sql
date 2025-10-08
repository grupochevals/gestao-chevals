-- Corrigir usuário administrador e políticas RLS
-- Este script cria o usuário admin corretamente e ajusta as políticas RLS

-- Primeiro, vamos verificar se o usuário admin existe
DO $$
DECLARE
    admin_user_id UUID;
    admin_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se o usuário admin existe na tabela auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@gestao-chevals.com';
    
    IF admin_user_id IS NOT NULL THEN
        admin_exists := TRUE;
        RAISE NOTICE 'Usuário admin encontrado com ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Usuário admin não encontrado, será criado';
        
        -- Criar o usuário usando a função do Supabase
        -- Nota: Em produção, use a API do Supabase para criar usuários
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

-- Criar políticas RLS mais permissivas para permitir login
-- Política para permitir que usuários vejam seus próprios dados
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem seus próprios dados
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Política para permitir inserção de novos usuários (para o sistema)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
CREATE POLICY "Enable insert for authenticated users only" ON public.users
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura dos perfis
DROP POLICY IF EXISTS "Enable read access for all users" ON public.perfis;
CREATE POLICY "Enable read access for all users" ON public.perfis
    FOR SELECT USING (true);

-- Verificar se o perfil Administrador existe
-- Usar DO NOTHING sem especificar coluna, pois a tabela tem PRIMARY KEY em id
INSERT INTO public.perfis (id, nome, descricao, ativo, created_at, updated_at)
VALUES (1, 'Administrador', 'Perfil com acesso total ao sistema', true, NOW(), NOW())
ON CONFLICT DO NOTHING;