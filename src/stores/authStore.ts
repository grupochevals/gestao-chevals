import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Perfil } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
    await supabase.auth.signOut();
    set({ user: null, profile: null, loading: false });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ loading: true, error: null });
    try {
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