import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building, Users, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useEntityStore } from '@/stores/entityStore';
import { EntityForm } from '@/components/entities/EntityForm';
import { toast } from 'sonner';
import type { Entidade } from '@/types';

export function Entities() {
  const { entities, loading, fetchEntities, deleteEntity } = useEntityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entidade | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && entity.tipo === activeTab;
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta entidade?')) {
      try {
        await deleteEntity(id);
        toast.success('Entidade excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir entidade');
      }
    }
  };

  const handleEdit = (entity: Entidade) => {
    setSelectedEntity(entity);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedEntity(null);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'cliente':
        return <Users className="h-4 w-4" />;
      case 'parceiro':
        return <Building className="h-4 w-4" />;
      case 'fornecedor':
        return <Truck className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getEntityBadgeColor = (type: string) => {
    switch (type) {
      case 'cliente':
        return 'bg-blue-100 text-blue-800';
      case 'parceiro':
        return 'bg-green-100 text-green-800';
      case 'fornecedor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const entityCounts = {
    all: entities.length,
    cliente: entities.filter(e => e.tipo === 'cliente').length,
    parceiro: entities.filter(e => e.tipo === 'parceiro').length,
    fornecedor: entities.filter(e => e.tipo === 'fornecedor').length,
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
        <h1 className="text-3xl font-bold text-gray-900">Entidades</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedEntity(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Entidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedEntity ? 'Editar Entidade' : 'Nova Entidade'}
              </DialogTitle>
            </DialogHeader>
            <EntityForm 
              entity={selectedEntity} 
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Entidades</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, documento ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Todas ({entityCounts.all})
              </TabsTrigger>
              <TabsTrigger value="cliente" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes ({entityCounts.cliente})
              </TabsTrigger>
              <TabsTrigger value="parceiro" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Parceiros ({entityCounts.parceiro})
              </TabsTrigger>
              <TabsTrigger value="fornecedor" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Fornecedores ({entityCounts.fornecedor})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Documento</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Telefone</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntities.map((entity) => (
                      <tr key={entity.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <Badge className={getEntityBadgeColor(entity.tipo)}>
                            <span className="flex items-center gap-1">
                              {getEntityIcon(entity.tipo)}
                              {entity.tipo.charAt(0).toUpperCase() + entity.tipo.slice(1)}
                            </span>
                          </Badge>
                        </td>
                        <td className="p-2 font-medium">{entity.nome}</td>
                        <td className="p-2">{entity.documento || '-'}</td>
                        <td className="p-2">{entity.email || '-'}</td>
                        <td className="p-2">{entity.telefone || '-'}</td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(entity)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entity.id)}
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
                {filteredEntities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma entidade encontrada
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}