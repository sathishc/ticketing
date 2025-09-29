import { Container } from './Container';
import { MockTicketRepository } from '@modules/ticket/infrastructure/repositories/MockTicketRepository';
import { MockTicketHistoryRepository } from '@modules/ticket/infrastructure/repositories/MockTicketHistoryRepository';

// Singleton repositories for testing
let ticketRepository: MockTicketRepository;
let historyRepository: MockTicketHistoryRepository;

export class TestContainer extends Container {
  protected registerRepositories(): void {
    // Create singleton repositories if they don't exist
    if (!ticketRepository) {
      ticketRepository = new MockTicketRepository();
    }
    if (!historyRepository) {
      historyRepository = new MockTicketHistoryRepository();
    }

    this.register('ticketRepository', () => ticketRepository);
    this.register('ticketHistoryRepository', () => historyRepository);
  }

  static resetRepositories(): void {
    if (ticketRepository) {
      (ticketRepository as any).tickets = new Map();
    }
    if (historyRepository) {
      (historyRepository as any).history = new Map();
    }
  }
}
