import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, CreditCard, Mail, Phone, User, FileText, MapPin, Building } from 'lucide-react';
import type { VendaTicket } from '@/stores/ticketStore';

interface VendaDetailsProps {
  venda: VendaTicket;
}

export function VendaDetails({ venda }: VendaDetailsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informações da Venda</span>
            <Badge className={getStatusColor(venda.status)}>
              {getStatusLabel(venda.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Data da Venda</p>
                <p className="font-medium">{formatDate(venda.data_venda)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Forma de Pagamento</p>
                <p className="font-medium">{venda.forma_pagamento}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Ingresso */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Ingresso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Evento</p>
              <p className="font-medium">{venda.ticket?.contrato?.nome_evento}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Tipo de Ingresso</p>
              <p className="font-medium">{venda.ticket?.tipo_ingresso}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Quantidade</p>
              <p className="font-medium">{venda.quantidade} ingresso(s)</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Valor Unitário</p>
              <p className="font-medium">{formatCurrency(venda.valor_unitario)}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Valor Total:</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(venda.valor_total)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Comprador */}
      {(venda.nome_comprador || venda.email_comprador || venda.telefone_comprador) && (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Comprador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {venda.nome_comprador && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium">{venda.nome_comprador}</p>
                  </div>
                </div>
              )}
              
              {venda.email_comprador && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{venda.email_comprador}</p>
                  </div>
                </div>
              )}
              
              {venda.telefone_comprador && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium">{venda.telefone_comprador}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Evento/Contrato */}
      {venda.ticket?.contrato && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Data do Evento</p>
                  <p className="font-medium">
                    {formatDate(venda.ticket.contrato.data_evento)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{venda.ticket.contrato.entidade?.nome}</p>
                </div>
              </div>
              
              {venda.ticket.contrato.unidade && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Local</p>
                    <p className="font-medium">{venda.ticket.contrato.unidade.nome}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Valor do Contrato</p>
                  <p className="font-medium">
                    {formatCurrency(venda.ticket.contrato.valor_locacao)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {venda.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Observações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{venda.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Quantidade:</span>
              <span>{venda.quantidade} ingresso(s)</span>
            </div>
            <div className="flex justify-between">
              <span>Valor Unitário:</span>
              <span>{formatCurrency(venda.valor_unitario)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(venda.valor_total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}