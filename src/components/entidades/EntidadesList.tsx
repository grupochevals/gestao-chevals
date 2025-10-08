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
  Mail,
  Phone,
  FileText,
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

interface EntidadesListProps {
  onEdit: (entidade: Entidade) => void;
  onView: (entidade: Entidade) => void;
  refreshTrigger?: number;
}

export function EntidadesList({ onEdit, onView, refreshTrigger }: EntidadesListProps) {
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entidadeToDelete, setEntidadeToDelete] = useState<Entidade | null>(null);
  const [activeTab, setActiveTab] = useState<'todos' | 'cliente' | 'parceiro' | 'fornecedor'>('todos');

  const fetchEntidades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entidades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntidades(data || []);
    } catch (error) {
      console.error('Erro ao carregar entidades:', error);
      toast.error('Erro ao carregar entidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntidades();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!entidadeToDelete) return;

    try {
      const { error } = await supabase
        .from('entidades')
        .delete()
        .eq('id', entidadeToDelete.id);

      if (error) throw error;

      toast.success('Entidade excluída com sucesso');
      fetchEntidades();
      setDeleteDialogOpen(false);
      setEntidadeToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir entidade:', error);
      toast.error('Erro ao excluir entidade');
    }
  };

  const openDeleteDialog = (entidade: Entidade) => {
    setEntidadeToDelete(entidade);
    setDeleteDialogOpen(true);
  };

  const getTipos = (entidade: Entidade): string[] => {
    const tipos: string[] = [];
    if (entidade.e_cliente) tipos.push('cliente');
    if (entidade.e_parceiro) tipos.push('parceiro');
    if (entidade.e_fornecedor) tipos.push('fornecedor');
    return tipos;
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      cliente: 'Cliente',
      parceiro: 'Parceiro',
      fornecedor: 'Fornecedor',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoBadgeColor = (tipo: string) => {
    const colors = {
      cliente: 'bg-blue-100 text-blue-800',
      parceiro: 'bg-green-100 text-green-800',
      fornecedor: 'bg-orange-100 text-orange-800',
    };
    return colors[tipo as keyof typeof colors] || '';
  };

  const filteredEntidades = activeTab === 'todos'
    ? entidades
    : entidades.filter((e) => {
        if (activeTab === 'cliente') return e.e_cliente;
        if (activeTab === 'parceiro') return e.e_parceiro;
        if (activeTab === 'fornecedor') return e.e_fornecedor;
        return false;
      });

  const getCount = (tipo: 'cliente' | 'parceiro' | 'fornecedor') => {
    if (tipo === 'cliente') return entidades.filter(e => e.e_cliente).length;
    if (tipo === 'parceiro') return entidades.filter(e => e.e_parceiro).length;
    if (tipo === 'fornecedor') return entidades.filter(e => e.e_fornecedor).length;
    return 0;
  };

  const renderTable = (data: Entidade[]) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma entidade encontrada
          </h3>
          <p className="text-gray-500">
            {activeTab === 'todos'
              ? 'Comece criando sua primeira entidade'
              : `Nenhum ${getTipoLabel(activeTab).toLowerCase()} cadastrado`}
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo(s)</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entidade) => {
              const tipos = getTipos(entidade);
              return (
                <TableRow key={entidade.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{entidade.nome}</div>
                      {entidade.endereco && (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {entidade.endereco}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tipos.map((tipo) => (
                        <Badge key={tipo} className={getTipoBadgeColor(tipo)}>
                          {getTipoLabel(tipo)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{entidade.documento || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      {entidade.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {entidade.email}
                        </div>
                      )}
                      {entidade.telefone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {entidade.telefone}
                        </div>
                      )}
                      {!entidade.email && !entidade.telefone && '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={entidade.ativo ? 'default' : 'secondary'}>
                      {entidade.ativo ? 'Ativo' : 'Inativo'}
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
                        <DropdownMenuItem onClick={() => onView(entidade)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(entidade)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(entidade)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
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
            Todos ({entidades.length})
          </TabsTrigger>
          <TabsTrigger value="cliente">
            Clientes ({getCount('cliente')})
          </TabsTrigger>
          <TabsTrigger value="parceiro">
            Parceiros ({getCount('parceiro')})
          </TabsTrigger>
          <TabsTrigger value="fornecedor">
            Fornecedores ({getCount('fornecedor')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4">
          {renderTable(filteredEntidades)}
        </TabsContent>
        <TabsContent value="cliente" className="mt-4">
          {renderTable(filteredEntidades)}
        </TabsContent>
        <TabsContent value="parceiro" className="mt-4">
          {renderTable(filteredEntidades)}
        </TabsContent>
        <TabsContent value="fornecedor" className="mt-4">
          {renderTable(filteredEntidades)}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{entidadeToDelete?.nome}"?
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
