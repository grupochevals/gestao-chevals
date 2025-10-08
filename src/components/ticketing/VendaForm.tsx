import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTicketStore } from '@/stores/ticketStore';
import { toast } from 'sonner';
import type { VendaTicket, Ticket } from '@/stores/ticketStore';

const vendaSchema = z.object({
  ticket_id: z.number().min(1, 'Tipo de ingresso é obrigatório'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
  valor_unitario: z.number().min(0, 'Valor unitário deve ser maior ou igual a zero'),
  valor_total: z.number().min(0, 'Valor total deve ser maior ou igual a zero'),
  forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  nome_comprador: z.string().optional(),
  email_comprador: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone_comprador: z.string().optional(),
  data_venda: z.string().min(1, 'Data da venda é obrigatória'),
  status: z.enum(['pendente', 'confirmado', 'cancelado']),
  observacoes: z.string().optional(),
});

type VendaFormData = z.infer<typeof vendaSchema>;

interface VendaFormProps {
  venda?: VendaTicket | null;
  onClose: () => void;
}

export function VendaForm({ venda, onClose }: VendaFormProps) {
  const { 
    tickets,
    loading, 
    createVenda, 
    updateVenda,
    fetchTickets
  } = useTicketStore();
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      ticket_id: 0,
      quantidade: 1,
      valor_unitario: 0,
      valor_total: 0,
      forma_pagamento: '',
      nome_comprador: '',
      email_comprador: '',
      telefone_comprador: '',
      data_venda: new Date().toISOString().split('T')[0],
      status: 'pendente',
      observacoes: '',
    },
  });

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (venda) {
      setValue('ticket_id', venda.ticket_id);
      setValue('quantidade', venda.quantidade);
      setValue('valor_unitario', venda.valor_unitario);
      setValue('valor_total', venda.valor_total);
      setValue('forma_pagamento', venda.forma_pagamento);
      setValue('nome_comprador', venda.nome_comprador || '');
      setValue('email_comprador', venda.email_comprador || '');
      setValue('telefone_comprador', venda.telefone_comprador || '');
      setValue('data_venda', venda.data_venda);
      setValue('status', venda.status);
      setValue('observacoes', venda.observacoes || '');
      
      const ticket = tickets.find(t => t.id === venda.ticket_id);
      setSelectedTicket(ticket || null);
    }
  }, [venda, setValue, tickets]);

  const watchedTicketId = watch('ticket_id');
  const watchedQuantidade = watch('quantidade');
  const watchedValorUnitario = watch('valor_unitario');
  const watchedStatus = watch('status');

  // Atualizar ticket selecionado e valor unitário quando o ticket muda
  useEffect(() => {
    if (watchedTicketId) {
      const ticket = tickets.find(t => t.id === watchedTicketId);
      setSelectedTicket(ticket || null);
      if (ticket && !venda) {
        setValue('valor_unitario', ticket.preco);
      }
    }
  }, [watchedTicketId, tickets, setValue, venda]);

  // Calcular valor total automaticamente
  useEffect(() => {
    const total = watchedQuantidade * watchedValorUnitario;
    setValue('valor_total', total);
  }, [watchedQuantidade, watchedValorUnitario, setValue]);

  const onSubmit = async (data: VendaFormData) => {
    try {
      // Verificar disponibilidade
      if (selectedTicket) {
        const disponivel = selectedTicket.quantidade_disponivel - selectedTicket.quantidade_vendida;
        if (!venda && data.quantidade > disponivel) {
          toast.error(`Apenas ${disponivel} ingressos disponíveis`);
          return;
        }
      }

      if (venda) {
        await updateVenda(venda.id, data);
        toast.success('Venda atualizada com sucesso!');
      } else {
        await createVenda(data);
        toast.success('Venda criada com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar venda');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formasPagamento = [
    'Dinheiro',
    'Cartão de Crédito',
    'Cartão de Débito',
    'PIX',
    'Transferência Bancária',
    'Boleto',
    'Cortesia',
  ];

  const ticketsAtivos = tickets.filter(t => t.ativo);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ticket_id">Tipo de Ingresso *</Label>
          <Select
            value={watchedTicketId?.toString() || ''}
            onValueChange={(value) => setValue('ticket_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tipo de ingresso" />
            </SelectTrigger>
            <SelectContent>
              {ticketsAtivos.map((ticket) => {
                const disponivel = ticket.quantidade_disponivel - ticket.quantidade_vendida;
                return (
                  <SelectItem 
                    key={ticket.id} 
                    value={ticket.id.toString()}
                    disabled={disponivel === 0}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>
                        {ticket.contrato?.nome_evento} - {ticket.tipo_ingresso}
                      </span>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="outline">
                          {formatCurrency(ticket.preco)}
                        </Badge>
                        <Badge variant={disponivel > 0 ? "default" : "secondary"}>
                          {disponivel} disponível
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.ticket_id && (
            <p className="text-sm text-red-600">{errors.ticket_id.message}</p>
          )}
        </div>

        {/* Informações do Ticket Selecionado */}
        {selectedTicket && (
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Informações do Ingresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Evento:</span>
                    <p className="font-medium">{selectedTicket.contrato?.nome_evento}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Preço:</span>
                    <p className="font-medium">{formatCurrency(selectedTicket.preco)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Disponível:</span>
                    <p className="font-medium">
                      {selectedTicket.quantidade_disponivel - selectedTicket.quantidade_vendida}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <p className="font-medium">{selectedTicket.quantidade_disponivel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade *</Label>
          <Input
            id="quantidade"
            type="number"
            min="1"
            max={selectedTicket ? selectedTicket.quantidade_disponivel - selectedTicket.quantidade_vendida : undefined}
            {...register('quantidade', { valueAsNumber: true })}
          />
          {errors.quantidade && (
            <p className="text-sm text-red-600">{errors.quantidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_unitario">Valor Unitário (R$) *</Label>
          <Input
            id="valor_unitario"
            type="number"
            step="0.01"
            {...register('valor_unitario', { valueAsNumber: true })}
          />
          {errors.valor_unitario && (
            <p className="text-sm text-red-600">{errors.valor_unitario.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_total">Valor Total (R$)</Label>
          <Input
            id="valor_total"
            type="number"
            step="0.01"
            {...register('valor_total', { valueAsNumber: true })}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
          <Select
            value={watch('forma_pagamento')}
            onValueChange={(value) => setValue('forma_pagamento', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              {formasPagamento.map((forma) => (
                <SelectItem key={forma} value={forma}>
                  {forma}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.forma_pagamento && (
            <p className="text-sm text-red-600">{errors.forma_pagamento.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_venda">Data da Venda *</Label>
          <Input
            id="data_venda"
            type="date"
            {...register('data_venda')}
          />
          {errors.data_venda && (
            <p className="text-sm text-red-600">{errors.data_venda.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={watchedStatus}
            onValueChange={(value) => setValue('status', value as 'pendente' | 'confirmado' | 'cancelado')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome_comprador">Nome do Comprador</Label>
          <Input
            id="nome_comprador"
            {...register('nome_comprador')}
            placeholder="Nome completo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_comprador">Email do Comprador</Label>
          <Input
            id="email_comprador"
            type="email"
            {...register('email_comprador')}
            placeholder="email@exemplo.com"
          />
          {errors.email_comprador && (
            <p className="text-sm text-red-600">{errors.email_comprador.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone_comprador">Telefone do Comprador</Label>
          <Input
            id="telefone_comprador"
            {...register('telefone_comprador')}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            {...register('observacoes')}
            placeholder="Observações sobre a venda"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Salvando...' : venda ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}