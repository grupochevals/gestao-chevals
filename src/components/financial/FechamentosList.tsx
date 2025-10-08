import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Search, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFinancialStore } from '@/stores/financialStore';
import { FechamentoForm } from './FechamentoForm';
import { FechamentoDetails } from './FechamentoDetails';
import { toast } from 'sonner';
import type { FechamentoEvento } from '@/stores/financialStore';

export function FechamentosList() {
  const { fechamentos, loading, deleteFechamento } = useFinancialStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFechamento, setSelectedFechamento] = useState<FechamentoEvento | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredFechamentos = fechamentos.filter(fechamento =>
    fechamento.contrato?.nome_evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fechamento.contrato?.entidade?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este fechamento?')) {
      try {
        await deleteFechamento(id);
        toast.success('Fechamento excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir fechamento');
      }
    }
  };

  const handleEdit = (fechamento: FechamentoEvento) => {
    setSelectedFechamento(fechamento);
    setIsFormOpen(true);
  };

  const handleView = (fechamento: FechamentoEvento) => {
    setSelectedFechamento(fechamento);
    setIsDetailsOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedFechamento(null);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedFechamento(null);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejeitado':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
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
            <CardTitle>Fechamentos de Eventos</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por evento ou cliente..."
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
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Evento</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Total Receitas</th>
                  <th className="text-left p-2">Total Despesas</th>
                  <th className="text-left p-2">Resultado</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFechamentos.map((fechamento) => (
                  <tr key={fechamento.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(fechamento.data_fechamento)}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">
                        {fechamento.contrato?.nome_evento || 'N/A'}
                      </div>
                    </td>
                    <td className="p-2">
                      {fechamento.contrato?.entidade?.nome || 'N/A'}
                    </td>
                    <td className="p-2">
                      <span className="font-medium text-green-600">
                        {formatCurrency(fechamento.total_receitas)}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="font-medium text-red-600">
                        {formatCurrency(fechamento.total_despesas)}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`font-medium ${
                        fechamento.resultado_liquido >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(fechamento.resultado_liquido)}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(fechamento.status)}
                        <Badge className={getStatusColor(fechamento.status)}>
                          {fechamento.status.charAt(0).toUpperCase() + fechamento.status.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(fechamento)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(fechamento)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(fechamento.id)}
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
            {filteredFechamentos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum fechamento encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedFechamento ? 'Editar Fechamento' : 'Novo Fechamento'}
            </DialogTitle>
          </DialogHeader>
          <FechamentoForm 
            fechamento={selectedFechamento} 
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Fechamento</DialogTitle>
          </DialogHeader>
          {selectedFechamento && (
            <FechamentoDetails fechamento={selectedFechamento} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}