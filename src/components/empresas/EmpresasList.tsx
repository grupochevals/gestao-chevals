import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
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

interface Empresa {
  id: string;
  nome: string;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  responsavel: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
}

interface Espaco {
  id: string;
  nome: string;
  descricao: string | null;
  localizacao: string | null;
  capacidade: number | null;
  valor_base: number | null;
  ativo: boolean;
}

interface EmpresasListProps {
  onEditEmpresa: (empresa: Empresa) => void;
  onViewEmpresa: (empresa: Empresa) => void;
  onAddEspaco: (empresaId: string) => void;
  onEditEspaco: (espaco: Espaco) => void;
  refreshTrigger?: number;
}

export function EmpresasList({
  onEditEmpresa,
  onViewEmpresa,
  onAddEspaco,
  onEditEspaco,
  refreshTrigger,
}: EmpresasListProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [espacosPorEmpresa, setEspacosPorEmpresa] = useState<Record<string, Espaco[]>>({});
  const [expandedEmpresas, setExpandedEmpresas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar empresas
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (empresasError) throw empresasError;
      setEmpresas(empresasData || []);

      // Buscar espaços
      const { data: espacosData, error: espacosError } = await supabase
        .from('unidades')
        .select('*')
        .order('nome');

      if (espacosError) throw espacosError;

      // Agrupar espaços por empresa
      const grouped = (espacosData || []).reduce((acc, espaco) => {
        const empresaId = espaco.empresa_id || 'sem-empresa';
        if (!acc[empresaId]) acc[empresaId] = [];
        acc[empresaId].push(espaco);
        return acc;
      }, {} as Record<string, Espaco[]>);

      setEspacosPorEmpresa(grouped);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const toggleExpanded = (empresaId: string) => {
    const newExpanded = new Set(expandedEmpresas);
    if (newExpanded.has(empresaId)) {
      newExpanded.delete(empresaId);
    } else {
      newExpanded.add(empresaId);
    }
    setExpandedEmpresas(newExpanded);
  };

  const handleDeleteEmpresa = async () => {
    if (!empresaToDelete) return;

    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', empresaToDelete.id);

      if (error) throw error;

      toast.success('Empresa excluída com sucesso');
      fetchData();
      setDeleteDialogOpen(false);
      setEmpresaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      toast.error('Erro ao excluir empresa');
    }
  };

  const openDeleteDialog = (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (empresas.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma empresa cadastrada
        </h3>
        <p className="text-gray-500">
          Comece criando sua primeira empresa
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {empresas.map((empresa) => {
          const isExpanded = expandedEmpresas.has(empresa.id);
          const espacos = espacosPorEmpresa[empresa.id] || [];

          return (
            <Card key={empresa.id} className="overflow-hidden">
              <div className="bg-gray-50 border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(empresa.id)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    <Building2 className="h-5 w-5 text-blue-600" />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{empresa.nome}</h3>
                        <Badge variant={empresa.ativo ? 'default' : 'secondary'}>
                          {empresa.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <Badge variant="outline">
                          {espacos.length} {espacos.length === 1 ? 'espaço' : 'espaços'}
                        </Badge>
                      </div>
                      {empresa.razao_social && (
                        <p className="text-sm text-gray-600">{empresa.razao_social}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddEspaco(empresa.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Espaço
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewEmpresa(empresa)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditEmpresa(empresa)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(empresa)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Info rápida */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  {empresa.cidade && empresa.estado && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {empresa.cidade}/{empresa.estado}
                    </div>
                  )}
                  {empresa.telefone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {empresa.telefone}
                    </div>
                  )}
                  {empresa.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {empresa.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de espaços */}
              {isExpanded && (
                <CardContent className="p-4">
                  {espacos.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum espaço cadastrado para esta empresa
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {espacos.map((espaco) => (
                        <div
                          key={espaco.id}
                          className="border rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
                          onClick={() => onEditEspaco(espaco)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{espaco.nome}</h4>
                            <Badge variant={espaco.ativo ? 'default' : 'secondary'} className="text-xs">
                              {espaco.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          {espaco.descricao && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {espaco.descricao}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Cap: {espaco.capacidade || '-'}</span>
                            {espaco.valor_base && (
                              <span className="font-medium text-green-600">
                                R$ {espaco.valor_base.toLocaleString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa "{empresaToDelete?.nome}"?
              Todos os espaços associados serão desvinculados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmpresa} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
