import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Contrato } from '@/types';

interface ContractState {
  contracts: Contrato[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchContracts: () => Promise<void>;
  createContract: (contract: Omit<Contrato, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateContract: (id: string | number, contract: Partial<Contrato>) => Promise<void>;
  deleteContract: (id: string | number) => Promise<void>;
  getContractById: (id: string | number) => Contrato | undefined;
}

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: [],
  loading: false,
  error: null,

  fetchContracts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          *,
          unidades:unidade_id(id, nome),
          projetos:projeto_id(id, nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ contracts: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createContract: async (contract) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contratos')
        .insert([contract])
        .select()
        .single();

      if (error) throw error;
      
      const { contracts } = get();
      set({ 
        contracts: [data, ...contracts], 
        loading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateContract: async (id, contract) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contratos')
        .update(contract)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { contracts } = get();
      set({
        contracts: contracts.map(c => c.id == id ? { ...c, ...data } : c),
        loading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteContract: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { contracts } = get();
      set({
        contracts: contracts.filter(c => c.id != id),
        loading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getContractById: (id) => {
    const { contracts } = get();
    return contracts.find(c => c.id == id);
  }
}));