import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Ticket {
  id: number;
  contrato_id: number;
  tipo_ingresso: string;
  preco: number;
  quantidade_disponivel: number;
  quantidade_vendida: number;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  contrato?: {
    id: number;
    nome_evento: string;
    data_evento: string;
    entidade?: {
      nome: string;
    };
  };
}

export interface VendaTicket {
  id: number;
  ticket_id: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  forma_pagamento: string;
  nome_comprador?: string;
  email_comprador?: string;
  telefone_comprador?: string;
  data_venda: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  ticket?: Ticket;
}

interface TicketStore {
  tickets: Ticket[];
  vendas: VendaTicket[];
  loading: boolean;
  error: string | null;

  // Tickets
  fetchTickets: () => Promise<void>;
  createTicket: (data: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'quantidade_vendida'>) => Promise<void>;
  updateTicket: (id: number, data: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: number) => Promise<void>;
  getTicketById: (id: number) => Promise<Ticket | null>;
  getTicketsByContract: (contratoId: number) => Ticket[];

  // Vendas
  fetchVendas: () => Promise<void>;
  createVenda: (data: Omit<VendaTicket, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateVenda: (id: number, data: Partial<VendaTicket>) => Promise<void>;
  deleteVenda: (id: number) => Promise<void>;
  getVendaById: (id: number) => Promise<VendaTicket | null>;
  getVendasByTicket: (ticketId: number) => VendaTicket[];
  getVendasByContract: (contratoId: number) => VendaTicket[];

  // Relatórios
  getTicketSalesReport: (contratoId?: number) => {
    totalTickets: number;
    totalVendidos: number;
    totalDisponivel: number;
    faturamentoTotal: number;
    vendasPorTipo: Record<string, { quantidade: number; faturamento: number }>;
  };
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  vendas: [],
  loading: false,
  error: null,

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          contrato:contratos(
            id,
            nome_evento,
            data_evento,
            entidade:entidades(nome)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ tickets: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createTicket: async (data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('tickets')
        .insert([{ ...data, quantidade_vendida: 0 }]);

      if (error) throw error;
      await get().fetchTickets();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTicket: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await get().fetchTickets();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTicket: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchTickets();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getTicketById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          contrato:contratos(
            id,
            nome_evento,
            data_evento,
            entidade:entidades(nome)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  getTicketsByContract: (contratoId) => {
    return get().tickets.filter(ticket => ticket.contrato_id === contratoId);
  },

  fetchVendas: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('bilheteria')
        .select(`
          *,
          ticket:tickets(
            id,
            tipo_ingresso,
            preco,
            contrato_id,
            contrato:contratos(
              id,
              nome_evento,
              data_evento,
              entidade:entidades(nome)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ vendas: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createVenda: async (data) => {
    set({ loading: true, error: null });
    try {
      // Verificar disponibilidade do ticket
      const ticket = await get().getTicketById(data.ticket_id);
      if (!ticket) {
        throw new Error('Ticket não encontrado');
      }

      const disponivel = ticket.quantidade_disponivel - ticket.quantidade_vendida;
      if (data.quantidade > disponivel) {
        throw new Error(`Apenas ${disponivel} ingressos disponíveis`);
      }

      // Criar venda
      const { error: vendaError } = await supabase
        .from('bilheteria')
        .insert([data]);

      if (vendaError) throw vendaError;

      // Atualizar quantidade vendida do ticket
      const novaQuantidadeVendida = ticket.quantidade_vendida + data.quantidade;
      await get().updateTicket(data.ticket_id, { 
        quantidade_vendida: novaQuantidadeVendida 
      });

      await get().fetchVendas();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateVenda: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('bilheteria')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await get().fetchVendas();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteVenda: async (id) => {
    set({ loading: true, error: null });
    try {
      // Buscar a venda para ajustar a quantidade vendida
      const venda = get().vendas.find(v => v.id === id);
      if (venda && venda.ticket) {
        const ticket = await get().getTicketById(venda.ticket_id);
        if (ticket) {
          const novaQuantidadeVendida = Math.max(0, ticket.quantidade_vendida - venda.quantidade);
          await get().updateTicket(venda.ticket_id, { 
            quantidade_vendida: novaQuantidadeVendida 
          });
        }
      }

      const { error } = await supabase
        .from('bilheteria')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchVendas();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getVendaById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('bilheteria')
        .select(`
          *,
          ticket:tickets(
            id,
            tipo_ingresso,
            preco,
            contrato_id,
            contrato:contratos(
              id,
              nome_evento,
              data_evento,
              entidade:entidades(nome)
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  getVendasByTicket: (ticketId) => {
    return get().vendas.filter(venda => venda.ticket_id === ticketId);
  },

  getVendasByContract: (contratoId) => {
    return get().vendas.filter(venda => 
      venda.ticket?.contrato_id === contratoId
    );
  },

  getTicketSalesReport: (contratoId) => {
    const { tickets, vendas } = get();
    
    const filteredTickets = contratoId 
      ? tickets.filter(t => t.contrato_id === contratoId)
      : tickets;
    
    const filteredVendas = contratoId
      ? vendas.filter(v => v.ticket?.contrato_id === contratoId)
      : vendas;

    const totalTickets = filteredTickets.reduce((sum, t) => sum + t.quantidade_disponivel, 0);
    const totalVendidos = filteredTickets.reduce((sum, t) => sum + t.quantidade_vendida, 0);
    const totalDisponivel = totalTickets - totalVendidos;
    
    const faturamentoTotal = filteredVendas
      .filter(v => v.status === 'confirmado')
      .reduce((sum, v) => sum + v.valor_total, 0);

    const vendasPorTipo: Record<string, { quantidade: number; faturamento: number }> = {};
    
    filteredVendas
      .filter(v => v.status === 'confirmado')
      .forEach(venda => {
        const tipo = venda.ticket?.tipo_ingresso || 'Desconhecido';
        if (!vendasPorTipo[tipo]) {
          vendasPorTipo[tipo] = { quantidade: 0, faturamento: 0 };
        }
        vendasPorTipo[tipo].quantidade += venda.quantidade;
        vendasPorTipo[tipo].faturamento += venda.valor_total;
      });

    return {
      totalTickets,
      totalVendidos,
      totalDisponivel,
      faturamentoTotal,
      vendasPorTipo,
    };
  },
}));