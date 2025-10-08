import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
  projetos?: { nome: string };
}

interface Filtros {
  categoria: string;
  projeto: string;
  status: string;
  dataInicio: string;
  dataFim: string;
}

interface ReceitasListProps {
  onEdit?: (receita: Receita) => void;
  onUpdate?: () => void;
  refreshTrigger?: number;
  regime?: 'caixa' | 'competencia';
  filtros?: Filtros;
}

export function ReceitasList({ onEdit, onUpdate, refreshTrigger, regime = 'caixa', filtros }: ReceitasListProps) {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [receitaToDelete, setReceitaToDelete] = useState<Receita | null>(null);

  const fetchReceitas = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('movimentacoes_financeiras')
        .select(`
          *,
          projetos:projeto_id(nome)
        `)
        .eq('tipo', 'receita');

      // Filter by regime
      if (regime === 'caixa') {
        // Caixa: only paid items
        query = query.eq('status', 'pago').not('data_pagamento', 'is', null);
      } else {
        // Competência: all except cancelled
        query = query.neq('status', 'cancelado');
      }

      // Apply filters
      if (filtros) {
        if (filtros.categoria && filtros.categoria !== 'all') {
          query = query.eq('categoria', filtros.categoria);
        }
        if (filtros.projeto && filtros.projeto !== 'all') {
          query = query.eq('projeto_id', filtros.projeto);
        }
        if (filtros.status && filtros.status !== 'all') {
          query = query.eq('status', filtros.status);
        }
        if (filtros.dataInicio) {
          query = query.gte('data_vencimento', filtros.dataInicio);
        }
        if (filtros.dataFim) {
          query = query.lte('data_vencimento', filtros.dataFim);
        }
      }

      const { data, error } = await query.order('data_vencimento', { ascending: false });

      if (error) throw error;
      setReceitas(data || []);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceitas();
  }, [refreshTrigger, regime, filtros]);

  const handleDelete = async () => {
    if (!receitaToDelete) return;

    try {
      const { error } = await supabase
        .from('movimentacoes_financeiras')
        .delete()
        .eq('id', receitaToDelete.id);

      if (error) throw error;

      toast.success('Receita excluída com sucesso');
      fetchReceitas();
      onUpdate?.();
      setDeleteDialogOpen(false);
      setReceitaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast.error('Erro ao excluir receita');
    }
  };

  const openDeleteDialog = (receita: Receita) => {
    setReceitaToDelete(receita);
    setDeleteDialogOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || '';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: 'Pendente',
      pago: 'Pago',
      cancelado: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (receitas.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma receita cadastrada
        </h3>
        <p className="text-gray-500">
          Comece cadastrando sua primeira receita
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receitas.map((receita) => (
              <TableRow key={receita.id}>
                <TableCell className="font-medium">
                  <div className="max-w-md">
                    <div className="font-semibold">{receita.descricao}</div>
                    {receita.observacoes && (
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {receita.observacoes}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{receita.categoria}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {receita.projetos?.nome || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    {formatDate(receita.data_vencimento)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {receita.data_pagamento
                      ? formatDate(receita.data_pagamento)
                      : '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-green-700">
                    {formatCurrency(receita.valor)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getStatusBadgeColor(receita.status)}>
                    {getStatusLabel(receita.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(receita)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(receita)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a receita "{receitaToDelete?.descricao}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
