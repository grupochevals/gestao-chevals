import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, TrendingUp, Users, DollarSign, Ticket } from 'lucide-react';
import { useTicketStore } from '@/stores/ticketStore';
import { useContractStore } from '@/stores/contractStore';
import { toast } from 'sonner';

interface ReportData {
  totalVendas: number;
  totalReceita: number;
  totalIngressos: number;
  ingressosVendidos: number;
  ingressosDisponiveis: number;
  taxaOcupacao: number;
  vendasPorEvento: Array<{
    evento: string;
    vendas: number;
    receita: number;
    ingressos: number;
  }>;
  vendasPorTipo: Array<{
    tipo: string;
    vendas: number;
    receita: number;
  }>;
  vendasPorFormaPagamento: Array<{
    forma: string;
    vendas: number;
    receita: number;
  }>;
  vendasPorStatus: Array<{
    status: string;
    vendas: number;
    receita: number;
  }>;
}

export function TicketingReports() {
  const { 
    tickets, 
    vendas, 
    loading,
    fetchTickets,
    fetchVendas,
    generateTicketReport
  } = useTicketStore();
  
  const { contracts, fetchContracts } = useContractStore();
  
  const [selectedContract, setSelectedContract] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchTickets();
    fetchVendas();
    fetchContracts();
  }, [fetchTickets, fetchVendas, fetchContracts]);

  useEffect(() => {
    generateReport();
  }, [tickets, vendas, selectedContract, dateFrom, dateTo]);

  const generateReport = () => {
    let filteredVendas = vendas;
    let filteredTickets = tickets;

    // Filtrar por contrato
    if (selectedContract !== 'all') {
      const contractId = parseInt(selectedContract);
      filteredTickets = tickets.filter(t => t.contrato_id === contractId);
      filteredVendas = vendas.filter(v => 
        filteredTickets.some(t => t.id === v.ticket_id)
      );
    }

    // Filtrar por data
    if (dateFrom) {
      filteredVendas = filteredVendas.filter(v => v.data_venda >= dateFrom);
    }
    if (dateTo) {
      filteredVendas = filteredVendas.filter(v => v.data_venda <= dateTo);
    }

    // Calcular métricas gerais
    const totalVendas = filteredVendas.length;
    const totalReceita = filteredVendas.reduce((sum, v) => sum + v.valor_total, 0);
    const totalIngressos = filteredTickets.reduce((sum, t) => sum + t.quantidade_disponivel, 0);
    const ingressosVendidos = filteredTickets.reduce((sum, t) => sum + t.quantidade_vendida, 0);
    const ingressosDisponiveis = totalIngressos - ingressosVendidos;
    const taxaOcupacao = totalIngressos > 0 ? (ingressosVendidos / totalIngressos) * 100 : 0;

    // Vendas por evento
    const vendasPorEvento = filteredTickets.reduce((acc, ticket) => {
      const evento = ticket.contrato?.nome_evento || 'Evento não identificado';
      const vendasDoTicket = filteredVendas.filter(v => v.ticket_id === ticket.id);
      const vendas = vendasDoTicket.length;
      const receita = vendasDoTicket.reduce((sum, v) => sum + v.valor_total, 0);
      
      const existing = acc.find(item => item.evento === evento);
      if (existing) {
        existing.vendas += vendas;
        existing.receita += receita;
        existing.ingressos += ticket.quantidade_vendida;
      } else {
        acc.push({
          evento,
          vendas,
          receita,
          ingressos: ticket.quantidade_vendida
        });
      }
      return acc;
    }, [] as ReportData['vendasPorEvento']);

    // Vendas por tipo de ingresso
    const vendasPorTipo = filteredTickets.reduce((acc, ticket) => {
      const tipo = ticket.tipo_ingresso;
      const vendasDoTicket = filteredVendas.filter(v => v.ticket_id === ticket.id);
      const vendas = vendasDoTicket.length;
      const receita = vendasDoTicket.reduce((sum, v) => sum + v.valor_total, 0);
      
      const existing = acc.find(item => item.tipo === tipo);
      if (existing) {
        existing.vendas += vendas;
        existing.receita += receita;
      } else {
        acc.push({ tipo, vendas, receita });
      }
      return acc;
    }, [] as ReportData['vendasPorTipo']);

    // Vendas por forma de pagamento
    const vendasPorFormaPagamento = filteredVendas.reduce((acc, venda) => {
      const forma = venda.forma_pagamento;
      const existing = acc.find(item => item.forma === forma);
      if (existing) {
        existing.vendas += 1;
        existing.receita += venda.valor_total;
      } else {
        acc.push({
          forma,
          vendas: 1,
          receita: venda.valor_total
        });
      }
      return acc;
    }, [] as ReportData['vendasPorFormaPagamento']);

    // Vendas por status
    const vendasPorStatus = filteredVendas.reduce((acc, venda) => {
      const status = venda.status;
      const existing = acc.find(item => item.status === status);
      if (existing) {
        existing.vendas += 1;
        existing.receita += venda.valor_total;
      } else {
        acc.push({
          status,
          vendas: 1,
          receita: venda.valor_total
        });
      }
      return acc;
    }, [] as ReportData['vendasPorStatus']);

    setReportData({
      totalVendas,
      totalReceita,
      totalIngressos,
      ingressosVendidos,
      ingressosDisponiveis,
      taxaOcupacao,
      vendasPorEvento,
      vendasPorTipo,
      vendasPorFormaPagamento,
      vendasPorStatus
    });
  };

  const exportReport = async () => {
    try {
      const filters = {
        contrato_id: selectedContract !== 'all' ? parseInt(selectedContract) : undefined,
        data_inicio: dateFrom || undefined,
        data_fim: dateTo || undefined
      };
      
      await generateTicketReport(filters);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return <div>Carregando relatórios...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Filtros do Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Evento</Label>
              <Select value={selectedContract} onValueChange={setSelectedContract}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os eventos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os eventos</SelectItem>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id.toString()}>
                      {contract.nome_evento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={exportReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                    <p className="text-2xl font-bold">{reportData.totalVendas}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.totalReceita)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ingressos Vendidos</p>
                    <p className="text-2xl font-bold">{reportData.ingressosVendidos}</p>
                    <p className="text-xs text-gray-500">
                      de {reportData.totalIngressos} disponíveis
                    </p>
                  </div>
                  <Ticket className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                    <p className="text-2xl font-bold">{reportData.taxaOcupacao.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendas por Evento */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.vendasPorEvento}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="evento" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'receita' ? formatCurrency(value as number) : value,
                        name === 'receita' ? 'Receita' : name === 'vendas' ? 'Vendas' : 'Ingressos'
                      ]}
                    />
                    <Bar dataKey="vendas" fill="#8884d8" name="vendas" />
                    <Bar dataKey="receita" fill="#82ca9d" name="receita" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Vendas por Forma de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.vendasPorFormaPagamento}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ forma, percent }) => `${forma} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="vendas"
                    >
                      {reportData.vendasPorFormaPagamento.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Vendas']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabelas Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendas por Tipo de Ingresso */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Tipo de Ingresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.vendasPorTipo.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{item.tipo}</span>
                      <div className="text-right">
                        <p className="font-semibold">{item.vendas} vendas</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.receita)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vendas por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.vendasPorStatus.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                      <div className="text-right">
                        <p className="font-semibold">{item.vendas} vendas</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.receita)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Detalhado por Evento */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Detalhado por Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.vendasPorEvento.map((evento, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">{evento.evento}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Vendas</p>
                        <p className="text-xl font-bold">{evento.vendas}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ingressos Vendidos</p>
                        <p className="text-xl font-bold">{evento.ingressos}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Receita</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(evento.receita)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}