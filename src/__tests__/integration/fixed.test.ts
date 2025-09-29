import request from 'supertest';
import { Express } from 'express';
import { TestContainer } from '@shared/container/TestContainer';
import { TicketPriority, TicketStatus } from '@modules/ticket/domain/entities/Ticket';

describe('Fixed Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    process.env.NODE_ENV = 'development';
    const container = new TestContainer();
    await container.initialize();
    
    const { createApp } = await import('../../app');
    app = createApp(container);
  });

  beforeEach(() => {
    TestContainer.resetRepositories();
  });

  describe('API Health and Operations', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
    });

    it('should create and retrieve tickets', async () => {
      // Create tickets
      const ticket1 = {
        title: 'First Ticket',
        description: 'First description',
        priority: TicketPriority.HIGH,
        category: 'Technical',
        customerId: 'customer-1',
      };

      const createResponse1 = await request(app)
        .post('/api/v1/tickets')
        .send(ticket1)
        .expect(201);

      const ticketId1 = createResponse1.body.data.id;

      const ticket2 = {
        title: 'Second Ticket',
        description: 'Second description',
        priority: TicketPriority.MEDIUM,
        category: 'Support',
        customerId: 'customer-2',
      };

      await request(app)
        .post('/api/v1/tickets')
        .send(ticket2)
        .expect(201);

      // Verify persistence
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
    });

    it('should handle validation errors', async () => {
      const invalidTicket = {
        title: '',
        description: 'Test',
        priority: TicketPriority.LOW,
        category: 'Test',
        customerId: 'customer-test',
      };

      const response = await request(app)
        .post('/api/v1/tickets')
        .send(invalidTicket)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });
  });

  describe('Complete Workflow', () => {
    it('should handle full ticket lifecycle', async () => {
      // Create ticket
      const ticketData = {
        title: 'Workflow Test',
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

      // Assign ticket
      const assignData = {
        agentId: 'agent-123',
        assignedBy: 'manager-123',
      };

      const assignResponse = await request(app)
        .put(`/api/v1/tickets/${ticketId}/assign`)
        .send(assignData)
        .expect(200);

      expect(assignResponse.body.data.assignedAgentId).toBe('agent-123');
      expect(assignResponse.body.data.status).toBe(TicketStatus.ASSIGNED);

      // Update to in progress
      const progressData = {
        status: TicketStatus.IN_PROGRESS,
        userId: 'agent-123',
        comment: 'Starting work',
      };

      const progressResponse = await request(app)
        .put(`/api/v1/tickets/${ticketId}/status`)
        .send(progressData)
        .expect(200);

      expect(progressResponse.body.data.status).toBe(TicketStatus.IN_PROGRESS);

      // Resolve ticket
      const resolveData = {
        status: TicketStatus.RESOLVED,
        userId: 'agent-123',
        comment: 'Issue resolved',
      };

      const resolveResponse = await request(app)
        .put(`/api/v1/tickets/${ticketId}/status`)
        .send(resolveData)
        .expect(200);

      expect(resolveResponse.body.data.status).toBe(TicketStatus.RESOLVED);
      expect(resolveResponse.body.data.resolvedAt).toBeDefined();

      // Close ticket
      const closeData = {
        status: TicketStatus.CLOSED,
        userId: 'agent-123',
        comment: 'Ticket closed',
      };

      const closeResponse = await request(app)
        .put(`/api/v1/tickets/${ticketId}/status`)
        .send(closeData)
        .expect(200);

      expect(closeResponse.body.data.status).toBe(TicketStatus.CLOSED);
      expect(closeResponse.body.data.closedAt).toBeDefined();
    });
  });

  describe('Filtering and Search', () => {
    it('should filter tickets by customer', async () => {
      // Create tickets for different customers
      const ticket1 = {
        title: 'Customer 1 Ticket',
        description: 'For customer 1',
        priority: TicketPriority.LOW,
        category: 'Support',
        customerId: 'customer-filter-1',
      };

      const ticket2 = {
        title: 'Customer 2 Ticket',
        description: 'For customer 2',
        priority: TicketPriority.MEDIUM,
        category: 'Technical',
        customerId: 'customer-filter-2',
      };

      await request(app).post('/api/v1/tickets').send(ticket1).expect(201);
      await request(app).post('/api/v1/tickets').send(ticket2).expect(201);

      // Filter by customer 1
      const filterResponse = await request(app)
        .get('/api/v1/tickets?customerId=customer-filter-1')
        .expect(200);

      expect(filterResponse.body.data.items).toHaveLength(1);
      expect(filterResponse.body.data.items[0].customerId).toBe('customer-filter-1');
    });

    it('should filter tickets by status', async () => {
      // Create and assign a ticket
      const ticket = {
        title: 'Status Filter Test',
        description: 'For status filtering',
        priority: TicketPriority.HIGH,
        category: 'Test',
        customerId: 'customer-status',
      };

      const createResponse = await request(app)
        .post('/api/v1/tickets')
        .send(ticket)
        .expect(201);

      const ticketId = createResponse.body.data.id;

      // Assign it
      await request(app)
        .put(`/api/v1/tickets/${ticketId}/assign`)
        .send({ agentId: 'agent-1', assignedBy: 'manager-1' })
        .expect(200);

      // Filter by assigned status
      const filterResponse = await request(app)
        .get('/api/v1/tickets?status=assigned')
        .expect(200);

      expect(filterResponse.body.data.items).toHaveLength(1);
      expect(filterResponse.body.data.items[0].status).toBe(TicketStatus.ASSIGNED);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent ticket', async () => {
      const response = await request(app)
        .get('/api/v1/tickets/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Ticket not found');
    });

    it('should reject invalid status transitions', async () => {
      // Create ticket
      const ticket = {
        title: 'Status Transition Test',
        description: 'Testing invalid transitions',
        priority: TicketPriority.MEDIUM,
        category: 'Test',
        customerId: 'customer-transition',
      };

      const createResponse = await request(app)
        .post('/api/v1/tickets')
        .send(ticket)
        .expect(201);

      const ticketId = createResponse.body.data.id;

      // Try invalid transition (NEW -> RESOLVED)
      const invalidUpdate = {
        status: TicketStatus.RESOLVED,
        userId: 'agent-test',
      };

      const response = await request(app)
        .put(`/api/v1/tickets/${ticketId}/status`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status transition');
    });
  });
});
