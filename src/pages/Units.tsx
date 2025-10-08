import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useUnitStore } from '@/stores/unitStore';
import { UnitForm } from '@/components/units/UnitForm';
import { toast } from 'sonner';
import type { Unidade } from '@/stores/unitStore';

export function Units() {
  const { units, loading, fetchUnits, deleteUnit } = useUnitStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<Unidade | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const filteredUnits = units.filter(unit =>
    unit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      try {
        await deleteUnit(id);
        toast.success('Unidade excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir unidade');
      }
    }
  };

  const handleEdit = (unit: Unidade) => {
    setSelectedUnit(unit);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUnit(null);
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
        <h1 className="text-3xl font-bold text-gray-900">Unidades</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedUnit(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedUnit ? 'Editar Unidade' : 'Nova Unidade'}
              </DialogTitle>
            </DialogHeader>
            <UnitForm 
              unit={selectedUnit} 
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Unidades</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, cidade ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUnits.map((unit) => (
              <Card key={unit.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{unit.nome}</CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(unit)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(unit.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <div>{unit.endereco}</div>
                      <div>{unit.cidade}, {unit.estado}</div>
                      <div>CEP: {unit.cep}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Capacidade: {unit.capacidade_maxima} pessoas
                    </span>
                  </div>

                  {unit.observacoes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {unit.observacoes}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Ativa
                    </Badge>
                    <span className="text-xs text-gray-400">
                      ID: {unit.id}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredUnits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma unidade encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}