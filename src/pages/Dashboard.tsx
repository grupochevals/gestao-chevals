import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export function Dashboard() {
  const kpis = [
    {
      title: 'Eventos Ativos',
      value: '12',
      change: '+2.5%',
      trend: 'up',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Receita Total',
      value: 'R$ 245.680',
      change: '+12.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Participantes',
      value: '1.847',
      change: '+8.1%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Contratos Ativos',
      value: '28',
      change: '-2.4%',
      trend: 'down',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do sistema de gestão de eventos
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {kpi.value}
                </div>
                <div className="flex items-center mt-2">
                  <TrendIcon 
                    className={`h-3 w-3 mr-1 ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`} 
                  />
                  <span 
                    className={`text-xs ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {kpi.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    vs mês anterior
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Mês</CardTitle>
            <CardDescription>
              Evolução das receitas nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico será implementado com Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos por Status</CardTitle>
            <CardDescription>
              Distribuição dos eventos por status atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico será implementado com Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>
            Últimas atividades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'Novo evento criado',
                description: 'Festival de Música 2024',
                time: '2 horas atrás',
                type: 'success',
              },
              {
                action: 'Contrato assinado',
                description: 'Fornecedor de Som - Evento Corporativo',
                time: '4 horas atrás',
                type: 'info',
              },
              {
                action: 'Pagamento recebido',
                description: 'R$ 15.000 - Patrocínio Gold',
                time: '6 horas atrás',
                type: 'success',
              },
              {
                action: 'Evento finalizado',
                description: 'Workshop de Marketing Digital',
                time: '1 dia atrás',
                type: 'neutral',
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div 
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}