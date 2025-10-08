import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, FileText, DollarSign, User, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
}

interface ProjetoDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto: Projeto | null;
}

export function ProjetoDetails({
  open,
  onOpenChange,
  projeto,
}: ProjetoDetailsProps) {
  const [entidade, setEntidade] = useState<any>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [espaco, setEspaco] = useState<any>(null);
  const [contrato, setContrato] = useState<any>(null);

  useEffect(() => {
    if (projeto && open) {
      fetchRelatedData();
    }
  }, [projeto, open]);

  const fetchRelatedData = async () => {
    if (!projeto) return;

    try {
      if (projeto.entidade_id) {
        const { data } = await supabase
          .from('entidades')
          .select('nome')
          .eq('id', projeto.entidade_id)
          .single();
        setEntidade(data);
      }

      if (projeto.unidade_id) {
        const { data } = await supabase
          .from('empresas')
          .select('nome')
          .eq('id', projeto.unidade_id)
          .single();
        setEmpresa(data);
      }

      if (projeto.espaco_id) {
        const { data } = await supabase
          .from('unidades')
          .select('nome')
          .eq('id', projeto.espaco_id)
          .single();
        setEspaco(data);
      }

      if (projeto.contrato_id) {
        const { data } = await supabase
          .from('contratos')
          .select('numero')
          .eq('id', projeto.contrato_id)
          .single();
        setContrato(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };

  if (!projeto) return null;

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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{projeto.nome}</DialogTitle>
              <DialogDescription className="mt-2">
                Informações detalhadas do projeto/evento
              </DialogDescription>
            </div>
            <Badge className={getStatusBadgeColor(projeto.status)}>
              {getStatusLabel(projeto.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Informações Básicas */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informações Básicas
            </h3>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Tipo de Evento</p>
                <p className="font-medium">{projeto.tipo || 'Não especificado'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Responsável</p>
                <p className="font-medium">{projeto.responsavel || 'Não informado'}</p>
              </div>
            </div>
            {projeto.descricao && (
              <div>
                <p className="text-gray-500 mb-1 text-sm">Descrição</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {projeto.descricao}
                </p>
              </div>
            )}
          </div>

          {/* Datas e Orçamento */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datas e Orçamento
            </h3>
            <Separator />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Data de Início</p>
                <p className="font-medium">{formatDate(projeto.data_inicio)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Data de Término</p>
                <p className="font-medium">{formatDate(projeto.data_fim)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Orçamento Previsto</p>
                <p className="font-medium flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-gray-400" />
                  {formatCurrency(projeto.orcamento)}
                </p>
              </div>
            </div>
          </div>

          {/* Cliente e Local */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Cliente e Local
            </h3>
            <Separator />
            <div className="space-y-3 text-sm">
              {entidade && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Cliente</p>
                    <p className="font-medium">{entidade.nome}</p>
                  </div>
                </div>
              )}
              {empresa && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Empresa/Unidade</p>
                    <p className="font-medium">
                      {empresa.nome}
                      {espaco && ` - ${espaco.nome}`}
                    </p>
                  </div>
                </div>
              )}
              {projeto.local && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Local</p>
                    <p className="font-medium">{projeto.local}</p>
                  </div>
                </div>
              )}
              {contrato && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Contrato Associado</p>
                  <Badge variant="outline">{contrato.numero}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {projeto.observacoes && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Observações</h3>
              <Separator />
              <div className="text-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {projeto.observacoes}
                </p>
              </div>
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informações do Sistema
            </h3>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Data de Cadastro</p>
                <p className="font-medium">{formatDateTime(projeto.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">ID</p>
                <p className="font-mono text-xs text-gray-600">
                  {projeto.id.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
