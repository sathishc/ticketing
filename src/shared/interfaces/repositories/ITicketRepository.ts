import { Ticket } from '@modules/ticket/domain/entities/Ticket';

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  customerId?: string;
  assignedAgentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITicketRepository {
  create(ticket: Ticket): Promise<Ticket>;
  findById(id: string): Promise<Ticket | null>;
  update(ticket: Ticket): Promise<Ticket>;
  findMany(filters: TicketFilters): Promise<PaginatedResult<Ticket>>;
  findByCustomerId(customerId: string): Promise<Ticket[]>;
  findByAssignedAgent(agentId: string): Promise<Ticket[]>;
}
