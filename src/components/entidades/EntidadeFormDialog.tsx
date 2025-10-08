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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const entidadeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  e_cliente: z.boolean().default(false),
  e_parceiro: z.boolean().default(false),
  e_fornecedor: z.boolean().default(false),
  documento: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  ativo: z.boolean().default(true),
}).refine((data) => data.e_cliente || data.e_parceiro || data.e_fornecedor, {
  message: 'Selecione pelo menos um tipo',
  path: ['e_cliente'],
});

type EntidadeFormData = z.infer<typeof entidadeSchema>;

interface Entidade {
  id: string;
  nome: string;
  tipo?: 'cliente' | 'parceiro' | 'fornecedor';
  e_cliente: boolean;
  e_parceiro: boolean;
  e_fornecedor: boolean;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  ativo: boolean;
  created_at: string;
}

interface EntidadeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entidade?: Entidade | null;
  onSuccess: () => void;
}

export function EntidadeFormDialog({
  open,
  onOpenChange,
  entidade,
  onSuccess,
}: EntidadeFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EntidadeFormData>({
    resolver: zodResolver(entidadeSchema),
    defaultValues: {
      nome: '',
      e_cliente: false,
      e_parceiro: false,
      e_fornecedor: false,
      documento: '',
      email: '',
      telefone: '',
      endereco: '',
      ativo: true,
    },
  });

  const eCliente = watch('e_cliente');
  const eParceiro = watch('e_parceiro');
  const eFornecedor = watch('e_fornecedor');
  const ativo = watch('ativo');

  useEffect(() => {
    if (entidade) {
      reset({
        nome: entidade.nome,
        e_cliente: entidade.e_cliente,
        e_parceiro: entidade.e_parceiro,
        e_fornecedor: entidade.e_fornecedor,
        documento: entidade.documento || '',
        email: entidade.email || '',
        telefone: entidade.telefone || '',
        endereco: entidade.endereco || '',
        ativo: entidade.ativo,
      });
    } else {
      reset({
        nome: '',
        e_cliente: false,
        e_parceiro: false,
        e_fornecedor: false,
        documento: '',
        email: '',
        telefone: '',
        endereco: '',
        ativo: true,
      });
    }
  }, [entidade, reset, open]);

  const onSubmit = async (data: EntidadeFormData) => {
    try {
      const entidadeData = {
        nome: data.nome,
        e_cliente: data.e_cliente,
        e_parceiro: data.e_parceiro,
        e_fornecedor: data.e_fornecedor,
        documento: data.documento || null,
        email: data.email || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        ativo: data.ativo,
      };

      if (entidade) {
        const { error } = await supabase
          .from('entidades')
          .update(entidadeData)
          .eq('id', entidade.id);

        if (error) throw error;
        toast.success('Entidade atualizada com sucesso');
      } else {
        const { error } = await supabase.from('entidades').insert([entidadeData]);

        if (error) throw error;
        toast.success('Entidade criada com sucesso');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar entidade:', error);
      toast.error('Erro ao salvar entidade');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entidade ? 'Editar Entidade' : 'Nova Entidade'}
          </DialogTitle>
          <DialogDescription>
            {entidade
              ? 'Atualize as informações da entidade'
              : 'Preencha os dados da nova entidade'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Informações Básicas
            </h3>

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

            <div className="space-y-3">
              <Label>Tipo de Entidade *</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="e_cliente"
                    checked={eCliente}
                    onCheckedChange={(checked) => setValue('e_cliente', !!checked)}
                  />
                  <Label
                    htmlFor="e_cliente"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Cliente
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="e_parceiro"
                    checked={eParceiro}
                    onCheckedChange={(checked) => setValue('e_parceiro', !!checked)}
                  />
                  <Label
                    htmlFor="e_parceiro"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Parceiro
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="e_fornecedor"
                    checked={eFornecedor}
                    onCheckedChange={(checked) => setValue('e_fornecedor', !!checked)}
                  />
                  <Label
                    htmlFor="e_fornecedor"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Fornecedor
                  </Label>
                </div>
              </div>
              {errors.e_cliente && (
                <p className="text-sm text-red-600">{errors.e_cliente.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">Documento (CPF/CNPJ)</Label>
              <Input
                id="documento"
                {...register('documento')}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Contato</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contato@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...register('telefone')}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Endereço</h3>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Textarea
                id="endereco"
                {...register('endereco')}
                placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
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
                {ativo ? 'Entidade ativa' : 'Entidade inativa'}
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
                : entidade
                ? 'Atualizar'
                : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
