import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useEffect } from 'react';

const unitSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  localizacao: z.string().optional(),
  capacidade: z.coerce.number().min(0, 'Capacidade deve ser maior ou igual a 0').optional().nullable(),
  valor_base: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0').optional().nullable(),
  ativo: z.boolean().default(true),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface Unidade {
  id: string;
  nome: string;
  descricao: string | null;
  localizacao: string | null;
  capacidade: number | null;
  valor_base: number | null;
  ativo: boolean;
}

interface UnitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unidade | null;
  onSuccess: () => void;
}

export function UnitFormDialog({ open, onOpenChange, unit, onSuccess }: UnitFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      localizacao: '',
      capacidade: null,
      valor_base: null,
      ativo: true,
    },
  });

  const ativo = watch('ativo');

  useEffect(() => {
    if (unit) {
      reset({
        nome: unit.nome,
        descricao: unit.descricao || '',
        localizacao: unit.localizacao || '',
        capacidade: unit.capacidade,
        valor_base: unit.valor_base,
        ativo: unit.ativo,
      });
    } else {
      reset({
        nome: '',
        descricao: '',
        localizacao: '',
        capacidade: null,
        valor_base: null,
        ativo: true,
      });
    }
  }, [unit, reset]);

  const onSubmit = async (data: UnitFormData) => {
    try {
      const unitData = {
        nome: data.nome,
        descricao: data.descricao || null,
        localizacao: data.localizacao || null,
        capacidade: data.capacidade || null,
        valor_base: data.valor_base || null,
        ativo: data.ativo,
      };

      if (unit) {
        // Atualizar
        const { error } = await supabase
          .from('unidades')
          .update(unitData)
          .eq('id', unit.id);

        if (error) throw error;
        toast.success('Unidade atualizada com sucesso!');
      } else {
        // Criar
        const { error } = await supabase
          .from('unidades')
          .insert([unitData]);

        if (error) throw error;
        toast.success('Unidade criada com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Erro ao salvar unidade:', error);
      toast.error(error.message || 'Erro ao salvar unidade');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {unit ? 'Editar Unidade' : 'Nova Unidade'}
          </DialogTitle>
          <DialogDescription>
            {unit
              ? 'Atualize as informações da unidade'
              : 'Preencha os dados para criar uma nova unidade'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Unidade *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Salão Principal, Área Externa A..."
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descrição detalhada da unidade..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="localizacao">Localização</Label>
            <Input
              id="localizacao"
              {...register('localizacao')}
              placeholder="Ex: Piso 2, Ala Norte, Prédio B..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade (pessoas)</Label>
              <Input
                id="capacidade"
                type="number"
                min="0"
                {...register('capacidade')}
                placeholder="Ex: 100"
              />
              {errors.capacidade && (
                <p className="text-sm text-red-600">{errors.capacidade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_base">Valor Base (R$)</Label>
              <Input
                id="valor_base"
                type="number"
                step="0.01"
                min="0"
                {...register('valor_base')}
                placeholder="Ex: 5000.00"
              />
              {errors.valor_base && (
                <p className="text-sm text-red-600">{errors.valor_base.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={(checked) => setValue('ativo', checked)}
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Unidade ativa
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : unit ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
