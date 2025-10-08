import { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Calendar, DollarSign, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTicketStore } from '@/stores/ticketStore';
import { TicketForm } from './TicketForm';
import { toast } from 'sonner';
import type { Ticket } from '@/stores/ticketStore';

export function TicketsList() {
  const { tickets, loading, deleteTicket, updateTicket } = useTicketStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredTickets = tickets.filter(ticket =>
    ticket.tipo_ingresso.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.contrato?.nome_evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.contrato?.entidade?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este tipo de ingresso?')) {
      try {
        await deleteTicket(id);
        toast.success('Tipo de ingresso excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir tipo de ingresso');
      }
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (ticket: Ticket) => {
    try {
      await updateTicket(ticket.id, { ativo: !ticket.ativo });
      toast.success(`Ingresso ${ticket.ativo ? 'desativado' : 'ativado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao alterar status do ingresso');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTicket(null);
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

  const getAvailabilityColor = (ticket: Ticket) => {
    const disponivel = ticket.quantidade_disponivel - ticket.quantidade_vendida;
    const percentual = (disponivel / ticket.quantidade_disponivel) * 100;
    
    if (percentual > 50) return 'text-green-600';
    if (percentual > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

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
            <CardTitle>Tipos de Ingressos</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por tipo, evento ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Evento</th>
                  <th className="text-left p-2">Tipo de Ingresso</th>
                  <th className="text-left p-2">Preço</th>
                  <th className="text-left p-2">Disponível</th>
                  <th className="text-left p-2">Vendidos</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const disponivel = ticket.quantidade_disponivel - ticket.quantidade_vendida;
                  const percentualVendido = (ticket.quantidade_vendida / ticket.quantidade_disponivel) * 100;
                  
                  return (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{ticket.contrato?.nome_evento || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {ticket.contrato?.entidade?.nome || 'N/A'}
                          </div>
                          {ticket.contrato?.data_evento && (
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(ticket.contrato.data_evento)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{ticket.tipo_ingresso}</div>
                          {ticket.descricao && (
                            <div className="text-sm text-gray-500">{ticket.descricao}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{formatCurrency(ticket.preco)}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className={`font-medium ${getAvailabilityColor(ticket)}`}>
                            {disponivel}
                          </span>
                          <span className="text-gray-400">/ {ticket.quantidade_disponivel}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{ticket.quantidade_vendida}</span>
                            <Badge variant="secondary">
                              {percentualVendido.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${Math.min(percentualVendido, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant={ticket.ativo ? "default" : "secondary"}
                          className={ticket.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {ticket.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(ticket)}
                            title={ticket.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {ticket.ativo ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(ticket)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ticket.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum tipo de ingresso encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTicket ? 'Editar Tipo de Ingresso' : 'Novo Tipo de Ingresso'}
            </DialogTitle>
          </DialogHeader>
          <TicketForm 
            ticket={selectedTicket} 
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}