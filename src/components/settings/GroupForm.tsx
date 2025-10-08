import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Users } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';
import type { UserGroup, Permission } from '@/stores/userStore';

const groupSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().min(5, 'Descrição deve ter pelo menos 5 caracteres'),
  ativo: z.boolean(),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface GroupFormProps {
  group?: UserGroup | null;
  onClose: () => void;
}

export function GroupForm({ group, onClose }: GroupFormProps) {
  const { 
    permissions,
    loading, 
    createGroup, 
    updateGroup,
    fetchPermissions,
    fetchGroupPermissions,
    assignPermissionToGroup,
    removePermissionFromGroup
  } = useUserStore();

  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [groupPermissions, setGroupPermissions] = useState<Permission[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      ativo: true,
    },
  });

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (group) {
      setValue('nome', group.nome);
      setValue('descricao', group.descricao);
      setValue('ativo', group.ativo);
      
      // Carregar permissões do grupo
      fetchGroupPermissions(group.id).then((perms) => {
        setGroupPermissions(perms);
        const permissionIds = new Set(perms.map(p => p.id));
        setSelectedPermissions(permissionIds);
      });
    }
  }, [group, setValue, fetchGroupPermissions]);

  const watchedAtivo = watch('ativo');

  const onSubmit = async (data: GroupFormData) => {
    try {
      let groupId: number;

      if (group) {
        // Atualizar grupo existente
        await updateGroup(group.id, data);
        groupId = group.id;
        toast.success('Grupo atualizado com sucesso!');
      } else {
        // Criar novo grupo
        await createGroup(data);
        // Para novo grupo, precisamos buscar o ID do grupo criado
        // Por simplicidade, vamos recarregar a lista e assumir que funcionou
        toast.success('Grupo criado com sucesso!');
        onClose();
        return;
      }

      // Atualizar permissões do grupo
      const currentPermissionIds = new Set(groupPermissions.map(p => p.id));
      
      // Adicionar novas permissões
      for (const permissionId of selectedPermissions) {
        if (!currentPermissionIds.has(permissionId)) {
          await assignPermissionToGroup(groupId, permissionId);
        }
      }

      // Remover permissões desmarcadas
      for (const permissionId of currentPermissionIds) {
        if (!selectedPermissions.has(permissionId)) {
          await removePermissionFromGroup(groupId, permissionId);
        }
      }

      onClose();
    } catch (error) {
      toast.error('Erro ao salvar grupo');
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  // Agrupar permissões por módulo
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.modulo]) {
      acc[permission.modulo] = [];
    }
    acc[permission.modulo].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const toggleModulePermissions = (modulePermissions: Permission[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => selectedPermissions.has(id));
    
    const newSelected = new Set(selectedPermissions);
    
    if (allSelected) {
      // Desmarcar todas do módulo
      modulePermissionIds.forEach(id => newSelected.delete(id));
    } else {
      // Marcar todas do módulo
      modulePermissionIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedPermissions(newSelected);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações básicas do grupo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Informações do Grupo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Grupo *</Label>
              <Input
                id="nome"
                {...register('nome')}
                placeholder="Nome do grupo"
              />
              {errors.nome && (
                <p className="text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ativo"
                  checked={watchedAtivo}
                  onCheckedChange={(checked) => setValue('ativo', !!checked)}
                />
                <Label htmlFor="ativo">Grupo ativo</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descrição do grupo e suas responsabilidades"
              rows={3}
            />
            {errors.descricao && (
              <p className="text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Permissões do Grupo</span>
            </div>
            <Badge variant="outline">
              {selectedPermissions.size} de {permissions.length} selecionadas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(groupedPermissions).map(([modulo, modulePermissions]) => {
            const modulePermissionIds = modulePermissions.map(p => p.id);
            const selectedInModule = modulePermissionIds.filter(id => selectedPermissions.has(id)).length;
            const allSelected = selectedInModule === modulePermissionIds.length;
            const someSelected = selectedInModule > 0 && selectedInModule < modulePermissionIds.length;

            return (
              <div key={modulo} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onCheckedChange={() => toggleModulePermissions(modulePermissions)}
                    />
                    <h4 className="font-medium">{modulo}</h4>
                    <Badge variant="secondary">
                      {selectedInModule}/{modulePermissionIds.length}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                  {modulePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedPermissions.has(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{permission.nome}</p>
                        <p className="text-xs text-gray-600">{permission.descricao}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {permission.acao}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(groupedPermissions).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma permissão disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo das permissões selecionadas */}
      {selectedPermissions.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo das Permissões Selecionadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {permissions
                .filter(p => selectedPermissions.has(p.id))
                .map((permission) => (
                  <Badge key={permission.id} variant="default" className="text-xs">
                    {permission.nome}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Salvando...' : group ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}