import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Unidade {
  id: number;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  capacidade_maxima: number;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface UnitStore {
  units: Unidade[];
  loading: boolean;
  error: string | null;
  fetchUnits: () => Promise<void>;
  createUnit: (unit: Omit<Unidade, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateUnit: (id: number, unit: Partial<Unidade>) => Promise<void>;
  deleteUnit: (id: number) => Promise<void>;
  getUnitById: (id: number) => Unidade | undefined;
}

export const useUnitStore = create<UnitStore>((set, get) => ({
  units: [],
  loading: false,
  error: null,

  fetchUnits: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      set({ units: data || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar unidades',
        loading: false 
      });
    }
  },

  createUnit: async (unitData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('unidades')
        .insert([unitData])
        .select()
        .single();

      if (error) throw error;
      
      const { units } = get();
      set({ 
        units: [...units, data],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao criar unidade',
        loading: false 
      });
      throw error;
    }
  },

  updateUnit: async (id, unitData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('unidades')
        .update({ ...unitData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { units } = get();
      set({
        units: units.map(unit => unit.id === id ? data : unit),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar unidade',
        loading: false 
      });
      throw error;
    }
  },

  deleteUnit: async (id) => {
    set({ loading: true, error: null });
    try {
      // Soft delete - marca como inativo
      const { error } = await supabase
        .from('unidades')
        .update({ 
          ativo: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      const { units } = get();
      set({
        units: units.filter(unit => unit.id !== id),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao excluir unidade',
        loading: false 
      });
      throw error;
    }
  },

  getUnitById: (id) => {
    const { units } = get();
    return units.find(unit => unit.id === id);
  },
}));