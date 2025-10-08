import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContratoFormData } from '@/types/contratos';

const contratoSchema = z.object({
  unidade_id: z.number().min(1, 'Selecione uma unidade'),
  projeto_id: z.number().min(1, 'Selecione um projeto'),
  numero_contrato: z.string().min(1, 'Número do contrato é obrigatório'),
  nome_evento: z.string().min(1, 'Nome do evento é obrigatório'),
  inicio_montagem: z.string().min(1, 'Data de início da montagem é obrigatória'),
  fim_montagem: z.string().min(1, 'Data de fim da montagem é obrigatória'),
  inicio_realizacao: z.string().min(1, 'Data de início da realização é obrigatória'),
  fim_realizacao: z.string().min(1, 'Data de fim da realização é obrigatória'),
  inicio_desmontagem: z.string().min(1, 'Data de início da desmontagem é obrigatória'),
  fim_desmontagem: z.string().min(1, 'Data de fim da desmontagem é obrigatória'),
  mes_realizacao: z.string().min(1, 'Mês de realização é obrigatório'),
  perfil_evento: z.string().min(1, 'Perfil do evento é obrigatório'),
  tipo_evento: z.string().min(1, 'Tipo do evento é obrigatório'),
  num_diarias: z.number().min(0, 'Número de diárias deve ser positivo'),
  num_lint: z.number().min(0, 'Número de lint deve ser positivo'),
  num_apresentacoes: z.number().min(0, 'Número de apresentações deve ser positivo'),
  locacao_valor_inicial: z.number().min(0, 'Valor inicial da locação deve ser positivo'),
  g_servicos_valor_inicial: z.number().min(0, 'Valor inicial dos serviços deve ser positivo'),
  caucao_valor_inicial: z.number().min(0, 'Valor inicial da caução deve ser positivo'),
});

interface ContratoFormProps {
  initialData?: Partial<ContratoFormData>;
  onSubmit: (data: ContratoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ContratoForm({ initialData, onSubmit, onCancel, loading }: ContratoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: initialData,
  });

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Número do Contrato</label>
              <input
                {...register('numero_contrato')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: CT-2024-001"
              />
              {errors.numero_contrato && (
                <p className="text-red-500 text-sm mt-1">{errors.numero_contrato.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nome do Evento</label>
              <input
                {...register('nome_evento')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do evento"
              />
              {errors.nome_evento && (
                <p className="text-red-500 text-sm mt-1">{errors.nome_evento.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Unidade</label>
              <select
                {...register('unidade_id', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma unidade</option>
                <option value={1}>Teatro Municipal</option>
                <option value={2}>Centro de Convenções</option>
              </select>
              {errors.unidade_id && (
                <p className="text-red-500 text-sm mt-1">{errors.unidade_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Projeto</label>
              <select
                {...register('projeto_id', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um projeto</option>
                <option value={1}>Festival de Música</option>
                <option value={2}>Conferência Tech</option>
              </select>
              {errors.projeto_id && (
                <p className="text-red-500 text-sm mt-1">{errors.projeto_id.message}</p>
              )}
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cronograma</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Início Montagem</label>
                <input
                  type="date"
                  {...register('inicio_montagem')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.inicio_montagem && (
                  <p className="text-red-500 text-sm mt-1">{errors.inicio_montagem.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fim Montagem</label>
                <input
                  type="date"
                  {...register('fim_montagem')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fim_montagem && (
                  <p className="text-red-500 text-sm mt-1">{errors.fim_montagem.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Início Realização</label>
                <input
                  type="date"
                  {...register('inicio_realizacao')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.inicio_realizacao && (
                  <p className="text-red-500 text-sm mt-1">{errors.inicio_realizacao.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fim Realização</label>
                <input
                  type="date"
                  {...register('fim_realizacao')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fim_realizacao && (
                  <p className="text-red-500 text-sm mt-1">{errors.fim_realizacao.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Início Desmontagem</label>
                <input
                  type="date"
                  {...register('inicio_desmontagem')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.inicio_desmontagem && (
                  <p className="text-red-500 text-sm mt-1">{errors.inicio_desmontagem.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fim Desmontagem</label>
                <input
                  type="date"
                  {...register('fim_desmontagem')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fim_desmontagem && (
                  <p className="text-red-500 text-sm mt-1">{errors.fim_desmontagem.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes do Evento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mês de Realização</label>
            <select
              {...register('mes_realizacao')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o mês</option>
              <option value="Janeiro">Janeiro</option>
              <option value="Fevereiro">Fevereiro</option>
              <option value="Março">Março</option>
              <option value="Abril">Abril</option>
              <option value="Maio">Maio</option>
              <option value="Junho">Junho</option>
              <option value="Julho">Julho</option>
              <option value="Agosto">Agosto</option>
              <option value="Setembro">Setembro</option>
              <option value="Outubro">Outubro</option>
              <option value="Novembro">Novembro</option>
              <option value="Dezembro">Dezembro</option>
            </select>
            {errors.mes_realizacao && (
              <p className="text-red-500 text-sm mt-1">{errors.mes_realizacao.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Perfil do Evento</label>
            <select
              {...register('perfil_evento')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o perfil</option>
              <option value="Cultural">Cultural</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Educacional">Educacional</option>
              <option value="Esportivo">Esportivo</option>
            </select>
            {errors.perfil_evento && (
              <p className="text-red-500 text-sm mt-1">{errors.perfil_evento.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo do Evento</label>
            <select
              {...register('tipo_evento')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o tipo</option>
              <option value="Show">Show</option>
              <option value="Teatro">Teatro</option>
              <option value="Conferência">Conferência</option>
              <option value="Workshop">Workshop</option>
            </select>
            {errors.tipo_evento && (
              <p className="text-red-500 text-sm mt-1">{errors.tipo_evento.message}</p>
            )}
          </div>
        </div>

        {/* Quantidades */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Número de Diárias</label>
            <input
              type="number"
              {...register('num_diarias', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            {errors.num_diarias && (
              <p className="text-red-500 text-sm mt-1">{errors.num_diarias.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Número de Lint</label>
            <input
              type="number"
              {...register('num_lint', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            {errors.num_lint && (
              <p className="text-red-500 text-sm mt-1">{errors.num_lint.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Número de Apresentações</label>
            <input
              type="number"
              {...register('num_apresentacoes', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            {errors.num_apresentacoes && (
              <p className="text-red-500 text-sm mt-1">{errors.num_apresentacoes.message}</p>
            )}
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Valor Inicial da Locação (R$)</label>
            <input
              type="number"
              step="0.01"
              {...register('locacao_valor_inicial', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            {errors.locacao_valor_inicial && (
              <p className="text-red-500 text-sm mt-1">{errors.locacao_valor_inicial.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor Inicial dos Serviços (R$)</label>
            <input
              type="number"
              step="0.01"
              {...register('g_servicos_valor_inicial', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            {errors.g_servicos_valor_inicial && (
              <p className="text-red-500 text-sm mt-1">{errors.g_servicos_valor_inicial.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor Inicial da Caução (R$)</label>
            <input
              type="number"
              step="0.01"
              {...register('caucao_valor_inicial', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            {errors.caucao_valor_inicial && (
              <p className="text-red-500 text-sm mt-1">{errors.caucao_valor_inicial.message}</p>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Contrato'}
          </Button>
        </div>
      </form>
    </Card>
  );
}