import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface CategoriaReceita {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface CategoriaDespesa {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface Receita {
  id: number;
  descricao: string;
  valor: number;
  data_receita: string;
  categoria_id: number;
  contrato_id?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  categoria?: CategoriaReceita;
}

export interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  data_despesa: string;
  categoria_id: number;
  contrato_id?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  categoria?: CategoriaDespesa;
}

export interface FechamentoEvento {
  id: number;
  contrato_id: number;
  data_fechamento: string;
  total_receitas: number;
  total_despesas: number;
  resultado: number;
  observacoes?: string;
  status: 'rascunho' | 'aprovado' | 'revisao';
  aprovado_por?: string;
  data_aprovacao?: string;
  created_at: string;
  updated_at: string;
}

interface FinancialStore {
  // Receitas
  receitas: Receita[];
  categoriasReceita: CategoriaReceita[];
  // Despesas
  despesas: Despesa[];
  categoriasDespesa: CategoriaDespesa[];
  // Fechamentos
  fechamentos: FechamentoEvento[];
  // Estados
  loading: boolean;
  error: string | null;
  
  // Actions - Receitas
  fetchReceitas: () => Promise<void>;
  fetchCategoriasReceita: () => Promise<void>;
  createReceita: (receita: Omit<Receita, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateReceita: (id: number, receita: Partial<Receita>) => Promise<void>;
  deleteReceita: (id: number) => Promise<void>;
  
  // Actions - Despesas
  fetchDespesas: () => Promise<void>;
  fetchCategoriasDespesa: () => Promise<void>;
  createDespesa: (despesa: Omit<Despesa, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDespesa: (id: number, despesa: Partial<Despesa>) => Promise<void>;
  deleteDespesa: (id: number) => Promise<void>;
  
  // Actions - Fechamentos
  fetchFechamentos: () => Promise<void>;
  createFechamento: (fechamento: Omit<FechamentoEvento, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFechamento: (id: number, fechamento: Partial<FechamentoEvento>) => Promise<void>;
  deleteFechamento: (id: number) => Promise<void>;
  
  // Utility functions
  getReceitasByContrato: (contratoId: number) => Receita[];
  getDespesasByContrato: (contratoId: number) => Despesa[];
  calculateTotals: (contratoId: number) => { totalReceitas: number; totalDespesas: number; resultado: number };
}

export const useFinancialStore = create<FinancialStore>((set, get) => ({
  receitas: [],
  categoriasReceita: [],
  despesas: [],
  categoriasDespesa: [],
  fechamentos: [],
  loading: false,
  error: null,

  // Receitas
  fetchReceitas: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select(`
          *,
          categoria:categorias_receitas(*)
        `)
        .order('data_receita', { ascending: false });

      if (error) throw error;
      set({ receitas: data || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar receitas',
        loading: false 
      });
    }
  },

  fetchCategoriasReceita: async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_receitas')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      set({ categoriasReceita: data || [] });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar categorias de receita'
      });
    }
  },

  createReceita: async (receitaData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('receitas')
        .insert([receitaData])
        .select(`
          *,
          categoria:categorias_receitas(*)
        `)
        .single();

      if (error) throw error;
      
      const { receitas } = get();
      set({ 
        receitas: [data, ...receitas],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao criar receita',
        loading: false 
      });
      throw error;
    }
  },

  updateReceita: async (id, receitaData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('receitas')
        .update({ ...receitaData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          categoria:categorias_receitas(*)
        `)
        .single();

      if (error) throw error;

      const { receitas } = get();
      set({
        receitas: receitas.map(receita => receita.id === id ? data : receita),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar receita',
        loading: false 
      });
      throw error;
    }
  },

  deleteReceita: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { receitas } = get();
      set({
        receitas: receitas.filter(receita => receita.id !== id),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao excluir receita',
        loading: false 
      });
      throw error;
    }
  },

  // Despesas
  fetchDespesas: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select(`
          *,
          categoria:categorias_despesas(*)
        `)
        .order('data_despesa', { ascending: false });

      if (error) throw error;
      set({ despesas: data || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar despesas',
        loading: false 
      });
    }
  },

  fetchCategoriasDespesa: async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_despesas')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      set({ categoriasDespesa: data || [] });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar categorias de despesa'
      });
    }
  },

  createDespesa: async (despesaData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('despesas')
        .insert([despesaData])
        .select(`
          *,
          categoria:categorias_despesas(*)
        `)
        .single();

      if (error) throw error;
      
      const { despesas } = get();
      set({ 
        despesas: [data, ...despesas],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao criar despesa',
        loading: false 
      });
      throw error;
    }
  },

  updateDespesa: async (id, despesaData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('despesas')
        .update({ ...despesaData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          categoria:categorias_despesas(*)
        `)
        .single();

      if (error) throw error;

      const { despesas } = get();
      set({
        despesas: despesas.map(despesa => despesa.id === id ? data : despesa),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar despesa',
        loading: false 
      });
      throw error;
    }
  },

  deleteDespesa: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { despesas } = get();
      set({
        despesas: despesas.filter(despesa => despesa.id !== id),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao excluir despesa',
        loading: false 
      });
      throw error;
    }
  },

  // Fechamentos
  fetchFechamentos: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('fechamentos_eventos')
        .select('*')
        .order('data_fechamento', { ascending: false });

      if (error) throw error;
      set({ fechamentos: data || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar fechamentos',
        loading: false 
      });
    }
  },

  createFechamento: async (fechamentoData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('fechamentos_eventos')
        .insert([fechamentoData])
        .select()
        .single();

      if (error) throw error;
      
      const { fechamentos } = get();
      set({ 
        fechamentos: [data, ...fechamentos],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao criar fechamento',
        loading: false 
      });
      throw error;
    }
  },

  updateFechamento: async (id, fechamentoData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('fechamentos_eventos')
        .update({ ...fechamentoData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { fechamentos } = get();
      set({
        fechamentos: fechamentos.map(fechamento => fechamento.id === id ? data : fechamento),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar fechamento',
        loading: false 
      });
      throw error;
    }
  },

  deleteFechamento: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('fechamentos_eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { fechamentos } = get();
      set({
        fechamentos: fechamentos.filter(fechamento => fechamento.id !== id),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao excluir fechamento',
        loading: false 
      });
      throw error;
    }
  },

  // Utility functions
  getReceitasByContrato: (contratoId) => {
    const { receitas } = get();
    return receitas.filter(receita => receita.contrato_id === contratoId);
  },

  getDespesasByContrato: (contratoId) => {
    const { despesas } = get();
    return despesas.filter(despesa => despesa.contrato_id === contratoId);
  },

  calculateTotals: (contratoId) => {
    const { receitas, despesas } = get();
    const receitasContrato = receitas.filter(r => r.contrato_id === contratoId);
    const despesasContrato = despesas.filter(d => d.contrato_id === contratoId);
    
    const totalReceitas = receitasContrato.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = despesasContrato.reduce((sum, d) => sum + d.valor, 0);
    const resultado = totalReceitas - totalDespesas;
    
    return { totalReceitas, totalDespesas, resultado };
  },
}));