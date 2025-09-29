import request from 'supertest';
import { Express } from 'express';
import { Container } from '@shared/container/Container';
import { TicketPriority, TicketStatus } from '@modules/ticket/domain/entities/Ticket';

describe('Ticketing Service Integration Tests', () => {
  let app: Express;
  let container: Container;

  beforeAll(async () => {
    process.env.NODE_ENV = 'development';
    container = new Container();
    await container.initialize();
    
    const { createApp } = await import('../../app');
    app = createApp(container);
  });

  describe('API Health and Basic Operations', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
    });

    it('should create and retrieve tickets', async () => {
      // Create first ticket
      const ticket1 = {
        title: 'First Test Ticket',
        description: 'First test description',
        priority: TicketPriority.HIGH,
        category: 'Technical',
        customerId: 'customer-1',
      };

      const createResponse1 = await request(app)
        .post('/api/v1/tickets')
        .send(ticket1)
        .expect(201);

      expect(createResponse1.body.data.title).toBe(ticket1.title);
      const ticketId1 = createResponse1.body.data.id;

      // Create second ticket
      const ticket2 = {
        title: 'Second Test Ticket',
        description: 'Second test description',
        priority: TicketPriority.MEDIUM,
        category: 'Support',
        customerId: 'customer-2',
      };

      const createResponse2 = await request(app)
        .post('/api/v1/tickets')
        .send(ticket2)
        .expect(201);

      const ticketId2 = createResponse2.body.data.id;

      // Retrieve all tickets
      const listResponse = await request(app)
        .get('/api/v1/tickets')
        .expect(200);

      expect(listResponse.body.data.items).toHaveLength(2);
      expect(listResponse.body.data.total).toBe(2);

      // Retrieve specific ticket
      const getResponse = await request(app)
        .get(`/api/v1/tickets/${ticketId1}`)
        .expect(200);

      expect(getResponse.body.data.id).toBe(ticketId1);
      expect(getResponse.body.data.title).toBe(ticket1.title);
    });

    it('should handle validation errors', async () => {
      const invalidTicket = {
        title: '', // Invalid empty title
        description: 'Test description',
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

    it('should filter tickets by customer', async () => {
      // Create ticket for specific customer
      const customerTicket = {
        title: 'Customer Specific Ticket',
        description: 'For filtering test',
        priority: TicketPriority.URGENT,
        category: 'VIP',
        customerId: 'customer-filter-test',
      };

      await request(app)
        .post('/api/v1/tickets')
        .send(customerTicket)
        .expect(201);

      // Filter by customer
      const filterResponse = await request(app)
        .get('/api/v1/tickets?customerId=customer-filter-test')
        .expect(200);

      expect(filterResponse.body.data.items).toHaveLength(1);
      expect(filterResponse.body.data.items[0].customerId).toBe('customer-filter-test');
    });
  });

  describe('Ticket Workflow', () => {
    let workflowTicketId: string;

    it('should create a ticket for workflow testing', async () => {
      const workflowTicket = {
        title: 'Workflow Test Ticket',
        description: 'Testing complete workflow',
        priority: TicketPriority.HIGH,
        category: 'Workflow',
        customerId: 'customer-workflow',
      };

      const response = await request(app)
        .post('/api/v1/tickets')
        .send(workflowTicket)
        .expect(201);

      workflowTicketId = response.body.data.id;
      expect(response.body.data.status).toBe(TicketStatus.NEW);
    });

    it('should assign the ticket', async () => {
      const assignData = {
        agentId: 'agent-workflow',
        assignedBy: 'manager-workflow',
      };

      const response = await request(app)
        .put(`/api/v1/tickets/${workflowTicketId}/assign`)
        .send(assignData)
        .expect(200);

      expect(response.body.data.assignedAgentId).toBe('agent-workflow');
      expect(response.body.data.status).toBe(TicketStatus.ASSIGNED);
    });

    it('should update ticket status to in progress', async () => {
      const statusUpdate = {
        status: TicketStatus.IN_PROGRESS,
        userId: 'agent-workflow',
        comment: 'Starting work on ticket',
      };

      const response = await request(app)
        .put(`/api/v1/tickets/${workflowTicketId}/status`)
        .send(statusUpdate)
        .expect(200);

      expect(response.body.data.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should resolve the ticket', async () => {
      const resolveUpdate = {
        status: TicketStatus.RESOLVED,
        userId: 'agent-workflow',
        comment: 'Issue resolved',
      };

      const response = await request(app)
        .put(`/api/v1/tickets/${workflowTicketId}/status`)
        .send(resolveUpdate)
        .expect(200);

      expect(response.body.data.status).toBe(TicketStatus.RESOLVED);
      expect(response.body.data.resolvedAt).toBeDefined();
    });

    it('should close the ticket', async () => {
      const closeUpdate = {
        status: TicketStatus.CLOSED,
        userId: 'agent-workflow',
        comment: 'Ticket closed',
      };

      const response = await request(app)
        .put(`/api/v1/tickets/${workflowTicketId}/status`)
        .send(closeUpdate)
        .expect(200);

      expect(response.body.data.status).toBe(TicketStatus.CLOSED);
      expect(response.body.data.closedAt).toBeDefined();
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
      // Create a new ticket
      const ticket = {
        title: 'Status Transition Test',
        description: 'Testing invalid transitions',
        priority: TicketPriority.LOW,
        category: 'Test',
        customerId: 'customer-status-test',
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
        comment: 'Invalid transition',
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
