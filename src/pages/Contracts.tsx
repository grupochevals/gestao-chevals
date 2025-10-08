import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useContractStore } from '@/stores/contractStore';
import { ContractForm } from '@/components/contracts/ContractForm';
import { ContractDetails } from '@/components/contracts/ContractDetails';
import { toast } from 'sonner';
import type { Contrato } from '@/types';

export function Contracts() {
  const { contracts, loading, fetchContracts, deleteContract } = useContractStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contrato | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const filteredContracts = contracts.filter(contract =>
    contract.nome_evento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await deleteContract(id);
        toast.success('Contrato excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir contrato');
      }
    }
  };

  const handleEdit = (contract: Contrato) => {
    setSelectedContract(contract);
    setIsFormOpen(true);
  };

  const handleView = (contract: Contrato) => {
    setSelectedContract(contract);
    setIsDetailsOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedContract(null);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedContract(null);
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedContract(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedContract ? 'Editar Contrato' : 'Novo Contrato'}
              </DialogTitle>
            </DialogHeader>
            <ContractForm 
              contract={selectedContract} 
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome do evento ou número do contrato..."
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
                  <th className="text-left p-2">Número</th>
                  <th className="text-left p-2">Nome do Evento</th>
                  <th className="text-left p-2">Unidade</th>
                  <th className="text-left p-2">Projeto</th>
                  <th className="text-left p-2">Período</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{contract.numero_contrato}</td>
                    <td className="p-2 font-medium">{contract.nome_evento}</td>
                    <td className="p-2">{contract.unidades?.nome}</td>
                    <td className="p-2">{contract.projetos?.nome}</td>
                    <td className="p-2">
                      {contract.inicio_realizacao && contract.fim_realizacao && (
                        <>
                          {new Date(contract.inicio_realizacao).toLocaleDateString()} - {' '}
                          {new Date(contract.fim_realizacao).toLocaleDateString()}
                        </>
                      )}
                    </td>
                    <td className="p-2">{contract.tipo_evento}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(contract)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(contract)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contract.id)}
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
            {filteredContracts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum contrato encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Contrato</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <ContractDetails 
              contract={selectedContract} 
              onClose={handleDetailsClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}