import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  Eye
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

interface Unidade {
  id: string;
  nome: string;
  descricao: string | null;
  localizacao: string | null;
  capacidade: number | null;
  valor_base: number | null;
  ativo: boolean;
  created_at: string;
}

interface UnitsListProps {
  onEdit: (unit: Unidade) => void;
  onView: (unit: Unidade) => void;
  refreshTrigger?: number;
}

export function UnitsList({ onEdit, onView, refreshTrigger }: UnitsListProps) {
  const [units, setUnits] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unidade | null>(null);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      toast.error('Erro ao carregar unidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!unitToDelete) return;

    try {
      const { error } = await supabase
        .from('unidades')
        .delete()
        .eq('id', unitToDelete.id);

      if (error) throw error;

      toast.success('Unidade excluída com sucesso');
      fetchUnits();
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      toast.error('Erro ao excluir unidade');
    }
  };

  const openDeleteDialog = (unit: Unidade) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma unidade cadastrada
        </h3>
        <p className="text-gray-500">
          Comece criando sua primeira unidade
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
              <TableHead>Nome</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead className="text-center">Capacidade</TableHead>
              <TableHead className="text-right">Valor Base</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{unit.nome}</div>
                    {unit.descricao && (
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {unit.descricao}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {unit.localizacao || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center text-sm">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    {unit.capacidade || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end text-sm font-medium">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    {formatCurrency(unit.valor_base)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={unit.ativo ? 'default' : 'secondary'}>
                    {unit.ativo ? 'Ativo' : 'Inativo'}
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
                      <DropdownMenuItem onClick={() => onView(unit)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(unit)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(unit)}
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
              Tem certeza que deseja excluir a unidade "{unitToDelete?.nome}"?
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
