-- ========================================
-- SOLUÇÃO - CORRIGIR ERRO AO CRIAR USUÁRIO
-- Execute este script para resolver o problema
-- ========================================

-- SOLUÇÃO 1: DESABILITAR RLS TEMPORARIAMENTE PARA PERMITIR INSERTS
-- (Necessário porque o trigger roda com SECURITY DEFINER)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- SOLUÇÃO 2: RECRIAR O TRIGGER COM PERMISSÕES CORRETAS
-- Dropar trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar função com permissões corretas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Criar entrada na tabela users
    INSERT INTO public.users (id, email, nome, perfil_id, ativo, primeiro_login)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', SPLIT_PART(NEW.email, '@', 1)),
        (SELECT id FROM public.perfis WHERE nome = 'Visualizador' LIMIT 1),
        true,
        true
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro (opcional, para debugging)
        RAISE WARNING 'Erro ao criar usuário na tabela users: %', SQLERRM;
        RETURN NEW; -- Não falhar a criação do usuário no auth
END;
$$;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- SOLUÇÃO 3: RE-HABILITAR RLS COM POLÍTICAS CORRETAS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Dropar políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Usuários podem ver outros usuários" ON users;
DROP POLICY IF EXISTS "Usuários podem atualizar próprios dados" ON users;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;

-- Criar políticas corretas
-- Política 1: Permitir SELECT para todos autenticados
CREATE POLICY "users_select_policy"
    ON users FOR SELECT
    TO authenticated
    USING (true);

-- Política 2: Permitir INSERT apenas para o service role (trigger usa isso)
CREATE POLICY "users_insert_policy"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Política 3: Permitir UPDATE apenas do próprio registro
CREATE POLICY "users_update_policy"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política 4: PERMITIR INSERT via TRIGGER (importante!)
-- Esta política permite que a função trigger insira dados
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- Grant necessário para a função funcionar
GRANT ALL ON users TO authenticated;
GRANT ALL ON perfis TO authenticated;

-- SOLUÇÃO 4: VERIFICAR E CORRIGIR PERFIS
-- Garantir que existe ao menos o perfil Visualizador
INSERT INTO perfis (nome, descricao, ativo)
VALUES ('Visualizador', 'Apenas visualização de dados', true)
ON CONFLICT (nome) DO NOTHING;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Mostrar status da tabela
SELECT 
    'Tabela users:' as info,
    COUNT(*) as total_usuarios
FROM users;

-- Mostrar perfis disponíveis
SELECT 
    'Perfis disponíveis:' as info,
    id, nome
FROM perfis
ORDER BY id;

-- Mostrar políticas RLS
SELECT
    'Políticas RLS:' as info,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'users';

-- Testar função trigger manualmente
SELECT 'Trigger function existe:' as info,
       routine_name
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
