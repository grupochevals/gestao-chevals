import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { DespesasList } from '@/components/financeiro/DespesasList';
import { DespesaFormDialog } from '@/components/financeiro/DespesaFormDialog';
import { supabase } from '@/lib/supabase';

interface Despesa {
  id: string;
  projeto_id: string | null;
  tipo: 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'cancelado';
  observacoes: string | null;
  created_at: string;
}

export function Despesas() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);
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
        .eq('tipo', 'despesa');

      if (error) throw error;

      const total = data?.length || 0;
      const totalValor = data?.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0) || 0;
      const pendentes = data?.filter(d => d.status === 'pendente').length || 0;
      const pagas = data?.filter(d => d.status === 'pago').length || 0;

      setStats({ total, totalValor, pendentes, pagas });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleNew = () => {
    setSelectedDespesa(null);
    setFormOpen(true);
  };

  const handleEdit = (despesa: Despesa) => {
    setSelectedDespesa(despesa);
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
          <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todas as despesas do sistema
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Despesas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(stats.totalValor)}</div>
            <p className="text-xs text-muted-foreground">Todas as despesas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
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
            <p className="text-xs text-muted-foreground">Já pagas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Despesas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DespesasList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>

      <DespesaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        despesa={selectedDespesa}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
