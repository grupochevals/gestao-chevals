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

const projetoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.string().optional(),
  descricao: z.string().optional(),
  local: z.string().optional(),
  responsavel: z.string().optional(),
  entidade_id: z.string().nullable(),
  unidade_id: z.string().nullable(),
  espaco_id: z.string().nullable(),
  contrato_id: z.string().nullable(),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().min(1, 'Data de término é obrigatória'),
  status: z.enum(['planejamento', 'aprovado', 'em_andamento', 'concluido', 'cancelado']),
  orcamento: z.string().optional(),
  observacoes: z.string().optional(),
}).refine((data) => {
  if (!data.data_inicio || !data.data_fim) return true;
  return new Date(data.data_fim) >= new Date(data.data_inicio);
}, {
  message: 'Data de término deve ser maior ou igual à data de início',
  path: ['data_fim'],
});

type ProjetoFormData = z.infer<typeof projetoSchema>;

interface Projeto {
  id: string;
  nome: string;
  tipo: string | null;
  descricao: string | null;
  local: string | null;
  responsavel: string | null;
  entidade_id: string | null;
  unidade_id: string | null;
  espaco_id: string | null;
  contrato_id: string | null;
  data_inicio: string;
  data_fim: string;
  status: 'planejamento' | 'aprovado' | 'em_andamento' | 'concluido' | 'cancelado';
  orcamento: number | null;
  observacoes: string | null;
  created_at: string;
}

interface ProjetoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto?: Projeto | null;
  onSuccess: () => void;
}

export function ProjetoFormDialog({
  open,
  onOpenChange,
  projeto,
  onSuccess,
}: ProjetoFormDialogProps) {
  const [entidades, setEntidades] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [espacos, setEspacos] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      nome: '',
      tipo: '',
      descricao: '',
      local: '',
      responsavel: '',
      entidade_id: null,
      unidade_id: null,
      espaco_id: null,
      contrato_id: null,
      data_inicio: '',
      data_fim: '',
      status: 'planejamento',
      orcamento: '',
      observacoes: '',
    },
  });

  const selectedStatus = watch('status');
  const selectedEntidadeId = watch('entidade_id');
  const selectedUnidadeId = watch('unidade_id');
  const selectedEspacoId = watch('espaco_id');
  const selectedContratoId = watch('contrato_id');

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (selectedUnidadeId) {
      fetchEspacos(selectedUnidadeId);
    } else {
      setEspacos([]);
    }
  }, [selectedUnidadeId]);

  const fetchDropdownData = async () => {
    try {
      const [entidadesRes, empresasRes, contratosRes] = await Promise.all([
        supabase.from('entidades').select('id, nome').eq('e_cliente', true).order('nome'),
        supabase.from('empresas').select('id, nome').eq('ativo', true).order('nome'),
        supabase.from('contratos').select('id, numero').order('numero'),
      ]);

      if (entidadesRes.data) setEntidades(entidadesRes.data);
      if (empresasRes.data) setEmpresas(empresasRes.data);
      if (contratosRes.data) setContratos(contratosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const fetchEspacos = async (unidadeId: string) => {
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('id, nome')
        .eq('empresa_id', unidadeId)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setEspacos(data || []);
    } catch (error) {
      console.error('Erro ao carregar espaços:', error);
    }
  };

  useEffect(() => {
    if (projeto) {
      reset({
        nome: projeto.nome,
        tipo: projeto.tipo || '',
        descricao: projeto.descricao || '',
        local: projeto.local || '',
        responsavel: projeto.responsavel || '',
        entidade_id: projeto.entidade_id,
        unidade_id: projeto.unidade_id,
        espaco_id: projeto.espaco_id,
        contrato_id: projeto.contrato_id,
        data_inicio: projeto.data_inicio,
        data_fim: projeto.data_fim,
        status: projeto.status,
        orcamento: projeto.orcamento?.toString() || '',
        observacoes: projeto.observacoes || '',
      });
    } else {
      reset({
        nome: '',
        tipo: '',
        descricao: '',
        local: '',
        responsavel: '',
        entidade_id: null,
        unidade_id: null,
        espaco_id: null,
        contrato_id: null,
        data_inicio: '',
        data_fim: '',
        status: 'planejamento',
        orcamento: '',
        observacoes: '',
      });
    }
  }, [projeto, reset, open]);

  const onSubmit = async (data: ProjetoFormData) => {
    try {
      const projetoData = {
        nome: data.nome,
        tipo: data.tipo || null,
        descricao: data.descricao || null,
        local: data.local || null,
        responsavel: data.responsavel || null,
        entidade_id: data.entidade_id,
        unidade_id: data.unidade_id,
        espaco_id: data.espaco_id,
        contrato_id: data.contrato_id,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        status: data.status,
        orcamento: data.orcamento ? parseFloat(data.orcamento) : null,
        observacoes: data.observacoes || null,
      };

      if (projeto) {
        const { error } = await supabase
          .from('projetos')
          .update(projetoData)
          .eq('id', projeto.id);

        if (error) throw error;
        toast.success('Projeto atualizado com sucesso');
      } else {
        const { error } = await supabase.from('projetos').insert([projetoData]);

        if (error) throw error;
        toast.success('Projeto criado com sucesso');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast.error('Erro ao salvar projeto');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {projeto ? 'Editar Projeto/Evento' : 'Novo Projeto/Evento'}
          </DialogTitle>
          <DialogDescription>
            {projeto
              ? 'Atualize as informações do projeto/evento'
              : 'Preencha os dados do novo projeto/evento'}
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
                <Label htmlFor="nome">Nome do Evento *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Nome do evento"
                />
                {errors.nome && (
                  <p className="text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Evento</Label>
                <Input
                  id="tipo"
                  {...register('tipo')}
                  placeholder="Ex: Show, Festa, Corporativo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                {...register('descricao')}
                placeholder="Descrição detalhada do evento"
                rows={3}
              />
            </div>
          </div>

          {/* Datas e Orçamento */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Datas e Orçamento
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  {...register('data_inicio')}
                />
                {errors.data_inicio && (
                  <p className="text-sm text-red-600">{errors.data_inicio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Término *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  {...register('data_fim')}
                />
                {errors.data_fim && (
                  <p className="text-sm text-red-600">{errors.data_fim.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orcamento">Orçamento Previsto</Label>
                <Input
                  id="orcamento"
                  type="number"
                  step="0.01"
                  {...register('orcamento')}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Relacionamentos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Cliente e Local
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entidade_id">Cliente</Label>
                <Select
                  value={selectedEntidadeId || 'none'}
                  onValueChange={(value) => setValue('entidade_id', value === 'none' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {entidades.map((entidade) => (
                      <SelectItem key={entidade.id} value={entidade.id}>
                        {entidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  {...register('responsavel')}
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidade_id">Empresa/Unidade</Label>
                <Select
                  value={selectedUnidadeId || 'none'}
                  onValueChange={(value) => {
                    setValue('unidade_id', value === 'none' ? null : value);
                    setValue('espaco_id', null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
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
                <Label htmlFor="espaco_id">Espaço</Label>
                <Select
                  value={selectedEspacoId || 'none'}
                  onValueChange={(value) => setValue('espaco_id', value === 'none' ? null : value)}
                  disabled={!selectedUnidadeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o espaço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {espacos.map((espaco) => (
                      <SelectItem key={espaco.id} value={espaco.id}>
                        {espaco.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="local">Local (Texto Livre)</Label>
                <Input
                  id="local"
                  {...register('local')}
                  placeholder="Endereço ou descrição do local"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="contrato_id">Contrato Associado</Label>
                <Select
                  value={selectedContratoId || 'none'}
                  onValueChange={(value) => setValue('contrato_id', value === 'none' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {contratos.map((contrato) => (
                      <SelectItem key={contrato.id} value={contrato.id}>
                        {contrato.numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Observações</h3>
            <div className="space-y-2">
              <Textarea
                id="observacoes"
                {...register('observacoes')}
                placeholder="Observações adicionais sobre o evento"
                rows={4}
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
                : projeto
                ? 'Atualizar'
                : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
