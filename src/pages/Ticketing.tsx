import { useState, useEffect } from 'react';
import { Plus, Ticket, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTicketStore } from '@/stores/ticketStore';
import { TicketsList } from '@/components/ticketing/TicketsList';
import { TicketForm } from '@/components/ticketing/TicketForm';
import { VendasList } from '@/components/ticketing/VendasList';
import { VendaForm } from '@/components/ticketing/VendaForm';
import { TicketingReports } from '@/components/ticketing/TicketingReports';

export function Ticketing() {
  const { 
    tickets, 
    vendas, 
    loading, 
    fetchTickets, 
    fetchVendas,
    getTicketSalesReport 
  } = useTicketStore();
  
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [isVendaFormOpen, setIsVendaFormOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchVendas();
  }, [fetchTickets, fetchVendas]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const report = getTicketSalesReport();

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Bilheteria</h1>
          <p className="text-gray-600">Gerencie ingressos e vendas dos eventos</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isTicketFormOpen} onOpenChange={setIsTicketFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo de Ingresso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Tipo de Ingresso</DialogTitle>
              </DialogHeader>
              <TicketForm onClose={() => setIsTicketFormOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isVendaFormOpen} onOpenChange={setIsVendaFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Venda de Ingresso</DialogTitle>
              </DialogHeader>
              <VendaForm onClose={() => setIsVendaFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ingressos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalTickets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Ingressos disponibilizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{report.totalVendidos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {report.totalTickets > 0 ? ((report.totalVendidos / report.totalTickets) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{report.totalDisponivel.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Ingressos restantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(report.faturamentoTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Receita confirmada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tipos de Ingressos</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <TicketsList />
        </TabsContent>

        <TabsContent value="vendas" className="space-y-4">
          <VendasList />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <TicketingReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}