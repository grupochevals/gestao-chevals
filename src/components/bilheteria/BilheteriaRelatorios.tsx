import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Ticket } from 'lucide-react';

interface Projeto {
  id: string;
  nome: string;
}

interface VendaStats {
  totalVendas: number;
  totalIngressos: number;
  valorBruto: number;
  valorLiquido: number;
  porCanal: Array<{
    canal: string;
    quantidade: number;
    valor: number;
  }>;
}

export function BilheteriaRelatorios() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState<string>('todos');
  const [stats, setStats] = useState<VendaStats>({
    totalVendas: 0,
    totalIngressos: 0,
    valorBruto: 0,
    valorLiquido: 0,
    porCanal: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjetos();
  }, []);

  useEffect(() => {
    if (projetos.length > 0 || selectedProjeto === 'todos') {
      fetchStats();
    }
  }, [selectedProjeto, projetos]);

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

  const fetchStats = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('vendas_ingressos')
        .select(`
          *,
          canais_venda:canal_venda_id(nome)
        `)
        .eq('status', 'confirmado');

      if (selectedProjeto !== 'todos') {
        query = query.eq('projeto_id', selectedProjeto);
      }

      const { data, error } = await query;

      if (error) throw error;

      const vendas = data || [];

      // Calcular estatísticas
      const totalVendas = vendas.length;
      const totalIngressos = vendas.reduce((sum, v) => sum + (v.quantidade || 1), 0);
      const valorBruto = vendas.reduce((sum, v) => sum + parseFloat(v.valor_total || 0), 0);
      const valorLiquido = vendas.reduce((sum, v) => sum + parseFloat(v.valor_liquido || 0), 0);

      // Agrupar por canal
      const porCanalMap = vendas.reduce((acc, venda) => {
        const canalNome = venda.canais_venda?.nome || 'Não identificado';
        if (!acc[canalNome]) {
          acc[canalNome] = { canal: canalNome, quantidade: 0, valor: 0 };
        }
        acc[canalNome].quantidade += venda.quantidade || 1;
        acc[canalNome].valor += parseFloat(venda.valor_total || 0);
        return acc;
      }, {} as Record<string, { canal: string; quantidade: number; valor: number }>);

      const porCanal = Object.values(porCanalMap).sort((a, b) => b.valor - a.valor);

      setStats({
        totalVendas,
        totalIngressos,
        valorBruto,
        valorLiquido,
        porCanal,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading && projetos.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro por Projeto */}
      <div className="max-w-xs">
        <Label htmlFor="projeto-filter">Filtrar por Projeto</Label>
        <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
          <SelectTrigger id="projeto-filter">
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Projetos</SelectItem>
            {projetos.map((projeto) => (
              <SelectItem key={projeto.id} value={projeto.id}>
                {projeto.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendas}</div>
            <p className="text-xs text-muted-foreground">
              Vendas confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
            <Ticket className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIngressos}</div>
            <p className="text-xs text-muted-foreground">
              Total de ingressos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Bruto</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.valorBruto)}</div>
            <p className="text-xs text-muted-foreground">
              Total vendido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Líquido</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.valorLiquido)}</div>
            <p className="text-xs text-muted-foreground">
              Após taxas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendas por Canal */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.porCanal.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma venda registrada
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal de Venda</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Participação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.porCanal.map((canal) => {
                    const participacao = stats.valorBruto > 0
                      ? (canal.valor / stats.valorBruto) * 100
                      : 0;

                    return (
                      <TableRow key={canal.canal}>
                        <TableCell className="font-medium">{canal.canal}</TableCell>
                        <TableCell className="text-right">
                          {canal.quantidade}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(canal.valor)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {participacao.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
