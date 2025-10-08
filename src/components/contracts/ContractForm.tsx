import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContractStore } from '@/stores/contractStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Contrato, Unidade, Projeto } from '@/types';

const contractSchema = z.object({
  unidade_id: z.number().min(1, 'Selecione uma unidade'),
  projeto_id: z.number().min(1, 'Selecione um projeto'),
  numero_contrato: z.string().optional(),
  nome_evento: z.string().min(1, 'Nome do evento é obrigatório'),
  inicio_montagem: z.string().optional(),
  fim_montagem: z.string().optional(),
  inicio_realizacao: z.string().optional(),
  fim_realizacao: z.string().optional(),
  inicio_desmontagem: z.string().optional(),
  fim_desmontagem: z.string().optional(),
  mes_realizacao: z.string().optional(),
  perfil_evento: z.string().optional(),
  tipo_evento: z.string().optional(),
  num_diarias: z.number().optional(),
  num_lint: z.number().optional(),
  num_apresentacoes: z.number().optional(),
  locacao_valor_inicial: z.number().optional(),
  g_servicos_valor_inicial: z.number().optional(),
  caucao_valor_inicial: z.number().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormProps {
  contract?: Contrato | null;
  onClose: () => void;
}

export function ContractForm({ contract, onClose }: ContractFormProps) {
  const { createContract, updateContract } = useContractStore();
  const [units, setUnits] = useState<Unidade[]>([]);
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: contract ? {
      unidade_id: contract.unidade_id,
      projeto_id: contract.projeto_id,
      numero_contrato: contract.numero_contrato || '',
      nome_evento: contract.nome_evento || '',
      inicio_montagem: contract.inicio_montagem || '',
      fim_montagem: contract.fim_montagem || '',
      inicio_realizacao: contract.inicio_realizacao || '',
      fim_realizacao: contract.fim_realizacao || '',
      inicio_desmontagem: contract.inicio_desmontagem || '',
      fim_desmontagem: contract.fim_desmontagem || '',
      mes_realizacao: contract.mes_realizacao || '',
      perfil_evento: contract.perfil_evento || '',
      tipo_evento: contract.tipo_evento || '',
      num_diarias: contract.num_diarias || 0,
      num_lint: contract.num_lint || 0,
      num_apresentacoes: contract.num_apresentacoes || 0,
      locacao_valor_inicial: contract.locacao_valor_inicial || 0,
      g_servicos_valor_inicial: contract.g_servicos_valor_inicial || 0,
      caucao_valor_inicial: contract.caucao_valor_inicial || 0,
    } : {}
  });

  useEffect(() => {
    fetchUnitsAndProjects();
  }, []);

  const fetchUnitsAndProjects = async () => {
    try {
      const [unitsResponse, projectsResponse] = await Promise.all([
        supabase.from('unidades').select('*').order('nome'),
        supabase.from('projetos').select('*').order('nome')
      ]);

      if (unitsResponse.data) setUnits(unitsResponse.data);
      if (projectsResponse.data) setProjects(projectsResponse.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
  };

  const onSubmit = async (data: ContractFormData) => {
    setLoading(true);
    try {
      if (contract) {
        await updateContract(contract.id, data);
        toast.success('Contrato atualizado com sucesso!');
      } else {
        await createContract(data);
        toast.success('Contrato criado com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar contrato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unidade_id">Unidade *</Label>
          <Select
            value={watch('unidade_id')?.toString()}
            onValueChange={(value) => setValue('unidade_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma unidade" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id.toString()}>
                  {unit.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unidade_id && (
            <p className="text-sm text-red-600">{errors.unidade_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="projeto_id">Projeto *</Label>
          <Select
            value={watch('projeto_id')?.toString()}
            onValueChange={(value) => setValue('projeto_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.projeto_id && (
            <p className="text-sm text-red-600">{errors.projeto_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_contrato">Número do Contrato</Label>
          <Input
            id="numero_contrato"
            {...register('numero_contrato')}
            placeholder="Ex: CT-2024-001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome_evento">Nome do Evento *</Label>
          <Input
            id="nome_evento"
            {...register('nome_evento')}
            placeholder="Nome do evento"
          />
          {errors.nome_evento && (
            <p className="text-sm text-red-600">{errors.nome_evento.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_evento">Tipo de Evento</Label>
          <Select
            value={watch('tipo_evento') || ''}
            onValueChange={(value) => setValue('tipo_evento', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="show">Show</SelectItem>
              <SelectItem value="teatro">Teatro</SelectItem>
              <SelectItem value="corporativo">Corporativo</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="esportivo">Esportivo</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="perfil_evento">Perfil do Evento</Label>
          <Select
            value={watch('perfil_evento') || ''}
            onValueChange={(value) => setValue('perfil_evento', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nacional">Nacional</SelectItem>
              <SelectItem value="internacional">Internacional</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="local">Local</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="inicio_montagem">Início da Montagem</Label>
          <Input
            id="inicio_montagem"
            type="date"
            {...register('inicio_montagem')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fim_montagem">Fim da Montagem</Label>
          <Input
            id="fim_montagem"
            type="date"
            {...register('fim_montagem')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inicio_realizacao">Início da Realização</Label>
          <Input
            id="inicio_realizacao"
            type="date"
            {...register('inicio_realizacao')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fim_realizacao">Fim da Realização</Label>
          <Input
            id="fim_realizacao"
            type="date"
            {...register('fim_realizacao')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inicio_desmontagem">Início da Desmontagem</Label>
          <Input
            id="inicio_desmontagem"
            type="date"
            {...register('inicio_desmontagem')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fim_desmontagem">Fim da Desmontagem</Label>
          <Input
            id="fim_desmontagem"
            type="date"
            {...register('fim_desmontagem')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="num_diarias">Número de Diárias</Label>
          <Input
            id="num_diarias"
            type="number"
            {...register('num_diarias', { valueAsNumber: true })}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="num_lint">Número de LINT</Label>
          <Input
            id="num_lint"
            type="number"
            {...register('num_lint', { valueAsNumber: true })}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="num_apresentacoes">Número de Apresentações</Label>
          <Input
            id="num_apresentacoes"
            type="number"
            {...register('num_apresentacoes', { valueAsNumber: true })}
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="locacao_valor_inicial">Valor Inicial Locação (R$)</Label>
          <Input
            id="locacao_valor_inicial"
            type="number"
            step="0.01"
            {...register('locacao_valor_inicial', { valueAsNumber: true })}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="g_servicos_valor_inicial">Valor Inicial G. Serviços (R$)</Label>
          <Input
            id="g_servicos_valor_inicial"
            type="number"
            step="0.01"
            {...register('g_servicos_valor_inicial', { valueAsNumber: true })}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="caucao_valor_inicial">Valor Inicial Caução (R$)</Label>
          <Input
            id="caucao_valor_inicial"
            type="number"
            step="0.01"
            {...register('caucao_valor_inicial', { valueAsNumber: true })}
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : contract ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}