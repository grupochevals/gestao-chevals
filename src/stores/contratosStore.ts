import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Contrato, ContratoFormData } from '@/types/contratos';

interface ContratosState {
  contratos: Contrato[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchContratos: () => Promise<void>;
  createContrato: (data: ContratoFormData) => Promise<Contrato | null>;
  updateContrato: (id: string, data: Partial<ContratoFormData>) => Promise<Contrato | null>;
  deleteContrato: (id: string) => Promise<boolean>;
  getContratoById: (id: string) => Contrato | undefined;
}

export const useContratosStore = create<ContratosState>((set, get) => ({
  contratos: [],
  loading: false,
  error: null,

  fetchContratos: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          *,
          projetos:projeto_id(nome),
          entidades:entidade_id(nome),
          unidades:unidade_id(nome),
          espacos:espaco_id(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ contratos: data || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar contratos',
        loading: false 
      });
    }
  },

  createContrato: async (data: ContratoFormData) => {
    set({ loading: true, error: null });
    
    try {
      const { data: contrato, error } = await supabase
        .from('contratos')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      const { contratos } = get();
      set({ 
        contratos: [contrato, ...contratos],
        loading: false 
      });

      return contrato;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao criar contrato',
        loading: false 
      });
      return null;
    }
  },

  updateContrato: async (id: string, data: Partial<ContratoFormData>) => {
    set({ loading: true, error: null });
    
    try {
      const { data: contrato, error } = await supabase
        .from('contratos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      const { contratos } = get();
      set({ 
        contratos: contratos.map(c => c.id === id ? contrato : c),
        loading: false 
      });

      return contrato;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar contrato',
        loading: false 
      });
      return null;
    }
  },

  deleteContrato: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remover da lista local
      const { contratos } = get();
      set({ 
        contratos: contratos.filter(c => c.id !== id),
        loading: false 
      });

      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao excluir contrato',
        loading: false 
      });
      return false;
    }
  },

  getContratoById: (id: string) => {
    const { contratos } = get();
    return contratos.find(c => c.id === id);
  },
}));
