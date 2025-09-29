import { Ticket } from '../../domain/entities/Ticket';
import { ITicketRepository, TicketFilters, PaginatedResult } from '@shared/interfaces/repositories/ITicketRepository';
import { v4 as uuidv4 } from 'uuid';

export class MockTicketRepository implements ITicketRepository {
  private tickets: Map<string, Ticket> = new Map();

  async create(ticket: Ticket): Promise<Ticket> {
    const newTicket: Ticket = {
      ...ticket,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tickets.set(newTicket.id, newTicket);
    return newTicket;
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.tickets.get(id) || null;
  }

  async update(ticket: Ticket): Promise<Ticket> {
    const updatedTicket = {
      ...ticket,
      updatedAt: new Date(),
    };

    this.tickets.set(ticket.id, updatedTicket);
    return updatedTicket;
  }

  async findMany(filters: TicketFilters): Promise<PaginatedResult<Ticket>> {
    let items = Array.from(this.tickets.values());

    // Apply filters
    if (filters.status) {
      items = items.filter(ticket => ticket.status === filters.status);
    }
    if (filters.priority) {
      items = items.filter(ticket => ticket.priority === filters.priority);
    }
    if (filters.category) {
      items = items.filter(ticket => ticket.category === filters.category);
    }
    if (filters.customerId) {
      items = items.filter(ticket => ticket.customerId === filters.customerId);
    }
    if (filters.assignedAgentId) {
      items = items.filter(ticket => ticket.assignedAgentId === filters.assignedAgentId);
    }

    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    };
  }

  async findByCustomerId(customerId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.customerId === customerId);
  }

  async findByAssignedAgent(agentId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.assignedAgentId === agentId);
  }
}
