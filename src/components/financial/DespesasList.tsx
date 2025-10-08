import { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFinancialStore } from '@/stores/financialStore';
import { DespesaForm } from './DespesaForm';
import { toast } from 'sonner';
import type { Despesa } from '@/stores/financialStore';

export function DespesasList() {
  const { despesas, loading, deleteDespesa } = useFinancialStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredDespesas = despesas.filter(despesa =>
    despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    despesa.categoria?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deleteDespesa(id);
        toast.success('Despesa excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir despesa');
      }
    }
  };

  const handleEdit = (despesa: Despesa) => {
    setSelectedDespesa(despesa);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedDespesa(null);
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

  const totalDespesas = filteredDespesas.reduce((sum, despesa) => sum + despesa.valor, 0);

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
            <CardTitle>Lista de Despesas</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-600">
                  Total: {formatCurrency(totalDespesas)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por descrição ou categoria..."
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
                  <th className="text-left p-2">Descrição</th>
                  <th className="text-left p-2">Categoria</th>
                  <th className="text-left p-2">Valor</th>
                  <th className="text-left p-2">Contrato</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredDespesas.map((despesa) => (
                  <tr key={despesa.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(despesa.data_despesa)}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{despesa.descricao}</div>
                        {despesa.observacoes && (
                          <div className="text-sm text-gray-500">{despesa.observacoes}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {despesa.categoria && (
                        <Badge variant="secondary">
                          {despesa.categoria.nome}
                        </Badge>
                      )}
                    </td>
                    <td className="p-2">
                      <span className="font-medium text-red-600">
                        {formatCurrency(despesa.valor)}
                      </span>
                    </td>
                    <td className="p-2">
                      {despesa.contrato_id ? (
                        <Badge variant="outline">
                          Contrato #{despesa.contrato_id}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(despesa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(despesa.id)}
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
            {filteredDespesas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma despesa encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDespesa ? 'Editar Despesa' : 'Nova Despesa'}
            </DialogTitle>
          </DialogHeader>
          <DespesaForm 
            despesa={selectedDespesa} 
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}