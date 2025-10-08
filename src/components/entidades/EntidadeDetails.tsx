import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, FileText, Calendar } from 'lucide-react';

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

interface EntidadeDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entidade: Entidade | null;
}

export function EntidadeDetails({
  open,
  onOpenChange,
  entidade,
}: EntidadeDetailsProps) {
  if (!entidade) return null;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tipos = getTipos(entidade);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{entidade.nome}</DialogTitle>
              <DialogDescription className="mt-2">
                Informações detalhadas da entidade
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {tipos.map((tipo) => (
                <Badge key={tipo} className={getTipoBadgeColor(tipo)}>
                  {getTipoLabel(tipo)}
                </Badge>
              ))}
              <Badge variant={entidade.ativo ? 'default' : 'secondary'}>
                {entidade.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
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
                <p className="text-gray-500 mb-1">Documento</p>
                <p className="font-medium">
                  {entidade.documento || 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Tipos</p>
                <div className="flex flex-wrap gap-1">
                  {tipos.map((tipo) => (
                    <span key={tipo} className="font-medium">
                      {getTipoLabel(tipo)}
                      {tipos.indexOf(tipo) < tipos.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contato
            </h3>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">E-mail</p>
                  <p className="font-medium">
                    {entidade.email || 'Não informado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs">Telefone</p>
                  <p className="font-medium">
                    {entidade.telefone || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </h3>
            <Separator />
            <div className="text-sm">
              <p className="text-gray-700 leading-relaxed">
                {entidade.endereco || 'Não informado'}
              </p>
            </div>
          </div>

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
                <p className="font-medium">{formatDate(entidade.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">ID</p>
                <p className="font-mono text-xs text-gray-600">
                  {entidade.id.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
