import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';
import type { User } from '@/stores/userStore';

const userSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  grupo_id: z.number().optional(),
  ativo: z.boolean(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
}

export function UserForm({ user, onClose }: UserFormProps) {
  const { 
    groups,
    loading, 
    createUser, 
    updateUser,
    fetchGroups
  } = useUserStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      grupo_id: undefined,
      ativo: true,
      password: '',
    },
  });

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (user) {
      setValue('nome', user.nome);
      setValue('email', user.email);
      setValue('telefone', user.telefone || '');
      setValue('grupo_id', user.grupo_id);
      setValue('ativo', user.ativo);
    }
  }, [user, setValue]);

  const watchedAtivo = watch('ativo');
  const watchedGrupoId = watch('grupo_id');

  const onSubmit = async (data: UserFormData) => {
    try {
      if (user) {
        // Atualizar usuário existente
        const updateData = {
          nome: data.nome,
          telefone: data.telefone,
          grupo_id: data.grupo_id,
          ativo: data.ativo,
        };
        await updateUser(user.id, updateData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        if (!data.password) {
          toast.error('Senha é obrigatória para novos usuários');
          return;
        }
        await createUser({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          grupo_id: data.grupo_id,
          password: data.password,
        });
        toast.success('Usuário criado com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar usuário');
    }
  };

  const activeGroups = groups.filter(group => group.ativo);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            {...register('nome')}
            placeholder="Nome completo do usuário"
          />
          {errors.nome && (
            <p className="text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="email@exemplo.com"
            disabled={!!user} // Email não pode ser alterado após criação
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
          {user && (
            <p className="text-xs text-gray-500">
              O email não pode ser alterado após a criação do usuário
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            {...register('telefone')}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grupo_id">Grupo</Label>
          <Select
            value={watchedGrupoId?.toString() || ''}
            onValueChange={(value) => setValue('grupo_id', value ? parseInt(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum grupo</SelectItem>
              {activeGroups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!user && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Senha temporária (usuário deve alterar no primeiro login)"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500">
              O usuário será obrigado a alterar a senha no primeiro login
            </p>
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ativo"
              checked={watchedAtivo}
              onCheckedChange={(checked) => setValue('ativo', !!checked)}
            />
            <Label htmlFor="ativo">Usuário ativo</Label>
          </div>
          <p className="text-xs text-gray-500">
            Usuários inativos não podem fazer login no sistema
          </p>
        </div>
      </div>

      {/* Informações do grupo selecionado */}
      {watchedGrupoId && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Informações do Grupo</h4>
          {(() => {
            const selectedGroup = groups.find(g => g.id === watchedGrupoId);
            if (selectedGroup) {
              return (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Nome:</strong> {selectedGroup.nome}
                  </p>
                  <p className="text-sm">
                    <strong>Descrição:</strong> {selectedGroup.descricao}
                  </p>
                  {selectedGroup.permissions && selectedGroup.permissions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Permissões do grupo:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedGroup.permissions.map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {permission.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}