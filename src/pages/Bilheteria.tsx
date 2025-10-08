import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Store, BarChart3 } from 'lucide-react';
import { BilheteriaCanaisList } from '@/components/bilheteria/BilheteriaCanaisList';
import { CanalFormDialog } from '@/components/bilheteria/CanalFormDialog';
import { BilheteriaRelatorios } from '@/components/bilheteria/BilheteriaRelatorios';

interface CanalVenda {
  id: string;
  nome: string;
  tipo: 'presencial' | 'online' | 'telefone' | 'terceiro' | 'cortesia';
  responsavel: string | null;
  contato: string | null;
  taxa_servico: number;
  ativo: boolean;
  observacoes: string | null;
  created_at: string;
}

export function Bilheteria() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCanal, setSelectedCanal] = useState<CanalVenda | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('canais');

  const handleNew = () => {
    setSelectedCanal(null);
    setFormOpen(true);
  };

  const handleEdit = (canal: CanalVenda) => {
    setSelectedCanal(canal);
    setFormOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bilheteria</h1>
          <p className="text-gray-600 mt-2">
            Gerencie canais de venda e acompanhe relatórios de ingressos
          </p>
        </div>
        {activeTab === 'canais' && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Canal
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="canais" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Canais de Venda
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="canais" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Canais de Venda</CardTitle>
              <CardDescription>
                Configure e gerencie os canais de venda de ingressos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BilheteriaCanaisList
                onEdit={handleEdit}
                refreshTrigger={refreshTrigger}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <BilheteriaRelatorios />
        </TabsContent>
      </Tabs>

      {/* Dialog para Criar/Editar Canal */}
      <CanalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        canal={selectedCanal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
