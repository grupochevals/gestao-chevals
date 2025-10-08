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
import { Card, CardContent } from '@/components/ui/card';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
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
import { CategoriaFormDialog } from './CategoriaFormDialog';

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'ambos';
  descricao: string | null;
  cor: string;
  ativo: boolean;
  created_at: string;
}

interface CategoriasListProps {
  onUpdate?: () => void;
  refreshTrigger?: number;
}

export function CategoriasList({ onUpdate, refreshTrigger }: CategoriasListProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .order('tipo')
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!categoriaToDelete) return;

    try {
      const { error } = await supabase
        .from('categorias_financeiras')
        .delete()
        .eq('id', categoriaToDelete.id);

      if (error) throw error;

      toast.success('Categoria excluída com sucesso');
      fetchCategorias();
      onUpdate?.();
      setDeleteDialogOpen(false);
      setCategoriaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const openDeleteDialog = (categoria: Categoria) => {
    setCategoriaToDelete(categoria);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (categoria: Categoria) => {
    setCategoriaToEdit(categoria);
    setFormDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCategoriaToEdit(null);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    fetchCategorias();
    onUpdate?.();
  };

  const getTipoBadgeColor = (tipo: string) => {
    const colors = {
      receita: 'bg-green-100 text-green-800',
      despesa: 'bg-red-100 text-red-800',
      ambos: 'bg-blue-100 text-blue-800',
    };
    return colors[tipo as keyof typeof colors] || '';
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      receita: 'Receita',
      despesa: 'Despesa',
      ambos: 'Ambos',
    };
    return labels[tipo as keyof typeof labels] || tipo;
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

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gerenciar Categorias</h3>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {categorias.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma categoria cadastrada
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando sua primeira categoria
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell className="font-medium">{categoria.nome}</TableCell>
                  <TableCell>
                    <Badge className={getTipoBadgeColor(categoria.tipo)}>
                      {getTipoLabel(categoria.tipo)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md text-sm text-gray-600">
                      {categoria.descricao || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      <span className="text-xs text-gray-500">{categoria.cor}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={categoria.ativo ? 'default' : 'secondary'}
                    >
                      {categoria.ativo ? 'Ativo' : 'Inativo'}
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
                        <DropdownMenuItem onClick={() => openEditDialog(categoria)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(categoria)}
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
      )}

      <CategoriaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        categoria={categoriaToEdit}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{categoriaToDelete?.nome}"?
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
