import { Ticket } from '../../domain/entities/Ticket';
import { ITicketRepository, TicketFilters, PaginatedResult } from '@shared/interfaces/repositories/ITicketRepository';

export class GetTicketUseCase {
  constructor(private ticketRepository: ITicketRepository) {}

  async execute(ticketId: string): Promise<Ticket | null> {
    return await this.ticketRepository.findById(ticketId);
  }

  async executeMany(filters: TicketFilters): Promise<PaginatedResult<Ticket>> {
    return await this.ticketRepository.findMany(filters);
  }

  async executeByCustomer(customerId: string): Promise<Ticket[]> {
    return await this.ticketRepository.findByCustomerId(customerId);
  }

  async executeByAgent(agentId: string): Promise<Ticket[]> {
    return await this.ticketRepository.findByAssignedAgent(agentId);
  }
}
