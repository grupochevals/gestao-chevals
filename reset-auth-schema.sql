-- ============================================================================
-- SCRIPT DE RESET COMPLETO DO SCHEMA DE AUTENTICAÇÃO SUPABASE
-- ============================================================================
-- ATENÇÃO: Este script tenta reparar o schema de autenticação corrompido
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================================

-- ETAPA 1: Verificar e habilitar extensões essenciais
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- ETAPA 2: Limpar dados existentes (preservando estrutura)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    -- Limpar sessões e refresh tokens (se existirem)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'refresh_tokens') THEN
        TRUNCATE TABLE auth.refresh_tokens CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'sessions') THEN
        TRUNCATE TABLE auth.sessions CASCADE;
    END IF;

    -- Limpar dados de autenticação de usuários (se tabelas existirem)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'identities') THEN
        DELETE FROM auth.identities;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'mfa_factors') THEN
        DELETE FROM auth.mfa_factors;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'mfa_challenges') THEN
        DELETE FROM auth.mfa_challenges;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'mfa_amr_claims') THEN
        DELETE FROM auth.mfa_amr_claims;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'sso_providers') THEN
        DELETE FROM auth.sso_providers;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'sso_domains') THEN
        DELETE FROM auth.sso_domains;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'saml_providers') THEN
        DELETE FROM auth.saml_providers;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'saml_relay_states') THEN
        DELETE FROM auth.saml_relay_states;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'flow_state') THEN
        DELETE FROM auth.flow_state;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'audit_log_entries') THEN
        DELETE FROM auth.audit_log_entries;
    END IF;

    -- Limpar tabela pública de usuários
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        TRUNCATE TABLE public.users CASCADE;
    END IF;

    RAISE NOTICE 'Dados limpos com sucesso';
END $$;

-- ETAPA 3: Recriar índices do schema auth (se necessário)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    -- Índice para auth.users por email
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'auth' AND tablename = 'users' AND indexname = 'users_email_key') THEN
        CREATE UNIQUE INDEX users_email_key ON auth.users (email);
    END IF;

    -- Índice para auth.users por instance_id e email
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'auth' AND tablename = 'users' AND indexname = 'users_instance_id_email_idx') THEN
        CREATE INDEX users_instance_id_email_idx ON auth.users (instance_id, lower(email));
    END IF;
END $$;

-- ETAPA 4: Garantir que o perfil Administrador existe
-- ----------------------------------------------------------------------------
INSERT INTO public.perfis (id, nome, descricao, ativo, created_at, updated_at)
VALUES (1, 'Administrador', 'Perfil com acesso total ao sistema', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- ETAPA 5: Desabilitar RLS temporariamente
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'perfis') THEN
        ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ETAPA 6: Limpar todas as políticas RLS antigas
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename IN ('users', 'perfis')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ETAPA 7: Recriar políticas RLS básicas
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de perfis para usuários autenticados"
ON public.perfis FOR SELECT
TO authenticated
USING (ativo = true);

CREATE POLICY "Usuários podem ver próprio perfil"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ETAPA 8: Criar função para sincronizar usuário auth -> public
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, perfil_id, ativo, primeiro_login)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'perfil_id')::int, 1),
    true,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ETAPA 9: Criar trigger para auto-sincronização
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ETAPA 10: Verificar permissões do schema auth
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT SELECT ON auth.users TO anon, authenticated;

-- ETAPA 11: Verificação final
-- ----------------------------------------------------------------------------
SELECT
    'Schema de autenticação resetado com sucesso!' as status,
    (SELECT count(*) FROM auth.users) as total_auth_users,
    (SELECT count(*) FROM public.users) as total_public_users,
    (SELECT count(*) FROM public.perfis) as total_perfis;

-- ============================================================================
-- PRÓXIMOS PASSOS MANUAIS (OBRIGATÓRIOS):
-- ============================================================================
-- 1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard
-- 2. Vá para seu projeto
-- 3. Navegue para: Authentication > Users
-- 4. Clique em "Add User" / "Invite User"
-- 5. Preencha:
--    - Email: admin@gestao-chevals.com
--    - Password: admin123
--    - Marque "Auto Confirm User" (confirmar email automaticamente)
-- 6. Clique em "Create User"
-- 7. O trigger criará automaticamente o registro em public.users
--
-- Após criar o usuário, teste o login na aplicação!
-- ============================================================================
