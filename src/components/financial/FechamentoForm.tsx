import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFinancialStore } from '@/stores/financialStore';
import { useContractStore } from '@/stores/contractStore';
import { toast } from 'sonner';
import type { FechamentoEvento } from '@/stores/financialStore';

const fechamentoSchema = z.object({
  contrato_id: z.number().min(1, 'Contrato é obrigatório'),
  data_fechamento: z.string().min(1, 'Data é obrigatória'),
  total_receitas: z.number().min(0, 'Total de receitas deve ser maior ou igual a zero'),
  total_despesas: z.number().min(0, 'Total de despesas deve ser maior ou igual a zero'),
  resultado_liquido: z.number(),
  status: z.enum(['pendente', 'aprovado', 'rejeitado']),
  observacoes: z.string().optional(),
});

type FechamentoFormData = z.infer<typeof fechamentoSchema>;

interface FechamentoFormProps {
  fechamento?: FechamentoEvento | null;
  onClose: () => void;
}

export function FechamentoForm({ fechamento, onClose }: FechamentoFormProps) {
  const { 
    receitas,
    despesas,
    loading, 
    createFechamento, 
    updateFechamento,
    fetchReceitas,
    fetchDespesas
  } = useFinancialStore();
  const { contracts, fetchContracts } = useContractStore();
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FechamentoFormData>({
    resolver: zodResolver(fechamentoSchema),
    defaultValues: {
      contrato_id: 0,
      data_fechamento: new Date().toISOString().split('T')[0],
      total_receitas: 0,
      total_despesas: 0,
      resultado_liquido: 0,
      status: 'pendente',
      observacoes: '',
    },
  });

  useEffect(() => {
    fetchContracts();
    fetchReceitas();
    fetchDespesas();
  }, [fetchContracts, fetchReceitas, fetchDespesas]);

  useEffect(() => {
    if (fechamento) {
      setValue('contrato_id', fechamento.contrato_id);
      setValue('data_fechamento', fechamento.data_fechamento);
      setValue('total_receitas', fechamento.total_receitas);
      setValue('total_despesas', fechamento.total_despesas);
      setValue('resultado_liquido', fechamento.resultado_liquido);
      setValue('status', fechamento.status as 'pendente' | 'aprovado' | 'rejeitado');
      setValue('observacoes', fechamento.observacoes || '');
      setSelectedContractId(fechamento.contrato_id);
    }
  }, [fechamento, setValue]);

  const watchedContratoId = watch('contrato_id');
  const watchedTotalReceitas = watch('total_receitas');
  const watchedTotalDespesas = watch('total_despesas');
  const watchedStatus = watch('status');

  // Calcular totais automaticamente quando o contrato é selecionado
  useEffect(() => {
    if (watchedContratoId && watchedContratoId !== selectedContractId) {
      setSelectedContractId(watchedContratoId);
      
      const receitasContrato = receitas.filter(r => r.contrato_id === watchedContratoId);
      const despesasContrato = despesas.filter(d => d.contrato_id === watchedContratoId);
      
      const totalReceitas = receitasContrato.reduce((sum, r) => sum + r.valor, 0);
      const totalDespesas = despesasContrato.reduce((sum, d) => sum + d.valor, 0);
      
      setValue('total_receitas', totalReceitas);
      setValue('total_despesas', totalDespesas);
    }
  }, [watchedContratoId, receitas, despesas, setValue, selectedContractId]);

  // Calcular resultado líquido automaticamente
  useEffect(() => {
    const resultado = watchedTotalReceitas - watchedTotalDespesas;
    setValue('resultado_liquido', resultado);
  }, [watchedTotalReceitas, watchedTotalDespesas, setValue]);

  const onSubmit = async (data: FechamentoFormData) => {
    try {
      if (fechamento) {
        await updateFechamento(fechamento.id, data);
        toast.success('Fechamento atualizado com sucesso!');
      } else {
        await createFechamento(data);
        toast.success('Fechamento criado com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar fechamento');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getContractReceitas = () => {
    if (!watchedContratoId) return [];
    return receitas.filter(r => r.contrato_id === watchedContratoId);
  };

  const getContractDespesas = () => {
    if (!watchedContratoId) return [];
    return despesas.filter(d => d.contrato_id === watchedContratoId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contrato_id">Contrato *</Label>
          <Select
            value={watchedContratoId?.toString() || ''}
            onValueChange={(value) => setValue('contrato_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um contrato" />
            </SelectTrigger>
            <SelectContent>
              {contracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id.toString()}>
                  {contract.nome_evento} - {contract.entidade?.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contrato_id && (
            <p className="text-sm text-red-600">{errors.contrato_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_fechamento">Data do Fechamento *</Label>
          <Input
            id="data_fechamento"
            type="date"
            {...register('data_fechamento')}
          />
          {errors.data_fechamento && (
            <p className="text-sm text-red-600">{errors.data_fechamento.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={watchedStatus}
            onValueChange={(value) => setValue('status', value as 'pendente' | 'aprovado' | 'rejeitado')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(watchedTotalReceitas)}
            </div>
            <Input
              type="hidden"
              {...register('total_receitas', { valueAsNumber: true })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(watchedTotalDespesas)}
            </div>
            <Input
              type="hidden"
              {...register('total_despesas', { valueAsNumber: true })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              watchedTotalReceitas - watchedTotalDespesas >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(watchedTotalReceitas - watchedTotalDespesas)}
            </div>
            <Input
              type="hidden"
              {...register('resultado_liquido', { valueAsNumber: true })}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento das Receitas e Despesas */}
      {watchedContratoId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-600">
                Receitas do Contrato ({getContractReceitas().length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-40 overflow-y-auto">
              {getContractReceitas().map((receita) => (
                <div key={receita.id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                  <span className="text-sm">{receita.descricao}</span>
                  <Badge variant="outline" className="text-green-600">
                    {formatCurrency(receita.valor)}
                  </Badge>
                </div>
              ))}
              {getContractReceitas().length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma receita encontrada</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-red-600">
                Despesas do Contrato ({getContractDespesas().length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-40 overflow-y-auto">
              {getContractDespesas().map((despesa) => (
                <div key={despesa.id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                  <span className="text-sm">{despesa.descricao}</span>
                  <Badge variant="outline" className="text-red-600">
                    {formatCurrency(despesa.valor)}
                  </Badge>
                </div>
              ))}
              {getContractDespesas().length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma despesa encontrada</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register('observacoes')}
          placeholder="Observações sobre o fechamento do evento"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Salvando...' : fechamento ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}