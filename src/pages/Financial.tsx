import { useState, useEffect } from 'react';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFinancialStore } from '@/stores/financialStore';
import { ReceitasList } from '@/components/financial/ReceitasList';
import { DespesasList } from '@/components/financial/DespesasList';
import { FechamentosList } from '@/components/financial/FechamentosList';
import { ReceitaForm } from '@/components/financial/ReceitaForm';
import { DespesaForm } from '@/components/financial/DespesaForm';
import { FechamentoForm } from '@/components/financial/FechamentoForm';

export function Financial() {
  const { 
    receitas, 
    despesas, 
    fechamentos,
    loading,
    fetchReceitas,
    fetchDespesas,
    fetchFechamentos,
    fetchCategoriasReceita,
    fetchCategoriasDespesa
  } = useFinancialStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [isReceitaFormOpen, setIsReceitaFormOpen] = useState(false);
  const [isDespesaFormOpen, setIsDespesaFormOpen] = useState(false);
  const [isFechamentoFormOpen, setIsFechamentoFormOpen] = useState(false);

  useEffect(() => {
    fetchReceitas();
    fetchDespesas();
    fetchFechamentos();
    fetchCategoriasReceita();
    fetchCategoriasDespesa();
  }, [fetchReceitas, fetchDespesas, fetchFechamentos, fetchCategoriasReceita, fetchCategoriasDespesa]);

  // Calcular totais
  const totalReceitas = receitas.reduce((sum, receita) => sum + receita.valor, 0);
  const totalDespesas = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
  const resultado = totalReceitas - totalDespesas;

  // Receitas e despesas do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const receitasMesAtual = receitas.filter(receita => {
    const data = new Date(receita.data_receita);
    return data.getMonth() === currentMonth && data.getFullYear() === currentYear;
  });
  
  const despesasMesAtual = despesas.filter(despesa => {
    const data = new Date(despesa.data_despesa);
    return data.getMonth() === currentMonth && data.getFullYear() === currentYear;
  });

  const totalReceitasMes = receitasMesAtual.reduce((sum, receita) => sum + receita.valor, 0);
  const totalDespesasMes = despesasMesAtual.reduce((sum, despesa) => sum + despesa.valor, 0);
  const resultadoMes = totalReceitasMes - totalDespesasMes;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="fechamentos">Fechamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalReceitas)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {receitas.length} lançamentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalDespesas)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {despesas.length} lançamentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resultado Geral</CardTitle>
                <DollarSign className={`h-4 w-4 ${resultado >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(resultado)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Receitas - Despesas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fechamentos</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {fechamentos.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Eventos fechados
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resultado do Mês</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Receitas</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(totalReceitasMes)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Despesas</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(totalDespesasMes)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Resultado</span>
                    <span className={`font-bold ${resultadoMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(resultadoMes)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Lançamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...receitas, ...despesas]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((item, index) => {
                      const isReceita = 'data_receita' in item;
                      return (
                        <div key={`${isReceita ? 'receita' : 'despesa'}-${item.id}`} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{item.descricao}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(isReceita ? item.data_receita : item.data_despesa).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <span className={`font-medium ${isReceita ? 'text-green-600' : 'text-red-600'}`}>
                            {isReceita ? '+' : '-'}{formatCurrency(item.valor)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receitas">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Receitas</h2>
            <Dialog open={isReceitaFormOpen} onOpenChange={setIsReceitaFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Receita</DialogTitle>
                </DialogHeader>
                <ReceitaForm onClose={() => setIsReceitaFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          <ReceitasList />
        </TabsContent>

        <TabsContent value="despesas">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Despesas</h2>
            <Dialog open={isDespesaFormOpen} onOpenChange={setIsDespesaFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Despesa</DialogTitle>
                </DialogHeader>
                <DespesaForm onClose={() => setIsDespesaFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          <DespesasList />
        </TabsContent>

        <TabsContent value="fechamentos">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Fechamentos de Eventos</h2>
            <Dialog open={isFechamentoFormOpen} onOpenChange={setIsFechamentoFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fechamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Novo Fechamento de Evento</DialogTitle>
                </DialogHeader>
                <FechamentoForm onClose={() => setIsFechamentoFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          <FechamentosList />
        </TabsContent>
      </Tabs>
    </div>
  );
}