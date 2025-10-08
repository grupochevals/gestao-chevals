import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Calculator, Plus, Filter, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ReceitasList } from '@/components/financeiro/ReceitasList';
import { DespesasList } from '@/components/financeiro/DespesasList';
import { ReceitaFormDialog } from '@/components/financeiro/ReceitaFormDialog';
import { DespesaFormDialog } from '@/components/financeiro/DespesaFormDialog';
import { CategoriasList } from '@/components/financeiro/CategoriasList';

export function Financeiro() {
  const [activeTab, setActiveTab] = useState('receitas');
  const [regime, setRegime] = useState<'caixa' | 'competencia'>('caixa');
  const [receitaDialogOpen, setReceitaDialogOpen] = useState(false);
  const [despesaDialogOpen, setDespesaDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [filtroProjeto, setFiltroProjeto] = useState<string>('all');
  const [filtroStatus, setFiltroStatus] = useState<string>('all');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');

  const [categorias, setCategorias] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);

  const [stats, setStats] = useState({
    totalReceitas: 0,
    valorReceitas: 0,
    totalDespesas: 0,
    valorDespesas: 0,
    lucroLiquido: 0,
    margemLucro: 0,
  });

  useEffect(() => {
    fetchStats();
    fetchCategorias();
    fetchProjetos();
  }, [regime, refreshTrigger]);

  const fetchCategorias = async () => {
    try {
      const tipo = activeTab === 'receitas' ? ['receita', 'ambos'] : ['despesa', 'ambos'];
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('id, nome')
        .in('tipo', tipo)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const fetchProjetos = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const { data: movimentacoes, error } = await supabase
        .from('movimentacoes_financeiras')
        .select('tipo, valor, status, data_vencimento, data_pagamento');

      if (error) throw error;

      // Filter based on regime
      const filtered = movimentacoes?.filter((m) => {
        if (regime === 'caixa') {
          // Caixa: only count if paid (has data_pagamento)
          return m.status === 'pago' && m.data_pagamento;
        } else {
          // Competência: count all except cancelled
          return m.status !== 'cancelado';
        }
      }) || [];

      const receitas = filtered.filter((m) => m.tipo === 'receita');
      const despesas = filtered.filter((m) => m.tipo === 'despesa');

      const valorReceitas = receitas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
      const valorDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);
      const lucroLiquido = valorReceitas - valorDespesas;
      const margemLucro = valorReceitas > 0 ? (lucroLiquido / valorReceitas) * 100 : 0;

      setStats({
        totalReceitas: receitas.length,
        valorReceitas,
        totalDespesas: despesas.length,
        valorDespesas,
        lucroLiquido,
        margemLucro,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLimparFiltros = () => {
    setFiltroCategoria('all');
    setFiltroProjeto('all');
    setFiltroStatus('all');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  };

  const hasActiveFilters =
    filtroCategoria !== 'all' ||
    filtroProjeto !== 'all' ||
    filtroStatus !== 'all' ||
    filtroDataInicio !== '' ||
    filtroDataFim !== '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600 mt-2">
            Gerencie receitas, despesas e fechamentos financeiros
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Select value={regime} onValueChange={(v) => setRegime(v as 'caixa' | 'competencia')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caixa">Regime de Caixa</SelectItem>
              <SelectItem value="competencia">Regime de Competência</SelectItem>
            </SelectContent>
          </Select>
          {activeTab === 'receitas' && (
            <Button onClick={() => setReceitaDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          )}
          {activeTab === 'despesas' && (
            <Button onClick={() => setDespesaDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {activeTab !== 'fechamentos' && activeTab !== 'categorias' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <CardTitle className="text-base">Filtros</CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLimparFiltros}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-6 px-2 text-xs"
              >
                {showFilters ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filtro-categoria">Categoria</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger id="filtro-categoria">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nome}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-projeto">Projeto</Label>
                <Select value={filtroProjeto} onValueChange={setFiltroProjeto}>
                  <SelectTrigger id="filtro-projeto">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {projetos.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>
                        {proj.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-status">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger id="filtro-status">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-data-inicio">Data Início</Label>
                <Input
                  id="filtro-data-inicio"
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-data-fim">Data Fim</Label>
                <Input
                  id="filtro-data-fim"
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.valorReceitas.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReceitas} receita{stats.totalReceitas !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.valorDespesas.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDespesas} despesa{stats.totalDespesas !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lucroLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {stats.lucroLiquido.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem de {stats.margemLucro.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReceitas + stats.totalDespesas}</div>
            <p className="text-xs text-muted-foreground">Total de lançamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="fechamentos">Fechamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="receitas" className="space-y-4">
          <ReceitasList
            onUpdate={handleUpdate}
            refreshTrigger={refreshTrigger}
            regime={regime}
            filtros={{
              categoria: filtroCategoria,
              projeto: filtroProjeto,
              status: filtroStatus,
              dataInicio: filtroDataInicio,
              dataFim: filtroDataFim,
            }}
          />
        </TabsContent>

        <TabsContent value="despesas" className="space-y-4">
          <DespesasList
            onUpdate={handleUpdate}
            refreshTrigger={refreshTrigger}
            regime={regime}
            filtros={{
              categoria: filtroCategoria,
              projeto: filtroProjeto,
              status: filtroStatus,
              dataInicio: filtroDataInicio,
              dataFim: filtroDataFim,
            }}
          />
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <CategoriasList onUpdate={handleUpdate} refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="fechamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fechamentos de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Funcionalidade em desenvolvimento
                </h3>
                <p className="text-gray-500">
                  Sistema de fechamentos será implementado em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReceitaFormDialog
        open={receitaDialogOpen}
        onOpenChange={setReceitaDialogOpen}
        onSuccess={handleUpdate}
      />

      <DespesaFormDialog
        open={despesaDialogOpen}
        onOpenChange={setDespesaDialogOpen}
        onSuccess={handleUpdate}
      />
    </div>
  );
}
