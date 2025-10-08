import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Key,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { UserForm } from './UserForm';
import { PasswordResetForm } from './PasswordResetForm';
import { toast } from 'sonner';
import type { User } from '@/stores/userStore';

export function UsersList() {
  const { 
    users, 
    loading, 
    fetchUsers, 
    deleteUser, 
    toggleUserStatus 
  } = useUserStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Tem certeza que deseja desativar o usuário ${user.nome}?`)) {
      try {
        await deleteUser(user.id);
        toast.success('Usuário desativado com sucesso!');
      } catch (error) {
        toast.error('Erro ao desativar usuário');
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatus(user.id);
      toast.success(`Usuário ${user.ativo ? 'desativado' : 'ativado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handlePasswordReset = (user: User) => {
    setSelectedUser(user);
    setIsPasswordResetOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-4">
      {/* Header com busca e botão de adicionar */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedUser(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              user={selectedUser}
              onClose={() => {
                setIsFormOpen(false);
                setSelectedUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de usuários */}
      {loading ? (
        <div className="text-center py-8">Carregando usuários...</div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-semibold text-lg">{user.nome}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.telefone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{user.telefone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant={user.ativo ? "default" : "secondary"}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    
                    {user.grupo && (
                      <Badge variant="outline">
                        {user.grupo.nome}
                      </Badge>
                    )}
                    
                    {user.primeiro_login && (
                      <Badge variant="destructive">
                        Primeiro Login
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Criado em: {formatDate(user.created_at)}</span>
                    </div>
                    {user.ultimo_login && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Último login: {formatDateTime(user.ultimo_login)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => handlePasswordReset(user)}>
                      <Key className="h-4 w-4 mr-2" />
                      Redefinir Senha
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                      {user.ativo ? (
                        <>
                          <UserX className="h-4 w-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => handleDelete(user)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </div>
          )}
        </div>
      )}

      {/* Dialog para redefinir senha */}
      <Dialog open={isPasswordResetOpen} onOpenChange={setIsPasswordResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <PasswordResetForm
              user={selectedUser}
              onClose={() => {
                setIsPasswordResetOpen(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}