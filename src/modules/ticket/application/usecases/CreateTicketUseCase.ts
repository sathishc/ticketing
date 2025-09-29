import { Ticket, TicketStatus, TicketPriority } from '../../domain/entities/Ticket';
import { TicketBusinessRules } from '../../domain/rules/TicketBusinessRules';
import { ITicketRepository } from '@shared/interfaces/repositories/ITicketRepository';
import { IAuditService } from '@shared/interfaces/services/IAuditService';
import { TicketAction } from '../../domain/entities/TicketHistory';

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  customerId: string;
}

export class CreateTicketUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private auditService: IAuditService
  ) {}

  async execute(request: CreateTicketRequest): Promise<Ticket> {
    // Validate ticket data
    const validation = TicketBusinessRules.validateTicketCreation(request);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Create ticket
    const ticket: Ticket = {
      id: '', // Will be set by repository
      title: request.title.trim(),
      description: request.description.trim(),
      status: TicketStatus.NEW,
      priority: request.priority,
      category: request.category.trim(),
      customerId: request.customerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdTicket = await this.ticketRepository.create(ticket);

    // Record audit trail
    await this.auditService.recordTicketAction(
      createdTicket.id,
      TicketAction.CREATED,
      request.customerId,
      { title: request.title, priority: request.priority }
    );

    return createdTicket;
  }
}
