import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Calendar, DollarSign, FileText } from 'lucide-react';
import type { FechamentoEvento } from '@/stores/financialStore';

interface FechamentoDetailsProps {
  fechamento: FechamentoEvento;
}

export function FechamentoDetails({ fechamento }: FechamentoDetailsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejeitado':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Informações Gerais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Evento</label>
              <p className="font-medium">{fechamento.contrato?.nome_evento || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Cliente</label>
              <p className="font-medium">{fechamento.contrato?.entidade?.nome || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Data do Fechamento</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(fechamento.data_fechamento)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="flex items-center space-x-2">
                {getStatusIcon(fechamento.status)}
                <Badge className={getStatusColor(fechamento.status)}>
                  {fechamento.status.charAt(0).toUpperCase() + fechamento.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Total Receitas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(fechamento.total_receitas)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Total Despesas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(fechamento.total_despesas)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Resultado Líquido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              fechamento.resultado_liquido >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(fechamento.resultado_liquido)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {fechamento.resultado_liquido >= 0 ? 'Lucro' : 'Prejuízo'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Margem de Lucro</h4>
              <div className="space-y-2">
                {fechamento.total_receitas > 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span>Percentual:</span>
                      <span className={`font-medium ${
                        (fechamento.resultado_liquido / fechamento.total_receitas) * 100 >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {((fechamento.resultado_liquido / fechamento.total_receitas) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          fechamento.resultado_liquido >= 0 ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        style={{ 
                          width: `${Math.min(Math.abs((fechamento.resultado_liquido / fechamento.total_receitas) * 100), 100)}%` 
                        }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-500">Sem receitas para calcular</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Eficiência de Custos</h4>
              <div className="space-y-2">
                {fechamento.total_receitas > 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span>Despesas/Receitas:</span>
                      <span className="font-medium">
                        {((fechamento.total_despesas / fechamento.total_receitas) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min((fechamento.total_despesas / fechamento.total_receitas) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-500">Sem receitas para calcular</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {fechamento.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{fechamento.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações do Contrato */}
      {fechamento.contrato && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Data do Evento</label>
                <p>{formatDate(fechamento.contrato.data_evento)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Unidade</label>
                <p>{fechamento.contrato.unidade?.nome || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Projeto</label>
                <p>{fechamento.contrato.projeto?.nome || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Valor do Aluguel</label>
                <p>{formatCurrency(fechamento.contrato.valor_aluguel)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}