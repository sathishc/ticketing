import { TicketHistory } from '@modules/ticket/domain/entities/TicketHistory';

export interface ITicketHistoryRepository {
  create(historyEntry: TicketHistory): Promise<TicketHistory>;
  findByTicketId(ticketId: string): Promise<TicketHistory[]>;
}
