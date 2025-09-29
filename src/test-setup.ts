// Global test setup
jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.TICKETS_TABLE_NAME = 'test-tickets';
process.env.TICKET_HISTORY_TABLE_NAME = 'test-ticket-history';
process.env.TICKET_COMMENTS_TABLE_NAME = 'test-ticket-comments';
