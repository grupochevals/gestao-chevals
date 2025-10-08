-- ============================================================================
-- SCRIPT SIMPLIFICADO DE RESET - APENAS PUBLIC SCHEMA
-- ============================================================================
-- Este script NÃO tenta modificar o schema auth (que é gerenciado pelo Supabase)
-- Apenas prepara o schema public para receber novos usuários
-- ============================================================================

-- ETAPA 1: Garantir que o perfil Administrador existe
-- ----------------------------------------------------------------------------
INSERT INTO public.perfis (id, nome, descricao, ativo, created_at, updated_at)
VALUES (1, 'Administrador', 'Perfil com acesso total ao sistema', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- ETAPA 2: Limpar tabela pública de usuários
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        TRUNCATE TABLE public.users CASCADE;
    END IF;
    RAISE NOTICE 'Tabela public.users limpa';
END $$;

-- ETAPA 3: Desabilitar RLS temporariamente
-- ----------------------------------------------------------------------------
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;

-- ETAPA 4: Limpar todas as políticas RLS antigas
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
    RAISE NOTICE 'Políticas RLS antigas removidas';
END $$;

-- ETAPA 5: Recriar políticas RLS básicas
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

-- ETAPA 6: Criar função para sincronizar usuário auth -> public
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

-- ETAPA 7: Criar trigger para auto-sincronização
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ETAPA 8: Verificação final
-- ----------------------------------------------------------------------------
SELECT
    'Schema público resetado com sucesso!' as status,
    (SELECT count(*) FROM auth.users) as total_auth_users,
    (SELECT count(*) FROM public.users) as total_public_users,
    (SELECT count(*) FROM public.perfis) as total_perfis;

-- ============================================================================
-- PRÓXIMOS PASSOS MANUAIS (OBRIGATÓRIOS):
-- ============================================================================
-- O problema está NO SCHEMA AUTH do Supabase, que você NÃO pode modificar via SQL.
--
-- SOLUÇÃO: Criar novo projeto Supabase
-- ============================================================================
-- Infelizmente, se o schema auth está corrompido e você não tem permissões
-- de superusuário, a única solução é:
--
-- 1. Fazer backup dos dados importantes:
--    - Exportar dados de public.perfis
--    - Exportar dados de public.users (se houver)
--
-- 2. Criar um NOVO projeto Supabase:
--    - Acesse: https://supabase.com/dashboard
--    - Clique em "New Project"
--    - Configure com nome: gestao-chevals-v2
--
-- 3. Executar as migrations no novo projeto:
--    - Use os arquivos em supabase/migrations/
--
-- 4. Atualizar .env com as novas credenciais:
--    - VITE_SUPABASE_URL=<nova_url>
--    - VITE_SUPABASE_ANON_KEY=<nova_key>
--
-- 5. Criar usuário admin no novo projeto:
--    - Authentication > Users > Add User
--    - Email: admin@gestao-chevals.com
--    - Password: admin123
--    - Marcar "Auto Confirm User"
--
-- ============================================================================
-- ALTERNATIVA: Contatar suporte Supabase
-- ============================================================================
-- Se não quiser criar novo projeto, abra um ticket:
-- https://supabase.com/dashboard/support/new
--
-- Informe:
-- - Projeto: gestao-chevals
-- - Erro: "Database error querying schema" em auth.users
-- - Solicite reset do schema auth ou upgrade de permissões
-- ============================================================================
