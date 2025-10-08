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

const empresaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  razao_social: z.string().optional(),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2, 'Estado deve ter 2 caracteres').optional(),
  cep: z.string().optional(),
  responsavel: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface Empresa {
  id: string;
  nome: string;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  responsavel: string | null;
  observacoes: string | null;
  ativo: boolean;
}

interface EmpresaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: Empresa | null;
  onSuccess: () => void;
}

export function EmpresaFormDialog({
  open,
  onOpenChange,
  empresa,
  onSuccess,
}: EmpresaFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: '',
      razao_social: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      responsavel: '',
      observacoes: '',
      ativo: true,
    },
  });

  const ativo = watch('ativo');

  useEffect(() => {
    if (empresa) {
      reset({
        nome: empresa.nome,
        razao_social: empresa.razao_social || '',
        cnpj: empresa.cnpj || '',
        email: empresa.email || '',
        telefone: empresa.telefone || '',
        endereco: empresa.endereco || '',
        cidade: empresa.cidade || '',
        estado: empresa.estado || '',
        cep: empresa.cep || '',
        responsavel: empresa.responsavel || '',
        observacoes: empresa.observacoes || '',
        ativo: empresa.ativo,
      });
    } else {
      reset({
        nome: '',
        razao_social: '',
        cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        responsavel: '',
        observacoes: '',
        ativo: true,
      });
    }
  }, [empresa, reset]);

  const onSubmit = async (data: EmpresaFormData) => {
    try {
      const empresaData = {
        nome: data.nome,
        razao_social: data.razao_social || null,
        cnpj: data.cnpj || null,
        email: data.email || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        cidade: data.cidade || null,
        estado: data.estado?.toUpperCase() || null,
        cep: data.cep || null,
        responsavel: data.responsavel || null,
        observacoes: data.observacoes || null,
        ativo: data.ativo,
      };

      if (empresa) {
        const { error } = await supabase
          .from('empresas')
          .update(empresaData)
          .eq('id', empresa.id);

        if (error) throw error;
        toast.success('Empresa atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('empresas').insert([empresaData]);

        if (error) throw error;
        toast.success('Empresa criada com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      toast.error(error.message || 'Erro ao salvar empresa');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{empresa ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          <DialogDescription>
            {empresa
              ? 'Atualize as informações da empresa'
              : 'Preencha os dados para criar uma nova empresa'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Informações Básicas</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Fantasia *</Label>
                <Input id="nome" {...register('nome')} placeholder="Nome da empresa" />
                {errors.nome && (
                  <p className="text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input
                  id="razao_social"
                  {...register('razao_social')}
                  placeholder="Razão social da empresa"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  {...register('cnpj')}
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  {...register('responsavel')}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Contato</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contato@empresa.com"
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
                  placeholder="(00) 0000-0000"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Endereço</h3>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Input
                id="endereco"
                {...register('endereco')}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...register('cidade')} placeholder="Cidade" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado (UF)</Label>
                <Input
                  id="estado"
                  {...register('estado')}
                  placeholder="SP"
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.estado && (
                  <p className="text-sm text-red-600">{errors.estado.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" {...register('cep')} placeholder="00000-000" />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Observações adicionais sobre a empresa..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={(checked) => setValue('ativo', checked)}
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Empresa ativa
            </Label>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : empresa ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
