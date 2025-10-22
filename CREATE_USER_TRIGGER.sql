-- ========================================
-- TRIGGER: Criar registro em users automaticamente
-- ========================================

-- 1. CRIAR FUNÇÃO DO TRIGGER
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, perfil_id, ativo, primeiro_login)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    1, -- Perfil padrão (será atualizado depois)
    true,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CRIAR TRIGGER
-- ========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. VERIFICAÇÃO
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Trigger criado com sucesso!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Agora novos usuários terão registro automático na tabela users';
    RAISE NOTICE '========================================';
END $$;
