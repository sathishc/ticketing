import { TicketAction } from '@modules/ticket/domain/entities/TicketHistory';

export interface IAuditService {
  recordTicketAction(
    ticketId: string,
    action: TicketAction,
    userId: string,
    details: any
  ): Promise<void>;
}
