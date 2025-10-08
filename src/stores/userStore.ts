import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Permission {
  id: number;
  nome: string;
  descricao: string;
  modulo: string;
  acao: string;
  created_at: string;
  updated_at: string;
}

export interface UserGroup {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface User {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  ativo: boolean;
  primeiro_login: boolean;
  ultimo_login?: string;
  grupo_id?: number;
  created_at: string;
  updated_at: string;
  grupo?: UserGroup;
}

export interface UserPermission {
  user_id: string;
  permission_id: number;
  granted_at: string;
  granted_by: string;
}

export interface GroupPermission {
  grupo_id: number;
  permission_id: number;
  created_at: string;
}

interface UserStore {
  users: User[];
  groups: UserGroup[];
  permissions: Permission[];
  currentUser: User | null;
  userPermissions: Permission[];
  loading: boolean;
  error: string | null;

  // User management
  fetchUsers: () => Promise<void>;
  createUser: (userData: Partial<User> & { password: string; grupo_id?: number }) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  resetUserPassword: (id: string, newPassword: string) => Promise<void>;
  
  // Group management
  fetchGroups: () => Promise<void>;
  createGroup: (groupData: Partial<UserGroup>) => Promise<void>;
  updateGroup: (id: number, groupData: Partial<UserGroup>) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
  
  // Permission management
  fetchPermissions: () => Promise<void>;
  fetchUserPermissions: (userId: string) => Promise<Permission[]>;
  fetchGroupPermissions: (groupId: number) => Promise<Permission[]>;
  assignPermissionToUser: (userId: string, permissionId: number) => Promise<void>;
  removePermissionFromUser: (userId: string, permissionId: number) => Promise<void>;
  assignPermissionToGroup: (groupId: number, permissionId: number) => Promise<void>;
  removePermissionFromGroup: (groupId: number, permissionId: number) => Promise<void>;
  
  // Authentication & Authorization
  getCurrentUser: () => Promise<void>;
  checkPermission: (module: string, action: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
  
  // Utility functions
  getUserById: (id: string) => User | undefined;
  getGroupById: (id: number) => UserGroup | undefined;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  groups: [],
  permissions: [],
  currentUser: null,
  userPermissions: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          grupo:grupos(*)
        `)
        .order('nome');

      if (error) throw error;
      set({ users: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email!,
        password: userData.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Criar registro na tabela usuarios
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          email: userData.email,
          nome: userData.nome,
          telefone: userData.telefone,
          grupo_id: userData.grupo_id,
          ativo: true,
          primeiro_login: true,
        });

      if (dbError) throw dbError;

      await get().fetchUsers();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateUser: async (id, userData) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await get().fetchUsers();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      // Desativar usuário em vez de deletar
      const { error } = await supabase
        .from('usuarios')
        .update({ 
          ativo: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await get().fetchUsers();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  toggleUserStatus: async (id) => {
    const user = get().getUserById(id);
    if (!user) return;

    await get().updateUser(id, { ativo: !user.ativo });
  },

  resetUserPassword: async (id, newPassword) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.admin.updateUserById(id, {
        password: newPassword,
      });

      if (error) throw error;

      // Marcar como primeiro login para forçar alteração de senha
      await get().updateUser(id, { primeiro_login: true });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('grupos')
        .select(`
          *,
          permissions:grupo_permissoes(
            permission:permissoes(*)
          )
        `)
        .order('nome');

      if (error) throw error;
      
      // Transformar dados para incluir permissões diretamente
      const groupsWithPermissions = data?.map(group => ({
        ...group,
        permissions: group.permissions?.map((gp: any) => gp.permission) || []
      })) || [];

      set({ groups: groupsWithPermissions });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createGroup: async (groupData) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('grupos')
        .insert({
          ...groupData,
          ativo: true,
        });

      if (error) throw error;
      await get().fetchGroups();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateGroup: async (id, groupData) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('grupos')
        .update({
          ...groupData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await get().fetchGroups();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteGroup: async (id) => {
    set({ loading: true, error: null });
    try {
      // Verificar se há usuários no grupo
      const { data: users } = await supabase
        .from('usuarios')
        .select('id')
        .eq('grupo_id', id)
        .eq('ativo', true);

      if (users && users.length > 0) {
        throw new Error('Não é possível excluir um grupo que possui usuários ativos');
      }

      const { error } = await supabase
        .from('grupos')
        .update({ 
          ativo: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await get().fetchGroups();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchPermissions: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('permissoes')
        .select('*')
        .order('modulo', { ascending: true })
        .order('acao', { ascending: true });

      if (error) throw error;
      set({ permissions: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserPermissions: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuario_permissoes')
        .select(`
          permission:permissoes(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map((up: any) => up.permission) || [];
    } catch (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      return [];
    }
  },

  fetchGroupPermissions: async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('grupo_permissoes')
        .select(`
          permission:permissoes(*)
        `)
        .eq('grupo_id', groupId);

      if (error) throw error;
      return data?.map((gp: any) => gp.permission) || [];
    } catch (error) {
      console.error('Erro ao buscar permissões do grupo:', error);
      return [];
    }
  },

  assignPermissionToUser: async (userId, permissionId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('usuario_permissoes')
        .insert({
          user_id: userId,
          permission_id: permissionId,
          granted_by: get().currentUser?.id || '',
        });

      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removePermissionFromUser: async (userId, permissionId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('usuario_permissoes')
        .delete()
        .eq('user_id', userId)
        .eq('permission_id', permissionId);

      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  assignPermissionToGroup: async (groupId, permissionId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('grupo_permissoes')
        .insert({
          grupo_id: groupId,
          permission_id: permissionId,
        });

      if (error) throw error;
      await get().fetchGroups();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removePermissionFromGroup: async (groupId, permissionId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('grupo_permissoes')
        .delete()
        .eq('grupo_id', groupId)
        .eq('permission_id', permissionId);

      if (error) throw error;
      await get().fetchGroups();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select(`
            *,
            grupo:grupos(*)
          `)
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Buscar permissões do usuário (diretas + do grupo)
        const userPermissions = await get().fetchUserPermissions(user.id);
        let groupPermissions: Permission[] = [];
        
        if (userData.grupo_id) {
          groupPermissions = await get().fetchGroupPermissions(userData.grupo_id);
        }

        // Combinar permissões (remover duplicatas)
        const allPermissions = [...userPermissions, ...groupPermissions];
        const uniquePermissions = allPermissions.filter((permission, index, self) =>
          index === self.findIndex(p => p.id === permission.id)
        );

        set({ 
          currentUser: userData,
          userPermissions: uniquePermissions
        });

        // Atualizar último login
        await supabase
          .from('usuarios')
          .update({ ultimo_login: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      set({ currentUser: null, userPermissions: [] });
    }
  },

  checkPermission: (module, action) => {
    const permissions = get().userPermissions;
    return permissions.some(p => p.modulo === module && p.acao === action);
  },

  hasPermission: (permissionName) => {
    const permissions = get().userPermissions;
    return permissions.some(p => p.nome === permissionName);
  },

  getUserById: (id) => {
    return get().users.find(user => user.id === id);
  },

  getGroupById: (id) => {
    return get().groups.find(group => group.id === id);
  },
}));