import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Search, Calendar, DollarSign, User, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTicketStore } from '@/stores/ticketStore';
import { VendaForm } from './VendaForm';
import { VendaDetails } from './VendaDetails';
import { toast } from 'sonner';
import type { VendaTicket } from '@/stores/ticketStore';

export function VendasList() {
  const { vendas, loading, deleteVenda, updateVenda } = useTicketStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVenda, setSelectedVenda] = useState<VendaTicket | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = 
      venda.nome_comprador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.email_comprador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.ticket?.tipo_ingresso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.ticket?.contrato?.nome_evento.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || venda.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await deleteVenda(id);
        toast.success('Venda excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir venda');
      }
    }
  };

  const handleEdit = (venda: VendaTicket) => {
    setSelectedVenda(venda);
    setIsFormOpen(true);
  };

  const handleView = (venda: VendaTicket) => {
    setSelectedVenda(venda);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = async (venda: VendaTicket, newStatus: 'pendente' | 'confirmado' | 'cancelado') => {
    try {
      await updateVenda(venda.id, { status: newStatus });
      toast.success('Status da venda atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar status da venda');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedVenda(null);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedVenda(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const totalVendas = filteredVendas.length;
  const totalFaturamento = filteredVendas
    .filter(v => v.status === 'confirmado')
    .reduce((sum, v) => sum + v.valor_total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Vendas de Ingressos</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Total:</span>
                <Badge variant="outline">{totalVendas} vendas</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">
                  {formatCurrency(totalFaturamento)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por comprador, evento ou tipo de ingresso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data/Hora</th>
                  <th className="text-left p-2">Evento</th>
                  <th className="text-left p-2">Ingresso</th>
                  <th className="text-left p-2">Comprador</th>
                  <th className="text-left p-2">Qtd</th>
                  <th className="text-left p-2">Valor Total</th>
                  <th className="text-left p-2">Pagamento</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendas.map((venda) => (
                  <tr key={venda.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="text-sm">
                          <div>{formatDate(venda.data_venda)}</div>
                          <div className="text-gray-500">
                            {new Date(venda.data_venda).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">
                          {venda.ticket?.contrato?.nome_evento || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {venda.ticket?.contrato?.entidade?.nome || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{venda.ticket?.tipo_ingresso || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(venda.valor_unitario)} cada
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{venda.nome_comprador || 'N/A'}</div>
                          {venda.email_comprador && (
                            <div className="text-sm text-gray-500">{venda.email_comprador}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">
                        {venda.quantidade}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <span className="font-medium text-green-600">
                        {formatCurrency(venda.valor_total)}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{venda.forma_pagamento}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(venda.status)}
                        <Select
                          value={venda.status}
                          onValueChange={(value) => handleStatusChange(venda, value as 'pendente' | 'confirmado' | 'cancelado')}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="confirmado">Confirmado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(venda)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(venda)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(venda.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVendas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma venda encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedVenda ? 'Editar Venda' : 'Nova Venda'}
            </DialogTitle>
          </DialogHeader>
          <VendaForm 
            venda={selectedVenda} 
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
          </DialogHeader>
          {selectedVenda && (
            <VendaDetails venda={selectedVenda} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}