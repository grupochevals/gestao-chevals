import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield,
  Users,
  Settings
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { GroupForm } from './GroupForm';
import { PermissionsManager } from './PermissionsManager';
import { toast } from 'sonner';
import type { UserGroup } from '@/stores/userStore';

export function GroupsList() {
  const { 
    groups, 
    permissions,
    users,
    loading, 
    fetchGroups, 
    fetchPermissions,
    fetchUsers,
    deleteGroup 
  } = useUserStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');

  useEffect(() => {
    fetchGroups();
    fetchPermissions();
    fetchUsers();
  }, [fetchGroups, fetchPermissions, fetchUsers]);

  const filteredGroups = groups.filter(group =>
    group.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (group: UserGroup) => {
    setSelectedGroup(group);
    setIsFormOpen(true);
  };

  const handleDelete = async (group: UserGroup) => {
    if (window.confirm(`Tem certeza que deseja excluir o grupo ${group.nome}?`)) {
      try {
        await deleteGroup(group.id);
        toast.success('Grupo excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir grupo');
      }
    }
  };

  const getUsersInGroup = (groupId: number) => {
    return users.filter(user => user.grupo_id === groupId && user.ativo);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.modulo]) {
      acc[permission.modulo] = [];
    }
    acc[permission.modulo].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="groups" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Grupos</span>
        </TabsTrigger>
        <TabsTrigger value="permissions" className="flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <span>Permissões</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="groups" className="space-y-4">
        {/* Header com busca e botão de adicionar */}
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedGroup(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedGroup ? 'Editar Grupo' : 'Novo Grupo'}
                </DialogTitle>
              </DialogHeader>
              <GroupForm
                group={selectedGroup}
                onClose={() => {
                  setIsFormOpen(false);
                  setSelectedGroup(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de grupos */}
        {loading ? (
          <div className="text-center py-8">Carregando grupos...</div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => {
              const usersInGroup = getUsersInGroup(group.id);
              return (
                <div
                  key={group.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-lg">{group.nome}</h3>
                          <p className="text-gray-600 text-sm">{group.descricao}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant={group.ativo ? "default" : "secondary"}>
                          {group.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{usersInGroup.length} usuário(s)</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Shield className="h-3 w-3" />
                          <span>{group.permissions?.length || 0} permissão(ões)</span>
                        </div>
                      </div>
                      
                      {group.permissions && group.permissions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Permissões:</p>
                          <div className="flex flex-wrap gap-1">
                            {group.permissions.slice(0, 5).map((permission) => (
                              <span
                                key={permission.id}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {permission.nome}
                              </span>
                            ))}
                            {group.permissions.length > 5 && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                +{group.permissions.length - 5} mais
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Criado em: {formatDate(group.created_at)}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(group)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleDelete(group)}
                          className="text-red-600"
                          disabled={usersInGroup.length > 0}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo cadastrado'}
              </div>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="permissions" className="space-y-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Permissões do Sistema</h3>
            <p className="text-gray-600 text-sm">
              Visualize todas as permissões disponíveis no sistema, organizadas por módulo.
            </p>
          </div>

          {Object.entries(groupedPermissions).map(([modulo, modulePermissions]) => (
            <div key={modulo} className="border rounded-lg p-4">
              <h4 className="font-medium text-lg mb-3 flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>{modulo}</span>
                <Badge variant="outline">{modulePermissions.length}</Badge>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {modulePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="border rounded p-3 bg-gray-50"
                  >
                    <h5 className="font-medium text-sm">{permission.nome}</h5>
                    <p className="text-xs text-gray-600 mt-1">{permission.descricao}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {permission.acao}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedPermissions).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma permissão encontrada
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}