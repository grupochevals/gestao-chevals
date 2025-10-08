import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, MapPin, TrendingUp } from 'lucide-react';
import { EmpresasList } from '@/components/empresas/EmpresasList';
import { EmpresaFormDialog } from '@/components/empresas/EmpresaFormDialog';
import { EspacoFormDialog } from '@/components/empresas/EspacoFormDialog';
import { UnitDetails } from '@/components/units/UnitDetails';
import { supabase } from '@/lib/supabase';

interface Empresa {
  id: string;
  nome: string;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  responsavel: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
}

interface Espaco {
  id: string;
  nome: string;
  descricao: string | null;
  localizacao: string | null;
  capacidade: number | null;
  valor_base: number | null;
  empresa_id: string | null;
  ativo: boolean;
  created_at: string;
}

export function Unidades() {
  const [empresaFormOpen, setEmpresaFormOpen] = useState(false);
  const [espacoFormOpen, setEspacoFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [selectedEspaco, setSelectedEspaco] = useState<Espaco | null>(null);
  const [empresaIdForNewEspaco, setEmpresaIdForNewEspaco] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    empresasAtivas: 0,
    totalEspacos: 0,
    espacosAtivos: 0,
    capacidadeTotal: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      // Buscar empresas
      const { data: empresasData } = await supabase
        .from('empresas')
        .select('ativo');

      // Buscar espaços
      const { data: espacosData } = await supabase
        .from('unidades')
        .select('ativo, capacidade');

      const totalEmpresas = empresasData?.length || 0;
      const empresasAtivas = empresasData?.filter((e) => e.ativo).length || 0;
      const totalEspacos = espacosData?.length || 0;
      const espacosAtivos = espacosData?.filter((e) => e.ativo).length || 0;
      const capacidadeTotal =
        espacosData?.reduce((sum, e) => sum + (e.capacidade || 0), 0) || 0;

      setStats({
        totalEmpresas,
        empresasAtivas,
        totalEspacos,
        espacosAtivos,
        capacidadeTotal,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleNewEmpresa = () => {
    setSelectedEmpresa(null);
    setEmpresaFormOpen(true);
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setEmpresaFormOpen(true);
  };

  const handleViewEmpresa = (empresa: Empresa) => {
    // TODO: Implementar visualização detalhada de empresa
    console.log('Ver empresa:', empresa);
  };

  const handleAddEspaco = (empresaId: string | null = null) => {
    setSelectedEspaco(null);
    setEmpresaIdForNewEspaco(empresaId);
    setEspacoFormOpen(true);
  };

  const handleEditEspaco = (espaco: Espaco) => {
    setSelectedEspaco(espaco);
    setEmpresaIdForNewEspaco(null);
    setEspacoFormOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas & Espaços</h1>
          <p className="text-gray-600 mt-2">
            Gerencie empresas e seus espaços para locação
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleAddEspaco()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Espaço
          </Button>
          <Button onClick={handleNewEmpresa}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Empresa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmpresas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.empresasAtivas} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Espaços</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEspacos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.espacosAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaços Disponíveis</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.espacosAtivos}</div>
            <p className="text-xs text-muted-foreground">Para locação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidade Total</CardTitle>
            <Building2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.capacidadeTotal.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Pessoas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Empresas e Espaços</CardTitle>
          <CardDescription>
            Organize suas empresas e os espaços disponíveis para locação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmpresasList
            onEditEmpresa={handleEditEmpresa}
            onViewEmpresa={handleViewEmpresa}
            onAddEspaco={handleAddEspaco}
            onEditEspaco={handleEditEspaco}
            refreshTrigger={refreshTrigger}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EmpresaFormDialog
        open={empresaFormOpen}
        onOpenChange={setEmpresaFormOpen}
        empresa={selectedEmpresa}
        onSuccess={handleSuccess}
      />

      <EspacoFormDialog
        open={espacoFormOpen}
        onOpenChange={setEspacoFormOpen}
        espaco={selectedEspaco}
        empresaId={empresaIdForNewEspaco}
        onSuccess={handleSuccess}
      />

      <UnitDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        unit={selectedEspaco}
      />
    </div>
  );
}
