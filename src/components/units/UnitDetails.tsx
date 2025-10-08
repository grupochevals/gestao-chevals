import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, DollarSign, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Unidade {
  id: string;
  nome: string;
  descricao: string | null;
  localizacao: string | null;
  capacidade: number | null;
  valor_base: number | null;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}

interface UnitDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unidade | null;
}

export function UnitDetails({ open, onOpenChange, unit }: UnitDetailsProps) {
  if (!unit) return null;

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{unit.nome}</DialogTitle>
              <DialogDescription className="mt-2">
                Detalhes completos da unidade
              </DialogDescription>
            </div>
            <Badge variant={unit.ativo ? 'default' : 'secondary'}>
              {unit.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Descrição */}
          {unit.descricao && (
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <Info className="h-4 w-4 mr-2" />
                Descrição
              </div>
              <p className="text-sm text-gray-600 pl-6">{unit.descricao}</p>
            </div>
          )}

          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Localização */}
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 mr-2" />
                Localização
              </div>
              <p className="text-sm text-gray-900 pl-6">
                {unit.localizacao || 'Não informada'}
              </p>
            </div>

            {/* Capacidade */}
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <Users className="h-4 w-4 mr-2" />
                Capacidade
              </div>
              <p className="text-sm text-gray-900 pl-6">
                {unit.capacidade ? `${unit.capacidade} pessoas` : 'Não informada'}
              </p>
            </div>

            {/* Valor Base */}
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Valor Base
              </div>
              <p className="text-sm text-gray-900 pl-6 font-semibold">
                {formatCurrency(unit.valor_base)}
              </p>
            </div>

            {/* Data de Criação */}
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 mr-2" />
                Data de Criação
              </div>
              <p className="text-sm text-gray-900 pl-6">
                {formatDate(unit.created_at)}
              </p>
            </div>
          </div>

          {/* Última Atualização */}
          {unit.updated_at && (
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Última atualização: {formatDate(unit.updated_at)}
              </p>
            </div>
          )}

          {/* Estatísticas (placeholder para futuras features) */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Estatísticas</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Contratos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Eventos Realizados</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Taxa de Ocupação</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
