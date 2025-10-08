import { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFinancialStore } from '@/stores/financialStore';
import { ReceitaForm } from './ReceitaForm';
import { toast } from 'sonner';
import type { Receita } from '@/stores/financialStore';

export function ReceitasList() {
  const { receitas, loading, deleteReceita } = useFinancialStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceita, setSelectedReceita] = useState<Receita | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredReceitas = receitas.filter(receita =>
    receita.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receita.categoria?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await deleteReceita(id);
        toast.success('Receita excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir receita');
      }
    }
  };

  const handleEdit = (receita: Receita) => {
    setSelectedReceita(receita);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedReceita(null);
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

  const totalReceitas = filteredReceitas.reduce((sum, receita) => sum + receita.valor, 0);

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
            <CardTitle>Lista de Receitas</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">
                  Total: {formatCurrency(totalReceitas)}
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
                {filteredReceitas.map((receita) => (
                  <tr key={receita.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(receita.data_receita)}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{receita.descricao}</div>
                        {receita.observacoes && (
                          <div className="text-sm text-gray-500">{receita.observacoes}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {receita.categoria && (
                        <Badge variant="secondary">
                          {receita.categoria.nome}
                        </Badge>
                      )}
                    </td>
                    <td className="p-2">
                      <span className="font-medium text-green-600">
                        {formatCurrency(receita.valor)}
                      </span>
                    </td>
                    <td className="p-2">
                      {receita.contrato_id ? (
                        <Badge variant="outline">
                          Contrato #{receita.contrato_id}
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
                          onClick={() => handleEdit(receita)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(receita.id)}
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
            {filteredReceitas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma receita encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReceita ? 'Editar Receita' : 'Nova Receita'}
            </DialogTitle>
          </DialogHeader>
          <ReceitaForm 
            receita={selectedReceita} 
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}