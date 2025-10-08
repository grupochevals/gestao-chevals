import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFinancialStore } from '@/stores/financialStore';
import { useContractStore } from '@/stores/contractStore';
import { toast } from 'sonner';
import type { Receita } from '@/stores/financialStore';

const receitaSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  data_receita: z.string().min(1, 'Data é obrigatória'),
  categoria_id: z.number().min(1, 'Categoria é obrigatória'),
  contrato_id: z.number().optional(),
  observacoes: z.string().optional(),
});

type ReceitaFormData = z.infer<typeof receitaSchema>;

interface ReceitaFormProps {
  receita?: Receita | null;
  onClose: () => void;
}

export function ReceitaForm({ receita, onClose }: ReceitaFormProps) {
  const { 
    createReceita, 
    updateReceita, 
    loading, 
    categoriasReceita,
    fetchCategoriasReceita 
  } = useFinancialStore();
  
  const { contracts, fetchContracts } = useContractStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchema),
    defaultValues: receita ? {
      descricao: receita.descricao,
      valor: receita.valor,
      data_receita: receita.data_receita.split('T')[0],
      categoria_id: receita.categoria_id,
      contrato_id: receita.contrato_id || undefined,
      observacoes: receita.observacoes || '',
    } : {
      descricao: '',
      valor: 0,
      data_receita: new Date().toISOString().split('T')[0],
      categoria_id: 0,
      contrato_id: undefined,
      observacoes: '',
    },
  });

  const watchedCategoriaId = watch('categoria_id');
  const watchedContratoId = watch('contrato_id');

  useEffect(() => {
    fetchCategoriasReceita();
    fetchContracts();
  }, [fetchCategoriasReceita, fetchContracts]);

  const onSubmit = async (data: ReceitaFormData) => {
    try {
      const receitaData = {
        ...data,
        contrato_id: data.contrato_id || null,
        observacoes: data.observacoes || null,
      };

      if (receita) {
        await updateReceita(receita.id, receitaData);
        toast.success('Receita atualizada com sucesso!');
      } else {
        await createReceita(receitaData);
        toast.success('Receita criada com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar receita');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            {...register('descricao')}
            placeholder="Descrição da receita"
          />
          {errors.descricao && (
            <p className="text-sm text-red-600">{errors.descricao.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            min="0"
            {...register('valor', { valueAsNumber: true })}
            placeholder="0,00"
          />
          {errors.valor && (
            <p className="text-sm text-red-600">{errors.valor.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_receita">Data da Receita *</Label>
          <Input
            id="data_receita"
            type="date"
            {...register('data_receita')}
          />
          {errors.data_receita && (
            <p className="text-sm text-red-600">{errors.data_receita.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria_id">Categoria *</Label>
          <Select
            value={watchedCategoriaId?.toString()}
            onValueChange={(value) => setValue('categoria_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoriasReceita.map((categoria) => (
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="contrato_id">Contrato (Opcional)</Label>
        <Select
          value={watchedContratoId?.toString() || ''}
          onValueChange={(value) => setValue('contrato_id', value ? parseInt(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o contrato (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum contrato</SelectItem>
            {contracts.map((contrato) => (
              <SelectItem key={contrato.id} value={contrato.id.toString()}>
                {contrato.nome_evento} - {contrato.cliente}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {loading ? 'Salvando...' : receita ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}