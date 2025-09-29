import { TicketHistory } from '../../domain/entities/TicketHistory';
import { ITicketHistoryRepository } from '@shared/interfaces/repositories/ITicketHistoryRepository';
import { v4 as uuidv4 } from 'uuid';

export class MockTicketHistoryRepository implements ITicketHistoryRepository {
  private history: Map<string, TicketHistory> = new Map();

  async create(historyEntry: TicketHistory): Promise<TicketHistory> {
    const newEntry: TicketHistory = {
      ...historyEntry,
      id: uuidv4(),
      timestamp: new Date(),
    };

    this.history.set(newEntry.id, newEntry);
    return newEntry;
  }

  async findByTicketId(ticketId: string): Promise<TicketHistory[]> {
    return Array.from(this.history.values())
      .filter(entry => entry.ticketId === ticketId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
