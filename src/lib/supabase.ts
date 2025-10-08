import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nome: string;
          perfil_id: number;
          ativo: boolean;
          primeiro_login: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          nome: string;
          perfil_id: number;
          ativo?: boolean;
          primeiro_login?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nome?: string;
          perfil_id?: number;
          ativo?: boolean;
          primeiro_login?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      perfis: {
        Row: {
          id: number;
          nome: string;
          descricao: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          nome: string;
          descricao?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          nome?: string;
          descricao?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Adicionar outros tipos de tabelas conforme necessário
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};