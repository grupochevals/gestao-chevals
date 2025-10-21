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

const canalSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['presencial', 'online', 'telefone', 'terceiro', 'cortesia'], 'Tipo é obrigatório'),
  responsavel: z.string().optional(),
  contato: z.string().optional(),
  taxa_servico: z.string().optional(),
  ativo: z.boolean().default(true),
  observacoes: z.string().optional(),
});

type CanalFormData = z.infer<typeof canalSchema>;

interface CanalVenda {
  id: string;
  nome: string;
  tipo: 'presencial' | 'online' | 'telefone' | 'terceiro' | 'cortesia';
  responsavel: string | null;
  contato: string | null;
  taxa_servico: number;
  ativo: boolean;
  observacoes: string | null;
  created_at: string;
}

interface CanalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canal?: CanalVenda | null;
  onSuccess: () => void;
}

export function CanalFormDialog({
  open,
  onOpenChange,
  canal,
  onSuccess,
}: CanalFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CanalFormData>({
    resolver: zodResolver(canalSchema),
    defaultValues: {
      nome: '',
      tipo: 'presencial',
      responsavel: '',
      contato: '',
      taxa_servico: '0',
      ativo: true,
      observacoes: '',
    },
  });

  const selectedTipo = watch('tipo');
  const ativo = watch('ativo');

  useEffect(() => {
    if (canal) {
      reset({
        nome: canal.nome,
        tipo: canal.tipo,
        responsavel: canal.responsavel || '',
        contato: canal.contato || '',
        taxa_servico: canal.taxa_servico.toString(),
        ativo: canal.ativo,
        observacoes: canal.observacoes || '',
      });
    } else {
      reset({
        nome: '',
        tipo: 'presencial',
        responsavel: '',
        contato: '',
        taxa_servico: '0',
        ativo: true,
        observacoes: '',
      });
    }
  }, [canal, reset, open]);

  const onSubmit = async (data: CanalFormData) => {
    try {
      const canalData = {
        nome: data.nome,
        tipo: data.tipo,
        responsavel: data.responsavel || null,
        contato: data.contato || null,
        taxa_servico: data.taxa_servico ? parseFloat(data.taxa_servico) : 0,
        ativo: data.ativo,
        observacoes: data.observacoes || null,
      };

      if (canal) {
        const { error } = await supabase
          .from('canais_venda')
          .update(canalData)
          .eq('id', canal.id);

        if (error) throw error;
        toast.success('Canal atualizado com sucesso');
      } else {
        const { error } = await supabase.from('canais_venda').insert([canalData]);

        if (error) throw error;
        toast.success('Canal criado com sucesso');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar canal:', error);
      toast.error('Erro ao salvar canal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {canal ? 'Editar Canal de Venda' : 'Novo Canal de Venda'}
          </DialogTitle>
          <DialogDescription>
            {canal
              ? 'Atualize as informações do canal'
              : 'Preencha os dados do novo canal'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Informações Básicas
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nome">Nome do Canal *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Nome do canal de venda"
                />
                {errors.nome && (
                  <p className="text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Canal *</Label>
                <Select
                  value={selectedTipo}
                  onValueChange={(value) =>
                    setValue('tipo', value as 'presencial' | 'online' | 'telefone' | 'terceiro' | 'cortesia')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="terceiro">Terceiro</SelectItem>
                    <SelectItem value="cortesia">Cortesia</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-red-600">{errors.tipo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxa_servico">Taxa de Serviço (%)</Label>
                <Input
                  id="taxa_servico"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('taxa_servico')}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Contato</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  {...register('responsavel')}
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato">Contato (E-mail/Telefone)</Label>
                <Input
                  id="contato"
                  {...register('contato')}
                  placeholder="contato@exemplo.com ou (00) 0000-0000"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Observações</h3>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...register('observacoes')}
                placeholder="Observações adicionais sobre o canal"
                rows={3}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="ativo" className="text-base">
                Status
              </Label>
              <p className="text-sm text-gray-500">
                {ativo ? 'Canal ativo' : 'Canal inativo'}
              </p>
            </div>
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={(checked) => setValue('ativo', checked)}
            />
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
                : canal
                ? 'Atualizar'
                : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
