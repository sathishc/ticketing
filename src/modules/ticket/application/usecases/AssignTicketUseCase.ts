import { Ticket, TicketStatus } from '../../domain/entities/Ticket';
import { TicketBusinessRules } from '../../domain/rules/TicketBusinessRules';
import { ITicketRepository } from '@shared/interfaces/repositories/ITicketRepository';
import { IAuditService } from '@shared/interfaces/services/IAuditService';
import { TicketAction } from '../../domain/entities/TicketHistory';

export interface AssignTicketRequest {
  agentId: string;
  assignedBy: string;
}

export class AssignTicketUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private auditService: IAuditService
  ) {}

  async execute(ticketId: string, request: AssignTicketRequest): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const validation = TicketBusinessRules.validateTicketAssignment(ticket, request.agentId);
    if (!validation.isValid) {
      throw new Error(`Assignment failed: ${validation.errors.join(', ')}`);
    }

    const updatedTicket: Ticket = {
      ...ticket,
      assignedAgentId: request.agentId,
      status: ticket.status === TicketStatus.NEW ? TicketStatus.ASSIGNED : ticket.status,
      updatedAt: new Date(),
    };

    const result = await this.ticketRepository.update(updatedTicket);

    await this.auditService.recordTicketAction(
      ticketId,
      TicketAction.ASSIGNED,
      request.assignedBy,
      { agentId: request.agentId }
    );

    return result;
  }
}
