import request from 'supertest';
import { Express } from 'express';
import { Container } from '@shared/container/Container';
import { TicketPriority, TicketStatus } from '@modules/ticket/domain/entities/Ticket';
import { MockTicketRepository } from '@modules/ticket/infrastructure/repositories/MockTicketRepository';
import { MockTicketHistoryRepository } from '@modules/ticket/infrastructure/repositories/MockTicketHistoryRepository';

// Global repositories for all tests
const globalTicketRepo = new MockTicketRepository();
const globalHistoryRepo = new MockTicketHistoryRepository();

// Override container to use global repositories
class TestContainer extends Container {
  protected registerRepositories(): void {
    this.register('ticketRepository', () => globalTicketRepo);
    this.register('ticketHistoryRepository', () => globalHistoryRepo);
  }
}

describe('Complete Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    process.env.NODE_ENV = 'development';
    const container = new TestContainer();
    await container.initialize();
    
    const { createApp } = await import('../../app');
    app = createApp(container);
  });

  beforeEach(() => {
    // Clear repositories before each test
    (globalTicketRepo as any).tickets = new Map();
    (globalHistoryRepo as any).history = new Map();
  });

  it('should handle complete API operations', async () => {
    // Health check
    const healthResponse = await request(app)
      .get('/api/v1/health')
      .expect(200);
    expect(healthResponse.body.data.status).toBe('healthy');

    // Create tickets
    const ticket1 = {
      title: 'Test Ticket 1',
      description: 'First test ticket',
      priority: TicketPriority.HIGH,
      category: 'Technical',
      customerId: 'customer-1',
    };

    const createResponse1 = await request(app)
      .post('/api/v1/tickets')
      .send(ticket1)
      .expect(201);

    const ticketId1 = createResponse1.body.data.id;
    expect(createResponse1.body.data.title).toBe(ticket1.title);

    const ticket2 = {
      title: 'Test Ticket 2',
      description: 'Second test ticket',
      priority: TicketPriority.MEDIUM,
      category: 'Support',
      customerId: 'customer-2',
    };

    await request(app)
      .post('/api/v1/tickets')
      .send(ticket2)
      .expect(201);

    // List all tickets
    const listResponse = await request(app)
      .get('/api/v1/tickets')
      .expect(200);

    expect(listResponse.body.data.items).toHaveLength(2);
    expect(listResponse.body.data.total).toBe(2);

    // Get specific ticket
    const getResponse = await request(app)
      .get(`/api/v1/tickets/${ticketId1}`)
      .expect(200);

    expect(getResponse.body.data.id).toBe(ticketId1);
    expect(getResponse.body.data.title).toBe(ticket1.title);

    // Filter by customer
    const filterResponse = await request(app)
      .get('/api/v1/tickets?customerId=customer-1')
      .expect(200);

    expect(filterResponse.body.data.items).toHaveLength(1);
    expect(filterResponse.body.data.items[0].customerId).toBe('customer-1');
  });

  it('should handle complete workflow', async () => {
    // Create ticket
    const ticketData = {
      title: 'Workflow Test Ticket',
      description: 'Testing complete workflow',
      priority: TicketPriority.URGENT,
      category: 'Critical',
      customerId: 'customer-workflow',
    };

    const createResponse = await request(app)
      .post('/api/v1/tickets')
      .send(ticketData)
      .expect(201);

    const ticketId = createResponse.body.data.id;
    expect(createResponse.body.data.status).toBe(TicketStatus.NEW);

    // Assign ticket
    const assignResponse = await request(app)
      .put(`/api/v1/tickets/${ticketId}/assign`)
      .send({ agentId: 'agent-123', assignedBy: 'manager-123' })
      .expect(200);

    expect(assignResponse.body.data.assignedAgentId).toBe('agent-123');
    expect(assignResponse.body.data.status).toBe(TicketStatus.ASSIGNED);

    // Update to in progress
    const progressResponse = await request(app)
      .put(`/api/v1/tickets/${ticketId}/status`)
      .send({ status: TicketStatus.IN_PROGRESS, userId: 'agent-123', comment: 'Starting work' })
      .expect(200);

    expect(progressResponse.body.data.status).toBe(TicketStatus.IN_PROGRESS);

    // Resolve ticket
    const resolveResponse = await request(app)
      .put(`/api/v1/tickets/${ticketId}/status`)
      .send({ status: TicketStatus.RESOLVED, userId: 'agent-123', comment: 'Issue resolved' })
      .expect(200);

    expect(resolveResponse.body.data.status).toBe(TicketStatus.RESOLVED);
    expect(resolveResponse.body.data.resolvedAt).toBeDefined();

    // Close ticket
    const closeResponse = await request(app)
      .put(`/api/v1/tickets/${ticketId}/status`)
      .send({ status: TicketStatus.CLOSED, userId: 'agent-123', comment: 'Ticket closed' })
      .expect(200);

    expect(closeResponse.body.data.status).toBe(TicketStatus.CLOSED);
    expect(closeResponse.body.data.closedAt).toBeDefined();
  });

  it('should handle validation and errors', async () => {
    // Test validation error
    const invalidTicket = {
      title: '',
      description: 'Test',
      priority: TicketPriority.LOW,
      category: 'Test',
      customerId: 'customer-test',
    };

    const validationResponse = await request(app)
      .post('/api/v1/tickets')
      .send(invalidTicket)
      .expect(400);

    expect(validationResponse.body.success).toBe(false);
    expect(validationResponse.body.details).toBeDefined();

    // Test 404 error
    const notFoundResponse = await request(app)
      .get('/api/v1/tickets/non-existent-id')
      .expect(404);

    expect(notFoundResponse.body.success).toBe(false);
    expect(notFoundResponse.body.error).toBe('Ticket not found');

    // Test invalid status transition
    const ticket = {
      title: 'Status Test',
      description: 'Testing transitions',
      priority: TicketPriority.MEDIUM,
      category: 'Test',
      customerId: 'customer-status',
    };

    const createResponse = await request(app)
      .post('/api/v1/tickets')
      .send(ticket)
      .expect(201);

    const ticketId = createResponse.body.data.id;

    // Try invalid transition (NEW -> RESOLVED)
    const invalidTransitionResponse = await request(app)
      .put(`/api/v1/tickets/${ticketId}/status`)
      .send({ status: TicketStatus.RESOLVED, userId: 'agent-test' })
      .expect(400);

    expect(invalidTransitionResponse.body.success).toBe(false);
    expect(invalidTransitionResponse.body.error).toContain('Invalid status transition');
  });

  it('should handle filtering and search', async () => {
    // Create tickets with different statuses
    const newTicket = {
      title: 'New Ticket',
      description: 'New ticket for filtering',
      priority: TicketPriority.LOW,
      category: 'Support',
      customerId: 'customer-filter',
    };

    const createResponse = await request(app)
      .post('/api/v1/tickets')
      .send(newTicket)
      .expect(201);

    const ticketId = createResponse.body.data.id;

    // Assign the ticket
    await request(app)
      .put(`/api/v1/tickets/${ticketId}/assign`)
      .send({ agentId: 'agent-filter', assignedBy: 'manager-filter' })
      .expect(200);

    // Filter by status
    const statusFilterResponse = await request(app)
      .get('/api/v1/tickets?status=assigned')
      .expect(200);

    expect(statusFilterResponse.body.data.items).toHaveLength(1);
    expect(statusFilterResponse.body.data.items[0].status).toBe(TicketStatus.ASSIGNED);

    // Filter by customer
    const customerFilterResponse = await request(app)
      .get('/api/v1/tickets?customerId=customer-filter')
      .expect(200);

    expect(customerFilterResponse.body.data.items).toHaveLength(1);
    expect(customerFilterResponse.body.data.items[0].customerId).toBe('customer-filter');
  });
});
