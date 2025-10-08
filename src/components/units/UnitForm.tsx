import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUnitStore } from '@/stores/unitStore';
import { toast } from 'sonner';
import type { Unidade } from '@/stores/unitStore';

const unitSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  capacidade_maxima: z.number().min(1, 'Capacidade deve ser maior que 0'),
  observacoes: z.string().optional(),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface UnitFormProps {
  unit?: Unidade | null;
  onClose: () => void;
}

export function UnitForm({ unit, onClose }: UnitFormProps) {
  const { createUnit, updateUnit, loading } = useUnitStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: unit ? {
      nome: unit.nome,
      endereco: unit.endereco,
      cidade: unit.cidade,
      estado: unit.estado,
      cep: unit.cep,
      capacidade_maxima: unit.capacidade_maxima,
      observacoes: unit.observacoes || '',
    } : {
      nome: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      capacidade_maxima: 0,
      observacoes: '',
    },
  });

  const onSubmit = async (data: UnitFormData) => {
    try {
      const unitData = {
        ...data,
        observacoes: data.observacoes || null,
        ativo: true,
      };

      if (unit) {
        await updateUnit(unit.id, unitData);
        toast.success('Unidade atualizada com sucesso!');
      } else {
        await createUnit(unitData);
        toast.success('Unidade criada com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar unidade');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Unidade *</Label>
        <Input
          id="nome"
          {...register('nome')}
          placeholder="Nome da unidade"
        />
        {errors.nome && (
          <p className="text-sm text-red-600">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço *</Label>
        <Input
          id="endereco"
          {...register('endereco')}
          placeholder="Rua, número, complemento"
        />
        {errors.endereco && (
          <p className="text-sm text-red-600">{errors.endereco.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            {...register('cidade')}
            placeholder="Cidade"
          />
          {errors.cidade && (
            <p className="text-sm text-red-600">{errors.cidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado *</Label>
          <Input
            id="estado"
            {...register('estado')}
            placeholder="UF"
            maxLength={2}
            style={{ textTransform: 'uppercase' }}
          />
          {errors.estado && (
            <p className="text-sm text-red-600">{errors.estado.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cep">CEP *</Label>
          <Input
            id="cep"
            {...register('cep')}
            placeholder="00000-000"
          />
          {errors.cep && (
            <p className="text-sm text-red-600">{errors.cep.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacidade_maxima">Capacidade Máxima *</Label>
        <Input
          id="capacidade_maxima"
          type="number"
          min="1"
          {...register('capacidade_maxima', { valueAsNumber: true })}
          placeholder="Número máximo de pessoas"
        />
        {errors.capacidade_maxima && (
          <p className="text-sm text-red-600">{errors.capacidade_maxima.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register('observacoes')}
          placeholder="Observações adicionais sobre a unidade..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : unit ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}