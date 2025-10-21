import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Perfil } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  MOCK_ENABLED,
  MOCK_USER,
  MOCK_PROFILE,
  validateMockCredentials
} from '@/lib/mockData';

interface AuthState {
  user: SupabaseUser | null;
  profile: Perfil | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresPasswordChange?: boolean }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  initialize: () => Promise<void>;
  updateUserProfile: (profile: Perfil) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      // Modo Mock - Login sem banco de dados
      if (MOCK_ENABLED) {
        console.log('🔐 [MOCK MODE] Tentando login com:', email);

        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        if (validateMockCredentials(email, password)) {
          console.log('✅ [MOCK MODE] Login bem-sucedido!');
          console.log('👤 [MOCK MODE] Usuário:', MOCK_USER);

          const newState = {
            user: MOCK_USER as SupabaseUser,
            profile: MOCK_PROFILE,
            loading: false,
            initialized: true
          };

          console.log('📦 [MOCK MODE] Atualizando estado para:', newState);
          set(newState);

          // Verificar se o estado foi atualizado
          const currentState = get();
          console.log('✓ [MOCK MODE] Estado atual após set:', {
            user: !!currentState.user,
            userId: currentState.user?.id,
            initialized: currentState.initialized
          });

          return { success: true, requiresPasswordChange: false };
        } else {
          console.log('❌ [MOCK MODE] Credenciais inválidas');
          set({ loading: false, error: 'Credenciais inválidas' });
          return { success: false, error: 'Credenciais inválidas' };
        }
      }

      // Modo Normal - Login com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
        }

        // Verificar se é primeiro login (senha padrão)
        const requiresPasswordChange = profile?.primeiro_login === true;

        if (requiresPasswordChange) {
          // Atualizar flag de primeiro login
          await supabase
            .from('users')
            .update({ primeiro_login: false })
            .eq('id', data.user.id);
        }

        set({
          user: data.user,
          profile: profile || null,
          loading: false
        });

        return {
          success: true,
          requiresPasswordChange
        };
      }

      return { success: false, error: 'Usuário não encontrado' };
    } catch (error: any) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    set({ loading: true });

    // Modo Mock - Logout sem banco de dados
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ user: null, profile: null, loading: false });
      return;
    }

    // Modo Normal - Logout com Supabase
    await supabase.auth.signOut();
    set({ user: null, profile: null, loading: false });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ loading: true, error: null });

    try {
      // Modo Mock - Alterar senha sem banco de dados
      if (MOCK_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ loading: false });
        return { success: true };
      }

      // Modo Normal - Alterar senha com Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      set({ loading: false });
      return { success: true };
    } catch (error: any) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });

    try {
      // Modo Mock - Inicialização sem banco de dados
      if (MOCK_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, 300));
        set({
          user: null,
          profile: null,
          loading: false,
          initialized: true
        });
        return;
      }

      // Modo Normal - Inicialização com Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: session.user,
          profile,
          loading: false,
          initialized: true
        });
      } else {
        set({
          user: null,
          profile: null,
          loading: false,
          initialized: true
        });
      }

      // Escutar mudanças de autenticação
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({
            user: session.user,
            profile
          });
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            profile: null
          });
        }
      });
    } catch (error) {
      set({
        loading: false,
        initialized: true
      });
    }
  },

  updateUserProfile: (profile: Perfil) => {
    set({ profile });
  },
}));