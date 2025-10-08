import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { ReceitasList } from '@/components/financeiro/ReceitasList';
import { ReceitaFormDialog } from '@/components/financeiro/ReceitaFormDialog';
import { supabase } from '@/lib/supabase';

interface Receita {
  id: string;
  projeto_id: string | null;
  tipo: 'receita';
  categoria: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'cancelado';
  observacoes: string | null;
  created_at: string;
}

export function Receitas() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedReceita, setSelectedReceita] = useState<Receita | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    totalValor: 0,
    pendentes: 0,
    pagas: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('movimentacoes_financeiras')
        .select('status, valor')
        .eq('tipo', 'receita');

      if (error) throw error;

      const total = data?.length || 0;
      const totalValor = data?.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0) || 0;
      const pendentes = data?.filter(r => r.status === 'pendente').length || 0;
      const pagas = data?.filter(r => r.status === 'pago').length || 0;

      setStats({ total, totalValor, pendentes, pagas });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleNew = () => {
    setSelectedReceita(null);
    setFormOpen(true);
  };

  const handleEdit = (receita: Receita) => {
    setSelectedReceita(receita);
    setFormOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todas as receitas do sistema
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Receitas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValor)}</div>
            <p className="text-xs text-muted-foreground">Todas as receitas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pagas}</div>
            <p className="text-xs text-muted-foreground">Recebidas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Receitas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as receitas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceitasList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>

      <ReceitaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        receita={selectedReceita}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
