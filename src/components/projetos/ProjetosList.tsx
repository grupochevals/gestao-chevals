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
  Eye,
  Calendar,
  MapPin,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
  entidades?: { nome: string };
  unidades?: { nome: string };
  contratos?: { numero: string };
}

interface ProjetosListProps {
  onEdit: (projeto: Projeto) => void;
  onView: (projeto: Projeto) => void;
  refreshTrigger?: number;
}

export function ProjetosList({ onEdit, onView, refreshTrigger }: ProjetosListProps) {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projetoToDelete, setProjetoToDelete] = useState<Projeto | null>(null);
  const [activeTab, setActiveTab] = useState<'todos' | 'planejamento' | 'em_andamento' | 'concluido'>('todos');

  const fetchProjetos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          entidades(nome),
          unidades:unidade_id(nome),
          contratos(numero)
        `)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!projetoToDelete) return;

    try {
      const { error } = await supabase
        .from('projetos')
        .delete()
        .eq('id', projetoToDelete.id);

      if (error) throw error;

      toast.success('Projeto excluído com sucesso');
      fetchProjetos();
      setDeleteDialogOpen(false);
      setProjetoToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const openDeleteDialog = (projeto: Projeto) => {
    setProjetoToDelete(projeto);
    setDeleteDialogOpen(true);
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planejamento: 'Planejamento',
      aprovado: 'Aprovado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      planejamento: 'bg-gray-100 text-gray-800',
      aprovado: 'bg-blue-100 text-blue-800',
      em_andamento: 'bg-yellow-100 text-yellow-800',
      concluido: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredProjetos = activeTab === 'todos'
    ? projetos
    : projetos.filter((p) => {
        if (activeTab === 'planejamento') return p.status === 'planejamento' || p.status === 'aprovado';
        if (activeTab === 'em_andamento') return p.status === 'em_andamento';
        if (activeTab === 'concluido') return p.status === 'concluido';
        return false;
      });

  const getCount = (filter: string) => {
    if (filter === 'planejamento') return projetos.filter(p => p.status === 'planejamento' || p.status === 'aprovado').length;
    if (filter === 'em_andamento') return projetos.filter(p => p.status === 'em_andamento').length;
    if (filter === 'concluido') return projetos.filter(p => p.status === 'concluido').length;
    return projetos.length;
  };

  const renderTable = (data: Projeto[]) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum projeto encontrado
          </h3>
          <p className="text-gray-500">
            {activeTab === 'todos'
              ? 'Comece criando seu primeiro projeto/evento'
              : `Nenhum projeto ${activeTab === 'planejamento' ? 'em planejamento' : activeTab.replace('_', ' ')}`}
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Evento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente/Local</TableHead>
              <TableHead>Orçamento</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((projeto) => (
              <TableRow key={projeto.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{projeto.nome}</div>
                    {projeto.responsavel && (
                      <div className="text-xs text-gray-500">
                        Resp: {projeto.responsavel}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{projeto.tipo || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <div>
                      {formatDate(projeto.data_inicio)}
                      {projeto.data_fim !== projeto.data_inicio && (
                        <> até {formatDate(projeto.data_fim)}</>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {projeto.entidades?.nome && (
                      <div className="font-medium">{projeto.entidades.nome}</div>
                    )}
                    {projeto.local && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {projeto.local}
                      </div>
                    )}
                    {!projeto.entidades?.nome && !projeto.local && '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">
                    {formatCurrency(projeto.orcamento)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getStatusBadgeColor(projeto.status)}>
                    {getStatusLabel(projeto.status)}
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
                      <DropdownMenuItem onClick={() => onView(projeto)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(projeto)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(projeto)}
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
    );
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todos">
            Todos ({getCount('todos')})
          </TabsTrigger>
          <TabsTrigger value="planejamento">
            Planejamento ({getCount('planejamento')})
          </TabsTrigger>
          <TabsTrigger value="em_andamento">
            Em Andamento ({getCount('em_andamento')})
          </TabsTrigger>
          <TabsTrigger value="concluido">
            Concluídos ({getCount('concluido')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4">
          {renderTable(filteredProjetos)}
        </TabsContent>
        <TabsContent value="planejamento" className="mt-4">
          {renderTable(filteredProjetos)}
        </TabsContent>
        <TabsContent value="em_andamento" className="mt-4">
          {renderTable(filteredProjetos)}
        </TabsContent>
        <TabsContent value="concluido" className="mt-4">
          {renderTable(filteredProjetos)}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o projeto "{projetoToDelete?.nome}"?
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
