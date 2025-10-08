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
  Store,
  Globe,
  Phone,
  Users,
  Gift,
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

interface CanalVenda {
  id: string;
  nome: string;
  tipo: 'presencial' | 'online' | 'telefone' | 'terceiro' | 'cortesia';
  responsavel: string | null;
  contato: string | null;
  taxa_servico: number;
  ativo: boolean;
  observacoes: string | null;
  created_at: string;
}

interface CanaisListProps {
  onEdit: (canal: CanalVenda) => void;
  refreshTrigger?: number;
}

export function BilheteriaCanaisList({ onEdit, refreshTrigger }: CanaisListProps) {
  const [canais, setCanais] = useState<CanalVenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [canalToDelete, setCanalToDelete] = useState<CanalVenda | null>(null);

  const fetchCanais = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('canais_venda')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCanais(data || []);
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
      toast.error('Erro ao carregar canais de venda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanais();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!canalToDelete) return;

    try {
      const { error } = await supabase
        .from('canais_venda')
        .delete()
        .eq('id', canalToDelete.id);

      if (error) throw error;

      toast.success('Canal excluído com sucesso');
      fetchCanais();
      setDeleteDialogOpen(false);
      setCanalToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir canal:', error);
      toast.error('Erro ao excluir canal');
    }
  };

  const openDeleteDialog = (canal: CanalVenda) => {
    setCanalToDelete(canal);
    setDeleteDialogOpen(true);
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      presencial: 'Presencial',
      online: 'Online',
      telefone: 'Telefone',
      terceiro: 'Terceiro',
      cortesia: 'Cortesia',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      presencial: Store,
      online: Globe,
      telefone: Phone,
      terceiro: Users,
      cortesia: Gift,
    };
    const Icon = icons[tipo as keyof typeof icons] || Store;
    return <Icon className="h-4 w-4" />;
  };

  const getTipoBadgeColor = (tipo: string) => {
    const colors = {
      presencial: 'bg-blue-100 text-blue-800',
      online: 'bg-purple-100 text-purple-800',
      telefone: 'bg-green-100 text-green-800',
      terceiro: 'bg-orange-100 text-orange-800',
      cortesia: 'bg-pink-100 text-pink-800',
    };
    return colors[tipo as keyof typeof colors] || '';
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

  if (canais.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum canal cadastrado
        </h3>
        <p className="text-gray-500">
          Comece criando seu primeiro canal de venda
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
              <TableHead>Nome do Canal</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Taxa de Serviço</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canais.map((canal) => (
              <TableRow key={canal.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getTipoIcon(canal.tipo)}
                    <span>{canal.nome}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTipoBadgeColor(canal.tipo)}>
                    {getTipoLabel(canal.tipo)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{canal.responsavel || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{canal.contato || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">
                    {canal.taxa_servico}%
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={canal.ativo ? 'default' : 'secondary'}>
                    {canal.ativo ? 'Ativo' : 'Inativo'}
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
                      <DropdownMenuItem onClick={() => onEdit(canal)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(canal)}
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
              Tem certeza que deseja excluir o canal "{canalToDelete?.nome}"?
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
