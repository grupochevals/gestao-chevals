import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProjectStore } from '@/stores/projectStore';
import { toast } from 'sonner';
import type { Projeto } from '@/stores/projectStore';

const projectSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  status: z.enum(['planejamento', 'ativo', 'concluido', 'cancelado'], {
    required_error: 'Status é obrigatório',
  }),
  orcamento: z.number().min(0, 'Orçamento deve ser positivo').optional(),
  responsavel: z.string().optional(),
  observacoes: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Projeto | null;
  onClose: () => void;
}

export function ProjectForm({ project, onClose }: ProjectFormProps) {
  const { createProject, updateProject, loading } = useProjectStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      nome: project.nome,
      descricao: project.descricao || '',
      data_inicio: project.data_inicio ? project.data_inicio.split('T')[0] : '',
      data_fim: project.data_fim ? project.data_fim.split('T')[0] : '',
      status: project.status,
      orcamento: project.orcamento || 0,
      responsavel: project.responsavel || '',
      observacoes: project.observacoes || '',
    } : {
      nome: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      status: 'planejamento' as const,
      orcamento: 0,
      responsavel: '',
      observacoes: '',
    },
  });

  const watchedStatus = watch('status');

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const projectData = {
        ...data,
        descricao: data.descricao || null,
        data_inicio: data.data_inicio || null,
        data_fim: data.data_fim || null,
        orcamento: data.orcamento || null,
        responsavel: data.responsavel || null,
        observacoes: data.observacoes || null,
      };

      if (project) {
        await updateProject(project.id, projectData);
        toast.success('Projeto atualizado com sucesso!');
      } else {
        await createProject(projectData);
        toast.success('Projeto criado com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar projeto');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Projeto *</Label>
          <Input
            id="nome"
            {...register('nome')}
            placeholder="Nome do projeto"
          />
          {errors.nome && (
            <p className="text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={watchedStatus}
            onValueChange={(value) => setValue('status', value as 'planejamento' | 'ativo' | 'concluido' | 'cancelado')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planejamento">Planejamento</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          {...register('descricao')}
          placeholder="Descrição do projeto..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_inicio">Data de Início</Label>
          <Input
            id="data_inicio"
            type="date"
            {...register('data_inicio')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_fim">Data de Fim</Label>
          <Input
            id="data_fim"
            type="date"
            {...register('data_fim')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="orcamento">Orçamento (R$)</Label>
          <Input
            id="orcamento"
            type="number"
            step="0.01"
            min="0"
            {...register('orcamento', { valueAsNumber: true })}
            placeholder="0,00"
          />
          {errors.orcamento && (
            <p className="text-sm text-red-600">{errors.orcamento.message}</p>
          )}
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
          {loading ? 'Salvando...' : project ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}