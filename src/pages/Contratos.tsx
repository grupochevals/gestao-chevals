import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, DollarSign, Edit, Trash2, Eye } from 'lucide-react';
import { useContratosStore } from '@/stores/contratosStore';
import { ContratoForm } from '@/components/contratos/ContratoForm';
import { Contrato, ContratoFormData } from '@/types/contratos';
import { toast } from 'sonner';

export function Contratos() {
  const { contratos, loading, error, fetchContratos, createContrato, updateContrato, deleteContrato } = useContratosStore();
  const [showForm, setShowForm] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);

  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  const handleCreateContrato = async (data: ContratoFormData) => {
    const result = await createContrato(data);
    if (result) {
      toast.success('Contrato criado com sucesso!');
      setShowForm(false);
    } else {
      toast.error('Erro ao criar contrato');
    }
  };

  const handleUpdateContrato = async (data: ContratoFormData) => {
    if (!editingContrato) return;
    
    const result = await updateContrato(editingContrato.id, data);
    if (result) {
      toast.success('Contrato atualizado com sucesso!');
      setEditingContrato(null);
    } else {
      toast.error('Erro ao atualizar contrato');
    }
  };

  const handleDeleteContrato = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este contrato?')) {
      const result = await deleteContrato(id);
      if (result) {
        toast.success('Contrato excluído com sucesso!');
      } else {
        toast.error('Erro ao excluir contrato');
      }
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (showForm || editingContrato) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {editingContrato ? 'Editar Contrato' : 'Novo Contrato'}
          </h1>
        </div>

        <ContratoForm
          initialData={editingContrato || undefined}
          onSubmit={editingContrato ? handleUpdateContrato : handleCreateContrato}
          onCancel={() => {
            setShowForm(false);
            setEditingContrato(null);
          }}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contratos</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Contrato
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contratos Ativos</p>
              <p className="text-2xl font-bold">{contratos.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vencendo em 30 dias</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  contratos.reduce((total, contrato) => 
                    total + (contrato.locacao_valor_inicial || 0) + (contrato.g_servicos_valor_inicial || 0), 0
                  )
                )}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Lista de Contratos */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Lista de Contratos</h2>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando contratos...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && contratos.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            Nenhum contrato encontrado. Clique em "Novo Contrato" para criar o primeiro.
          </div>
        )}

        {!loading && !error && contratos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Número</th>
                  <th className="text-left py-3 px-4">Evento</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-left py-3 px-4">Realização</th>
                  <th className="text-left py-3 px-4">Valor Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((contrato) => (
                  <tr key={contrato.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {contrato.numero_contrato || `#${contrato.id}`}
                    </td>
                    <td className="py-3 px-4">
                      {contrato.nome_evento || 'Sem nome'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {contrato.tipo_evento || 'Não definido'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(contrato.inicio_realizacao)} - {formatDate(contrato.fim_realizacao)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(
                        (contrato.locacao_valor_inicial || 0) + 
                        (contrato.g_servicos_valor_inicial || 0)
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default">Ativo</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* Implementar visualização */}}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingContrato(contrato)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContrato(contrato.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}