import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialStore } from '@/stores/financialStore';
import { useContractStore } from '@/stores/contractStore';
import { toast } from 'sonner';
import type { Despesa } from '@/stores/financialStore';

const despesaSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  data_despesa: z.string().min(1, 'Data é obrigatória'),
  categoria_id: z.number().min(1, 'Categoria é obrigatória'),
  contrato_id: z.number().optional(),
  observacoes: z.string().optional(),
});

type DespesaFormData = z.infer<typeof despesaSchema>;

interface DespesaFormProps {
  despesa?: Despesa | null;
  onClose: () => void;
}

export function DespesaForm({ despesa, onClose }: DespesaFormProps) {
  const { 
    categoriasDespesa, 
    loading, 
    createDespesa, 
    updateDespesa,
    fetchCategoriasDespesa 
  } = useFinancialStore();
  const { contracts, fetchContracts } = useContractStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DespesaFormData>({
    resolver: zodResolver(despesaSchema),
    defaultValues: {
      descricao: '',
      valor: 0,
      data_despesa: new Date().toISOString().split('T')[0],
      categoria_id: 0,
      contrato_id: undefined,
      observacoes: '',
    },
  });

  useEffect(() => {
    fetchCategoriasDespesa();
    fetchContracts();
  }, [fetchCategoriasDespesa, fetchContracts]);

  useEffect(() => {
    if (despesa) {
      setValue('descricao', despesa.descricao);
      setValue('valor', despesa.valor);
      setValue('data_despesa', despesa.data_despesa);
      setValue('categoria_id', despesa.categoria_id);
      setValue('contrato_id', despesa.contrato_id || undefined);
      setValue('observacoes', despesa.observacoes || '');
    }
  }, [despesa, setValue]);

  const onSubmit = async (data: DespesaFormData) => {
    try {
      if (despesa) {
        await updateDespesa(despesa.id, data);
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await createDespesa(data);
        toast.success('Despesa criada com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar despesa');
    }
  };

  const watchedCategoriaId = watch('categoria_id');
  const watchedContratoId = watch('contrato_id');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            {...register('descricao')}
            placeholder="Descrição da despesa"
          />
          {errors.descricao && (
            <p className="text-sm text-red-600">{errors.descricao.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            {...register('valor', { valueAsNumber: true })}
            placeholder="0,00"
          />
          {errors.valor && (
            <p className="text-sm text-red-600">{errors.valor.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_despesa">Data da Despesa *</Label>
          <Input
            id="data_despesa"
            type="date"
            {...register('data_despesa')}
          />
          {errors.data_despesa && (
            <p className="text-sm text-red-600">{errors.data_despesa.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria_id">Categoria *</Label>
          <Select
            value={watchedCategoriaId?.toString() || ''}
            onValueChange={(value) => setValue('categoria_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoriasDespesa.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id.toString()}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoria_id && (
            <p className="text-sm text-red-600">{errors.categoria_id.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contrato_id">Contrato (Opcional)</Label>
          <Select
            value={watchedContratoId?.toString() || ''}
            onValueChange={(value) => setValue('contrato_id', value ? parseInt(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um contrato (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum contrato</SelectItem>
              {contracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id.toString()}>
                  {contract.nome_evento} - {contract.entidade?.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            {...register('observacoes')}
            placeholder="Observações adicionais sobre a despesa"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Salvando...' : despesa ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}