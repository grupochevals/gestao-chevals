import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEntityStore } from '@/stores/entityStore';
import { toast } from 'sonner';
import type { Entidade } from '@/types';

const entitySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['cliente', 'parceiro', 'fornecedor'], {
    required_error: 'Tipo é obrigatório',
  }),
  documento: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
});

type EntityFormData = z.infer<typeof entitySchema>;

interface EntityFormProps {
  entity?: Entidade | null;
  onClose: () => void;
}

export function EntityForm({ entity, onClose }: EntityFormProps) {
  const { createEntity, updateEntity, loading } = useEntityStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: entity ? {
      nome: entity.nome,
      tipo: entity.tipo as 'cliente' | 'parceiro' | 'fornecedor',
      documento: entity.documento || '',
      email: entity.email || '',
      telefone: entity.telefone || '',
      endereco: entity.endereco || '',
      cidade: entity.cidade || '',
      estado: entity.estado || '',
      cep: entity.cep || '',
      observacoes: entity.observacoes || '',
    } : {
      nome: '',
      tipo: 'cliente' as const,
      documento: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: '',
    },
  });

  const watchedTipo = watch('tipo');

  const onSubmit = async (data: EntityFormData) => {
    try {
      const entityData = {
        ...data,
        documento: data.documento || null,
        email: data.email || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        cep: data.cep || null,
        observacoes: data.observacoes || null,
      };

      if (entity) {
        await updateEntity(entity.id, entityData);
        toast.success('Entidade atualizada com sucesso!');
      } else {
        await createEntity(entityData);
        toast.success('Entidade criada com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar entidade');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            {...register('nome')}
            placeholder="Nome da entidade"
          />
          {errors.nome && (
            <p className="text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo *</Label>
          <Select
            value={watchedTipo}
            onValueChange={(value) => setValue('tipo', value as 'cliente' | 'parceiro' | 'fornecedor')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cliente">Cliente</SelectItem>
              <SelectItem value="parceiro">Parceiro</SelectItem>
              <SelectItem value="fornecedor">Fornecedor</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipo && (
            <p className="text-sm text-red-600">{errors.tipo.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="documento">Documento (CPF/CNPJ)</Label>
          <Input
            id="documento"
            {...register('documento')}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="email@exemplo.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
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
        <Label htmlFor="endereco">Endereço</Label>
        <Input
          id="endereco"
          {...register('endereco')}
          placeholder="Rua, número, complemento"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            {...register('cidade')}
            placeholder="Cidade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Input
            id="estado"
            {...register('estado')}
            placeholder="UF"
            maxLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            {...register('cep')}
            placeholder="00000-000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register('observacoes')}
          placeholder="Observações adicionais..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : entity ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}