import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCheck, Handshake, Building2 } from 'lucide-react';
import { EntidadesList } from '@/components/entidades/EntidadesList';
import { EntidadeFormDialog } from '@/components/entidades/EntidadeFormDialog';
import { EntidadeDetails } from '@/components/entidades/EntidadeDetails';
import { supabase } from '@/lib/supabase';

interface Entidade {
  id: string;
  nome: string;
  tipo?: 'cliente' | 'parceiro' | 'fornecedor';
  e_cliente: boolean;
  e_parceiro: boolean;
  e_fornecedor: boolean;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  ativo: boolean;
  created_at: string;
}

export function Entidades() {
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEntidade, setSelectedEntidade] = useState<Entidade | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    clientes: 0,
    parceiros: 0,
    fornecedores: 0,
    ativos: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('entidades')
        .select('e_cliente, e_parceiro, e_fornecedor, ativo');

      if (error) throw error;

      const total = data?.length || 0;
      const clientes = data?.filter((e) => e.e_cliente).length || 0;
      const parceiros = data?.filter((e) => e.e_parceiro).length || 0;
      const fornecedores = data?.filter((e) => e.e_fornecedor).length || 0;
      const ativos = data?.filter((e) => e.ativo).length || 0;

      setStats({
        total,
        clientes,
        parceiros,
        fornecedores,
        ativos,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleNew = () => {
    setSelectedEntidade(null);
    setFormOpen(true);
  };

  const handleEdit = (entidade: Entidade) => {
    setSelectedEntidade(entidade);
    setFormOpen(true);
  };

  const handleView = (entidade: Entidade) => {
    setSelectedEntidade(entidade);
    setDetailsOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entidades</h1>
          <p className="text-gray-600 mt-2">
            Gerencie clientes, parceiros e fornecedores
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Entidade
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ativos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientes}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parceiros</CardTitle>
            <Handshake className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.parceiros}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Building2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fornecedores}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Entidades</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as entidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntidadesList
            onEdit={handleEdit}
            onView={handleView}
            refreshTrigger={refreshTrigger}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EntidadeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entidade={selectedEntidade}
        onSuccess={handleSuccess}
      />

      <EntidadeDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        entidade={selectedEntidade}
      />
    </div>
  );
}
