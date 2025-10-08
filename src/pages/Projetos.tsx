import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { ProjetosList } from '@/components/projetos/ProjetosList';
import { ProjetoFormDialog } from '@/components/projetos/ProjetoFormDialog';
import { ProjetoDetails } from '@/components/projetos/ProjetoDetails';
import { supabase } from '@/lib/supabase';

interface Projeto {
  id: string;
  nome: string;
  tipo: string | null;
  descricao: string | null;
  local: string | null;
  responsavel: string | null;
  entidade_id: string | null;
  unidade_id: string | null;
  espaco_id: string | null;
  contrato_id: string | null;
  data_inicio: string;
  data_fim: string;
  status: 'planejamento' | 'aprovado' | 'em_andamento' | 'concluido' | 'cancelado';
  orcamento: number | null;
  observacoes: string | null;
  created_at: string;
}

export function Projetos() {
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    planejamento: 0,
    em_andamento: 0,
    concluidos: 0,
    proximos30dias: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('status, data_inicio, data_fim');

      if (error) throw error;

      const total = data?.length || 0;
      const planejamento = data?.filter((p) =>
        p.status === 'planejamento' || p.status === 'aprovado'
      ).length || 0;
      const em_andamento = data?.filter((p) => p.status === 'em_andamento').length || 0;
      const concluidos = data?.filter((p) => p.status === 'concluido').length || 0;

      // Próximos 30 dias
      const hoje = new Date();
      const daqui30dias = new Date();
      daqui30dias.setDate(hoje.getDate() + 30);

      const proximos30dias = data?.filter((p) => {
        const dataInicio = new Date(p.data_inicio);
        return dataInicio >= hoje && dataInicio <= daqui30dias && p.status !== 'cancelado' && p.status !== 'concluido';
      }).length || 0;

      setStats({
        total,
        planejamento,
        em_andamento,
        concluidos,
        proximos30dias,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleNew = () => {
    setSelectedProjeto(null);
    setFormOpen(true);
  };

  const handleEdit = (projeto: Projeto) => {
    setSelectedProjeto(projeto);
    setFormOpen(true);
  };

  const handleView = (projeto: Projeto) => {
    setSelectedProjeto(projeto);
    setDetailsOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos (Eventos)</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todos os eventos e projetos
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todos os projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planejamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.planejamento}</div>
            <p className="text-xs text-muted-foreground">
              Em planejamento/aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.em_andamento}</div>
            <p className="text-xs text-muted-foreground">
              Acontecendo agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidos}</div>
            <p className="text-xs text-muted-foreground">
              Eventos finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Projetos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os projetos e eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjetosList
            onEdit={handleEdit}
            onView={handleView}
            refreshTrigger={refreshTrigger}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProjetoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projeto={selectedProjeto}
        onSuccess={handleSuccess}
      />

      <ProjetoDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        projeto={selectedProjeto}
      />
    </div>
  );
}
