import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import type { Contrato } from '@/types';

interface ContractDetailsProps {
  contract: Contrato;
  onClose: () => void;
}

export function ContractDetails({ contract }: ContractDetailsProps) {
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Número do Contrato</label>
              <p className="text-lg font-semibold">{contract.numero_contrato || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nome do Evento</label>
              <p className="text-lg font-semibold">{contract.nome_evento}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo</label>
                <p>{contract.tipo_evento || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Perfil</label>
                <p>{contract.perfil_evento || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Local e Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Unidade</label>
              <p className="text-lg font-semibold">{contract.unidades?.nome || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Projeto</label>
              <p className="text-lg font-semibold">{contract.projetos?.nome || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Mês de Realização</label>
              <p>{contract.mes_realizacao || '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Montagem</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Início:</span>
                  <span className="text-sm">{formatDate(contract.inicio_montagem)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fim:</span>
                  <span className="text-sm">{formatDate(contract.fim_montagem)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Realização</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Início:</span>
                  <span className="text-sm">{formatDate(contract.inicio_realizacao)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fim:</span>
                  <span className="text-sm">{formatDate(contract.fim_realizacao)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Desmontagem</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Início:</span>
                  <span className="text-sm">{formatDate(contract.inicio_desmontagem)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fim:</span>
                  <span className="text-sm">{formatDate(contract.fim_desmontagem)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{contract.num_diarias || 0}</p>
                <p className="text-sm text-gray-500">Diárias</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{contract.num_lint || 0}</p>
                <p className="text-sm text-gray-500">LINT</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{contract.num_apresentacoes || 0}</p>
                <p className="text-sm text-gray-500">Apresentações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Valores Iniciais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Locação:</span>
                <span className="font-medium">{formatCurrency(contract.locacao_valor_inicial)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">G. Serviços:</span>
                <span className="font-medium">{formatCurrency(contract.g_servicos_valor_inicial)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Caução:</span>
                <span className="font-medium">{formatCurrency(contract.caucao_valor_inicial)}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(
                    (contract.locacao_valor_inicial || 0) +
                    (contract.g_servicos_valor_inicial || 0) +
                    (contract.caucao_valor_inicial || 0)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status e Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Criado em: {formatDate(contract.created_at)}
            </Badge>
            {contract.updated_at && contract.updated_at !== contract.created_at && (
              <Badge variant="outline">
                Atualizado em: {formatDate(contract.updated_at)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}