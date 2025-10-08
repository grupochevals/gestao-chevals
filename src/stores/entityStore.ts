import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Entidade } from '@/types';

interface EntityState {
  entities: Entidade[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEntities: () => Promise<void>;
  createEntity: (entity: Omit<Entidade, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEntity: (id: string | number, entity: Partial<Entidade>) => Promise<void>;
  deleteEntity: (id: string | number) => Promise<void>;
  getEntityById: (id: string | number) => Entidade | undefined;
  getEntitiesByType: (type: 'cliente' | 'parceiro' | 'fornecedor') => Entidade[];
}

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: [],
  loading: false,
  error: null,

  fetchEntities: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('entidades')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      set({ entities: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createEntity: async (entity) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('entidades')
        .insert([entity])
        .select()
        .single();

      if (error) throw error;
      
      const { entities } = get();
      set({ 
        entities: [...entities, data].sort((a, b) => a.nome.localeCompare(b.nome)), 
        loading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateEntity: async (id, entity) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('entidades')
        .update(entity)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { entities } = get();
      set({
        entities: entities.map(e => e.id == id ? { ...e, ...data } : e),
        loading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteEntity: async (id) => {
    set({ loading: true, error: null });
    try {
      // Soft delete - apenas marca como inativo
      const { error } = await supabase
        .from('entidades')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      const { entities } = get();
      set({
        entities: entities.filter(e => e.id != id),
        loading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getEntityById: (id) => {
    const { entities } = get();
    return entities.find(e => e.id == id);
  },

  getEntitiesByType: (type) => {
    const { entities } = get();
    return entities.filter(e => e.tipo === type);
  }
}));