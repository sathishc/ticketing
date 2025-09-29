import request from 'supertest';
import { Express } from 'express';
import { Container } from '@shared/container/Container';
import { TicketPriority, TicketStatus } from '@modules/ticket/domain/entities/Ticket';

describe('Ticketing Service Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'development';
    
    // Initialize container and app
    const container = new Container();
    await container.initialize();
    
    const { createApp } = await import('../../app');
    app = createApp(container);
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.version).toBe('1.0.0');
    });
  });

  describe('Ticket Creation', () => {
    it('should create a ticket successfully', async () => {
      const ticketData = {
        title: 'Integration Test Ticket',
        description: 'This is a test ticket',
        priority: TicketPriority.HIGH,
        category: 'Technical',
        customerId: 'customer-123',
      };

      const response = await request(app)
        .post('/api/v1/tickets')
        .send(ticketData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(ticketData.title);
      expect(response.body.data.status).toBe(TicketStatus.NEW);
      expect(response.body.data.id).toBeDefined();
    });

    it('should reject invalid ticket data', async () => {
      const invalidData = {
        title: '', // Empty title
        description: 'Test',
        priority: TicketPriority.MEDIUM,
        category: 'Technical',
        customerId: 'customer-123',
      };

      const response = await request(app)
        .post('/api/v1/tickets')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });
  });

  describe('Ticket Retrieval', () => {
    it('should retrieve tickets list', async () => {
      const response = await request(app)
        .get('/api/v1/tickets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
    });
  });

  describe('Complete Workflow', () => {
    it('should handle ticket creation and status update', async () => {
      // Create ticket
      const ticketData = {
        title: 'Workflow Test',
        description: 'Testing workflow',
        priority: TicketPriority.MEDIUM,
        category: 'Support',
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

      // Update status
      const statusData = {
        status: TicketStatus.IN_PROGRESS,
        userId: 'agent-123',
        comment: 'Starting work',
      };

      const statusResponse = await request(app)
        .put(`/api/v1/tickets/${ticketId}/status`)
        .send(statusData)
        .expect(200);

      expect(statusResponse.body.data.status).toBe(TicketStatus.IN_PROGRESS);
    });
  });
});
