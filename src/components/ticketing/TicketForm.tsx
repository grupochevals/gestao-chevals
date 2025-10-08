import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTicketStore } from '@/stores/ticketStore';
import { useContractStore } from '@/stores/contractStore';
import { toast } from 'sonner';
import type { Ticket } from '@/stores/ticketStore';

const ticketSchema = z.object({
  contrato_id: z.number().min(1, 'Contrato é obrigatório'),
  tipo_ingresso: z.string().min(1, 'Tipo de ingresso é obrigatório'),
  preco: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  quantidade_disponivel: z.number().min(1, 'Quantidade deve ser maior que zero'),
  descricao: z.string().optional(),
  ativo: z.boolean(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  ticket?: Ticket | null;
  onClose: () => void;
}

export function TicketForm({ ticket, onClose }: TicketFormProps) {
  const { 
    loading, 
    createTicket, 
    updateTicket
  } = useTicketStore();
  const { contracts, fetchContracts } = useContractStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      contrato_id: 0,
      tipo_ingresso: '',
      preco: 0,
      quantidade_disponivel: 0,
      descricao: '',
      ativo: true,
    },
  });

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    if (ticket) {
      setValue('contrato_id', ticket.contrato_id);
      setValue('tipo_ingresso', ticket.tipo_ingresso);
      setValue('preco', ticket.preco);
      setValue('quantidade_disponivel', ticket.quantidade_disponivel);
      setValue('descricao', ticket.descricao || '');
      setValue('ativo', ticket.ativo);
    }
  }, [ticket, setValue]);

  const onSubmit = async (data: TicketFormData) => {
    try {
      if (ticket) {
        await updateTicket(ticket.id, data);
        toast.success('Tipo de ingresso atualizado com sucesso!');
      } else {
        await createTicket(data);
        toast.success('Tipo de ingresso criado com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar tipo de ingresso');
    }
  };

  const watchedContratoId = watch('contrato_id');
  const watchedAtivo = watch('ativo');

  const tiposIngressoComuns = [
    'Inteira',
    'Meia-entrada',
    'Estudante',
    'Idoso',
    'VIP',
    'Camarote',
    'Pista',
    'Arquibancada',
    'Cadeira',
    'Mesa',
    'Cortesia',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contrato_id">Evento/Contrato *</Label>
          <Select
            value={watchedContratoId?.toString() || ''}
            onValueChange={(value) => setValue('contrato_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um evento" />
            </SelectTrigger>
            <SelectContent>
              {contracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id.toString()}>
                  {contract.nome_evento} - {contract.entidade?.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contrato_id && (
            <p className="text-sm text-red-600">{errors.contrato_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_ingresso">Tipo de Ingresso *</Label>
          <div className="space-y-2">
            <Input
              id="tipo_ingresso"
              {...register('tipo_ingresso')}
              placeholder="Ex: Inteira, Meia-entrada, VIP..."
              list="tipos-ingresso"
            />
            <datalist id="tipos-ingresso">
              {tiposIngressoComuns.map((tipo) => (
                <option key={tipo} value={tipo} />
              ))}
            </datalist>
          </div>
          {errors.tipo_ingresso && (
            <p className="text-sm text-red-600">{errors.tipo_ingresso.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preco">Preço (R$) *</Label>
          <Input
            id="preco"
            type="number"
            step="0.01"
            {...register('preco', { valueAsNumber: true })}
            placeholder="0,00"
          />
          {errors.preco && (
            <p className="text-sm text-red-600">{errors.preco.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantidade_disponivel">Quantidade Disponível *</Label>
          <Input
            id="quantidade_disponivel"
            type="number"
            {...register('quantidade_disponivel', { valueAsNumber: true })}
            placeholder="100"
          />
          {errors.quantidade_disponivel && (
            <p className="text-sm text-red-600">{errors.quantidade_disponivel.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ativo">Status</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={watchedAtivo}
              onCheckedChange={(checked) => setValue('ativo', checked)}
            />
            <Label htmlFor="ativo" className="text-sm">
              {watchedAtivo ? 'Ativo' : 'Inativo'}
            </Label>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            {...register('descricao')}
            placeholder="Descrição adicional sobre o tipo de ingresso (opcional)"
            rows={3}
          />
        </div>
      </div>

      {/* Informações adicionais para edição */}
      {ticket && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-gray-700">Informações de Venda</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Quantidade Vendida:</span>
              <span className="ml-2 font-medium">{ticket.quantidade_vendida}</span>
            </div>
            <div>
              <span className="text-gray-500">Disponível:</span>
              <span className="ml-2 font-medium">
                {ticket.quantidade_disponivel - ticket.quantidade_vendida}
              </span>
            </div>
          </div>
          {ticket.quantidade_vendida > 0 && (
            <p className="text-xs text-yellow-600">
              ⚠️ Este ingresso já possui vendas. Altere a quantidade com cuidado.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Salvando...' : ticket ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}