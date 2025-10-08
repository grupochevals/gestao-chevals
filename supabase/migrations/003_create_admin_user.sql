-- Criar usuário administrador padrão
-- Este script cria um usuário administrador com credenciais padrão
-- Corrigido para trabalhar com a estrutura correta das tabelas

DO $$
DECLARE
    admin_perfil_id INTEGER; -- Mudado para INTEGER pois a tabela perfis usa SERIAL
    admin_user_id UUID := gen_random_uuid();
    perfil_exists BOOLEAN := false;
BEGIN
    -- Verificar se já existe um perfil de Administrador
    SELECT EXISTS(SELECT 1 FROM perfis WHERE nome = 'Administrador') INTO perfil_exists;
    
    -- Se não existe, criar o perfil
    IF NOT perfil_exists THEN
        INSERT INTO perfis (nome, descricao, ativo) 
        VALUES ('Administrador', 'Acesso total ao sistema', true)
        RETURNING id INTO admin_perfil_id;
        
        RAISE NOTICE 'Perfil Administrador criado com ID: %', admin_perfil_id;
    ELSE
        -- Buscar o ID do perfil existente
        SELECT id INTO admin_perfil_id FROM perfis WHERE nome = 'Administrador' LIMIT 1;
        RAISE NOTICE 'Perfil Administrador já existe com ID: %', admin_perfil_id;
    END IF;

    -- Verificar se o usuário admin já existe
    IF NOT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@gestao-chevals.com') THEN
        
        -- Inserir na tabela auth.users do Supabase
        -- Nota: Em produção, isso deve ser feito através da API do Supabase Auth
        -- Este é um exemplo para desenvolvimento/teste
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            admin_user_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@gestao-chevals.com',
            crypt('123456', gen_salt('bf')), -- Hash da senha usando bcrypt
            NOW(),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );

        -- Inserir na tabela users do sistema
        INSERT INTO users (
            id,
            email,
            nome,
            perfil_id,
            ativo,
            primeiro_login
        ) VALUES (
            admin_user_id,
            'admin@gestao-chevals.com',
            'Administrador do Sistema',
            admin_perfil_id,
            true,
            true
        );

        RAISE NOTICE 'Usuário administrador criado com sucesso!';
        RAISE NOTICE 'Email: admin@gestao-chevals.com';
        RAISE NOTICE 'Senha: 123456 (altere no primeiro login)';
        
    ELSE
        RAISE NOTICE 'Usuário administrador já existe!';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar usuário administrador: %', SQLERRM;
        RAISE NOTICE 'Tentando método alternativo...';
        
        -- Método alternativo: apenas inserir na tabela users se o auth.users já existir
        IF EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@gestao-chevals.com') THEN
            INSERT INTO users (
                id,
                email,
                nome,
                perfil_id,
                ativo,
                primeiro_login
            ) 
            SELECT 
                au.id,
                'admin@gestao-chevals.com',
                'Administrador do Sistema',
                admin_perfil_id,
                true,
                true
            FROM auth.users au 
            WHERE au.email = 'admin@gestao-chevals.com'
            AND NOT EXISTS(SELECT 1 FROM users WHERE email = 'admin@gestao-chevals.com');
            
            RAISE NOTICE 'Usuário vinculado à tabela users com sucesso!';
        END IF;
END $$;

-- Garantir que o perfil Administrador tenha todas as permissões
DO $$
DECLARE
    admin_perfil_id INTEGER; -- Corrigido para INTEGER
BEGIN
    -- Buscar o ID do perfil Administrador
    SELECT id INTO admin_perfil_id FROM perfis WHERE nome = 'Administrador' LIMIT 1;
    
    IF admin_perfil_id IS NOT NULL THEN
        -- Inserir todas as permissões para o perfil Administrador
        INSERT INTO perfil_permissoes (perfil_id, permissao_id)
        SELECT admin_perfil_id, p.id 
        FROM permissoes p
        WHERE NOT EXISTS (
            SELECT 1 FROM perfil_permissoes pp 
            WHERE pp.perfil_id = admin_perfil_id AND pp.permissao_id = p.id
        );
        
        RAISE NOTICE 'Permissões atribuídas ao perfil Administrador';
    END IF;
END $$;

-- Comentários importantes:
-- 1. A senha padrão é '123456' e deve ser alterada no primeiro login
-- 2. Em produção, use a API do Supabase Auth para criar usuários
-- 3. Este script é seguro para executar múltiplas vezes
-- 4. O usuário será criado com primeiro_login = true para forçar alteração de senha