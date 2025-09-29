import { MockTicketRepository } from '@modules/ticket/infrastructure/repositories/MockTicketRepository';
import { MockTicketHistoryRepository } from '@modules/ticket/infrastructure/repositories/MockTicketHistoryRepository';

// Shared repositories across all tests
export const sharedTicketRepository = new MockTicketRepository();
export const sharedHistoryRepository = new MockTicketHistoryRepository();

// Reset repositories before each test
export const resetRepositories = () => {
  // Clear the internal maps
  (sharedTicketRepository as any).tickets = new Map();
  (sharedHistoryRepository as any).history = new Map();
};
