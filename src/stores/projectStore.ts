import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Projeto {
  id: number;
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  status: 'planejamento' | 'ativo' | 'concluido' | 'cancelado';
  orcamento?: number;
  responsavel?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectStore {
  projects: Projeto[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Projeto, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProject: (id: number, project: Partial<Projeto>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  getProjectById: (id: number) => Projeto | undefined;
  getProjectsByStatus: (status: string) => Projeto[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ projects: data || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar projetos',
        loading: false 
      });
    }
  },

  createProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projetos')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;
      
      const { projects } = get();
      set({ 
        projects: [data, ...projects],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao criar projeto',
        loading: false 
      });
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projetos')
        .update({ ...projectData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { projects } = get();
      set({
        projects: projects.map(project => project.id === id ? data : project),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar projeto',
        loading: false 
      });
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('projetos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { projects } = get();
      set({
        projects: projects.filter(project => project.id !== id),
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao excluir projeto',
        loading: false 
      });
      throw error;
    }
  },

  getProjectById: (id) => {
    const { projects } = get();
    return projects.find(project => project.id === id);
  },

  getProjectsByStatus: (status) => {
    const { projects } = get();
    return projects.filter(project => project.status === status);
  },
}));