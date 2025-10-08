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
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const espacoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  localizacao: z.string().optional(),
  capacidade: z.coerce.number().min(0).optional().nullable(),
  valor_base: z.coerce.number().min(0).optional().nullable(),
  empresa_id: z.string().nullable(),
  ativo: z.boolean().default(true),
});

type EspacoFormData = z.infer<typeof espacoSchema>;

interface Espaco {
  id: string;
  nome: string;
  descricao: string | null;
  localizacao: string | null;
  capacidade: number | null;
  valor_base: number | null;
  empresa_id: string | null;
  ativo: boolean;
}

interface Empresa {
  id: string;
  nome: string;
}

interface EspacoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  espaco: Espaco | null;
  empresaId?: string | null;
  onSuccess: () => void;
}

export function EspacoFormDialog({
  open,
  onOpenChange,
  espaco,
  empresaId,
  onSuccess,
}: EspacoFormDialogProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EspacoFormData>({
    resolver: zodResolver(espacoSchema),
  });

  const ativo = watch('ativo');
  const selectedEmpresaId = watch('empresa_id');

  useEffect(() => {
    fetchEmpresas();
  }, []);

  useEffect(() => {
    if (espaco) {
      reset({
        nome: espaco.nome,
        descricao: espaco.descricao || '',
        localizacao: espaco.localizacao || '',
        capacidade: espaco.capacidade,
        valor_base: espaco.valor_base,
        empresa_id: espaco.empresa_id,
        ativo: espaco.ativo,
      });
    } else {
      reset({
        nome: '',
        descricao: '',
        localizacao: '',
        capacidade: null,
        valor_base: null,
        empresa_id: empresaId || null,
        ativo: true,
      });
    }
  }, [espaco, empresaId, reset]);

  const fetchEmpresas = async () => {
    const { data } = await supabase
      .from('empresas')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome');

    setEmpresas(data || []);
  };

  const onSubmit = async (data: EspacoFormData) => {
    try {
      const espacoData = {
        nome: data.nome,
        descricao: data.descricao || null,
        localizacao: data.localizacao || null,
        capacidade: data.capacidade || null,
        valor_base: data.valor_base || null,
        empresa_id: data.empresa_id || null,
        ativo: data.ativo,
      };

      if (espaco) {
        const { error } = await supabase
          .from('unidades')
          .update(espacoData)
          .eq('id', espaco.id);

        if (error) throw error;
        toast.success('Espaço atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('unidades').insert([espacoData]);

        if (error) throw error;
        toast.success('Espaço criado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Erro ao salvar espaço:', error);
      toast.error(error.message || 'Erro ao salvar espaço');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{espaco ? 'Editar Espaço' : 'Novo Espaço'}</DialogTitle>
          <DialogDescription>
            {espaco
              ? 'Atualize as informações do espaço'
              : 'Preencha os dados para criar um novo espaço'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empresa_id">Empresa</Label>
            <Select
              value={selectedEmpresaId || 'none'}
              onValueChange={(value) => setValue('empresa_id', value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Espaço *</Label>
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
              placeholder="Descrição detalhada do espaço..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="localizacao">Localização</Label>
            <Input
              id="localizacao"
              {...register('localizacao')}
              placeholder="Ex: Piso 2, Ala Norte..."
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
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={(checked) => setValue('ativo', checked)}
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Espaço ativo
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
              {isSubmitting ? 'Salvando...' : espaco ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
