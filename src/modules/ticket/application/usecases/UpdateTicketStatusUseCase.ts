import { Ticket, TicketStatus } from '../../domain/entities/Ticket';
import { TicketBusinessRules } from '../../domain/rules/TicketBusinessRules';
import { ITicketRepository } from '@shared/interfaces/repositories/ITicketRepository';
import { IAuditService } from '@shared/interfaces/services/IAuditService';
import { TicketAction } from '../../domain/entities/TicketHistory';

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
  comment?: string;
  userId: string;
}

export class UpdateTicketStatusUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private auditService: IAuditService
  ) {}

  async execute(ticketId: string, request: UpdateTicketStatusRequest): Promise<Ticket> {
    // Find existing ticket
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Validate status transition
    if (!TicketBusinessRules.validateStatusTransition(ticket.status, request.status)) {
      throw new Error(`Invalid status transition from ${ticket.status} to ${request.status}`);
    }

    const previousStatus = ticket.status;
    
    // Update ticket
    const updatedTicket: Ticket = {
      ...ticket,
      status: request.status,
      updatedAt: new Date(),
      resolvedAt: request.status === TicketStatus.RESOLVED ? new Date() : ticket.resolvedAt,
      closedAt: request.status === TicketStatus.CLOSED ? new Date() : ticket.closedAt,
    };

    const result = await this.ticketRepository.update(updatedTicket);

    // Record audit trail
    await this.auditService.recordTicketAction(
      ticketId,
      TicketAction.STATUS_CHANGED,
      request.userId,
      {
        previousValue: previousStatus,
        newValue: request.status,
        comment: request.comment
      }
    );

    return result;
  }
}
