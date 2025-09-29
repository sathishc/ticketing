import { TicketHistory, TicketAction } from '@modules/ticket/domain/entities/TicketHistory';
import { ITicketHistoryRepository } from '@shared/interfaces/repositories/ITicketHistoryRepository';
import { IAuditService } from '@shared/interfaces/services/IAuditService';

export class AuditService implements IAuditService {
  constructor(private historyRepository: ITicketHistoryRepository) {}

  async recordTicketAction(
    ticketId: string,
    action: TicketAction,
    userId: string,
    details: any
  ): Promise<void> {
    const historyEntry: TicketHistory = {
      id: '', // Will be set by repository
      ticketId,
      userId,
      action,
      previousValue: details?.previousValue,
      newValue: details?.newValue,
      comment: details?.comment,
      timestamp: new Date(),
    };

    await this.historyRepository.create(historyEntry);
  }
}
