import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const receitaSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  projeto_id: z.string().nullable(),
  valor: z.string().min(1, 'Valor é obrigatório'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  data_pagamento: z.string().optional(),
  status: z.enum(['pendente', 'pago', 'cancelado']),
  observacoes: z.string().optional(),
});

type ReceitaFormData = z.infer<typeof receitaSchema>;

interface Receita {
  id: string;
  projeto_id: string | null;
  tipo: 'receita';
  categoria: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'cancelado';
  observacoes: string | null;
  created_at: string;
}

interface ReceitaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receita?: Receita | null;
  onSuccess: () => void;
}

export function ReceitaFormDialog({
  open,
  onOpenChange,
  receita,
  onSuccess,
}: ReceitaFormDialogProps) {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchema),
    defaultValues: {
      descricao: '',
      categoria: '',
      projeto_id: null,
      valor: '',
      data_vencimento: '',
      data_pagamento: '',
      status: 'pendente',
      observacoes: '',
    },
  });

  const selectedCategoria = watch('categoria');
  const selectedProjeto = watch('projeto_id');
  const selectedStatus = watch('status');

  useEffect(() => {
    if (open) {
      fetchProjetos();
      fetchCategorias();
    }
  }, [open]);

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('id, nome, cor')
        .in('tipo', ['receita', 'ambos'])
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const fetchProjetos = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  useEffect(() => {
    if (receita) {
      reset({
        descricao: receita.descricao,
        categoria: receita.categoria,
        projeto_id: receita.projeto_id,
        valor: receita.valor.toString(),
        data_vencimento: receita.data_vencimento,
        data_pagamento: receita.data_pagamento || '',
        status: receita.status,
        observacoes: receita.observacoes || '',
      });
    } else {
      reset({
        descricao: '',
        categoria: '',
        projeto_id: null,
        valor: '',
        data_vencimento: '',
        data_pagamento: '',
        status: 'pendente',
        observacoes: '',
      });
    }
  }, [receita, reset, open]);

  const onSubmit = async (data: ReceitaFormData) => {
    try {
      const receitaData = {
        tipo: 'receita' as const,
        descricao: data.descricao,
        categoria: data.categoria,
        projeto_id: data.projeto_id,
        valor: parseFloat(data.valor),
        data_vencimento: data.data_vencimento,
        data_pagamento: data.data_pagamento || null,
        status: data.status,
        observacoes: data.observacoes || null,
      };

      if (receita) {
        const { error } = await supabase
          .from('movimentacoes_financeiras')
          .update(receitaData)
          .eq('id', receita.id);

        if (error) throw error;
        toast.success('Receita atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('movimentacoes_financeiras')
          .insert([receitaData]);

        if (error) throw error;
        toast.success('Receita criada com sucesso');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {receita ? 'Editar Receita' : 'Nova Receita'}
          </DialogTitle>
          <DialogDescription>
            {receita
              ? 'Atualize as informações da receita'
              : 'Preencha os dados da nova receita'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Informações Básicas
            </h3>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={selectedCategoria}
                  onValueChange={(value) => setValue('categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nome}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoria && (
                  <p className="text-sm text-red-600">{errors.categoria.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projeto_id">Projeto/Evento</Label>
                <Select
                  value={selectedProjeto || 'none'}
                  onValueChange={(value) =>
                    setValue('projeto_id', value === 'none' ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {projetos.map((projeto) => (
                      <SelectItem key={projeto.id} value={projeto.id}>
                        {projeto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Valores e Datas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Valores e Datas
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valor')}
                  placeholder="0,00"
                />
                {errors.valor && (
                  <p className="text-sm text-red-600">{errors.valor.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_vencimento">Vencimento *</Label>
                <Input
                  id="data_vencimento"
                  type="date"
                  {...register('data_vencimento')}
                />
                {errors.data_vencimento && (
                  <p className="text-sm text-red-600">
                    {errors.data_vencimento.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                <Input
                  id="data_pagamento"
                  type="date"
                  {...register('data_pagamento')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setValue('status', value as 'pendente' | 'pago' | 'cancelado')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Observações</h3>

            <div className="space-y-2">
              <Textarea
                id="observacoes"
                {...register('observacoes')}
                placeholder="Observações adicionais"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : receita
                ? 'Atualizar'
                : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
