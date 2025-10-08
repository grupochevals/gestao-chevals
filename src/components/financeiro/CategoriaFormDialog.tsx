import { useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['receita', 'despesa', 'ambos']),
  descricao: z.string().optional(),
  cor: z.string().min(1, 'Cor é obrigatória'),
  ativo: z.boolean(),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'ambos';
  descricao: string | null;
  cor: string;
  ativo: boolean;
  created_at: string;
}

interface CategoriaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria?: Categoria | null;
  onSuccess: () => void;
}

const CORES_SUGERIDAS = [
  { nome: 'Verde', valor: '#10b981' },
  { nome: 'Azul', valor: '#3b82f6' },
  { nome: 'Roxo', valor: '#8b5cf6' },
  { nome: 'Ciano', valor: '#06b6d4' },
  { nome: 'Laranja', valor: '#f59e0b' },
  { nome: 'Vermelho', valor: '#ef4444' },
  { nome: 'Rosa', valor: '#ec4899' },
  { nome: 'Lima', valor: '#84cc16' },
  { nome: 'Cinza', valor: '#6b7280' },
];

export function CategoriaFormDialog({
  open,
  onOpenChange,
  categoria,
  onSuccess,
}: CategoriaFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: '',
      tipo: 'receita',
      descricao: '',
      cor: '#10b981',
      ativo: true,
    },
  });

  const selectedTipo = watch('tipo');
  const selectedCor = watch('cor');
  const ativo = watch('ativo');

  useEffect(() => {
    if (categoria) {
      reset({
        nome: categoria.nome,
        tipo: categoria.tipo,
        descricao: categoria.descricao || '',
        cor: categoria.cor,
        ativo: categoria.ativo,
      });
    } else {
      reset({
        nome: '',
        tipo: 'receita',
        descricao: '',
        cor: '#10b981',
        ativo: true,
      });
    }
  }, [categoria, reset, open]);

  const onSubmit = async (data: CategoriaFormData) => {
    try {
      const categoriaData = {
        nome: data.nome,
        tipo: data.tipo,
        descricao: data.descricao || null,
        cor: data.cor,
        ativo: data.ativo,
      };

      if (categoria) {
        const { error } = await supabase
          .from('categorias_financeiras')
          .update(categoriaData)
          .eq('id', categoria.id);

        if (error) throw error;
        toast.success('Categoria atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('categorias_financeiras')
          .insert([categoriaData]);

        if (error) throw error;
        toast.success('Categoria criada com sucesso');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {categoria ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {categoria
              ? 'Atualize as informações da categoria'
              : 'Preencha os dados para criar uma nova categoria'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Bilheteria"
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={selectedTipo}
              onValueChange={(value) => setValue('tipo', value as any)}
            >
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-red-600">{errors.tipo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cor">Cor *</Label>
            <div className="flex gap-2">
              <Input
                id="cor"
                type="color"
                {...register('cor')}
                className="w-20 h-10"
              />
              <Select
                value={selectedCor}
                onValueChange={(value) => setValue('cor', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Cores sugeridas" />
                </SelectTrigger>
                <SelectContent>
                  {CORES_SUGERIDAS.map((cor) => (
                    <SelectItem key={cor.valor} value={cor.valor}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: cor.valor }}
                        />
                        {cor.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.cor && (
              <p className="text-sm text-red-600">{errors.cor.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descrição opcional da categoria"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="ativo">Ativo</Label>
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={(checked) => setValue('ativo', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
                : categoria
                ? 'Atualizar'
                : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
