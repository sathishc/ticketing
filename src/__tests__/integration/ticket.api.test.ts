import { Express } from 'express';
import { TestApp, testRequest } from './setup';
import { TicketPriority, TicketStatus } from '@modules/ticket/domain/entities/Ticket';

describe('Ticket API Integration Tests', () => {
  let app: Express;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = new TestApp();
    app = await testApp.initialize();
  });

  beforeEach(() => {
    testApp.resetData();
  });

  describe('POST /api/v1/tickets', () => {
    it('should create a new ticket successfully', async () => {
      const ticketData = {
        title: 'Integration Test Ticket',
        description: 'This is a test ticket for integration testing',
        priority: TicketPriority.HIGH,
        category: 'Technical',
        customerId: 'customer-123',
      };

      const response = await testRequest(app)
        .post('/api/v1/tickets')
        .send(ticketData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        category: ticketData.category,
        customerId: ticketData.customerId,
        status: TicketStatus.NEW,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should reject ticket with missing required fields', async () => {
      const invalidTicketData = {
        title: '',
        description: 'Missing title',
        priority: TicketPriority.MEDIUM,
        category: 'Technical',
        customerId: 'customer-123',
      };

      const response = await testRequest(app)
        .post('/api/v1/tickets')
        .send(invalidTicketData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });

    it('should reject ticket with invalid priority', async () => {
      const invalidTicketData = {
        title: 'Test Ticket',
        description: 'Test description',
        priority: 'invalid-priority',
        category: 'Technical',
        customerId: 'customer-123',
      };

      const response = await testRequest(app)
        .post('/api/v1/tickets')
        .send(invalidTicketData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });
  });

  describe('GET /api/v1/tickets', () => {
    let createdTicketId: string;

    beforeEach(async () => {
      // Create a test ticket
      const ticketData = {
        title: 'Test Ticket for GET',
        description: 'Test description',
        priority: TicketPriority.MEDIUM,
        category: 'Support',
        customerId: 'customer-456',
      };

      const response = await testRequest(app)
        .post('/api/v1/tickets')
        .send(ticketData);

      createdTicketId = response.body.data.id;
    });

    it('should retrieve all tickets', async () => {
      const response = await testRequest(app)
        .get('/api/v1/tickets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
    });

    it('should filter tickets by status', async () => {
      const response = await testRequest(app)
        .get('/api/v1/tickets?status=new')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeInstanceOf(Array);
      response.body.data.items.forEach((ticket: any) => {
        expect(ticket.status).toBe(TicketStatus.NEW);
      });
    });

    it('should filter tickets by customer', async () => {
      const response = await testRequest(app)
        .get('/api/v1/tickets?customerId=customer-456')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeInstanceOf(Array);
      response.body.data.items.forEach((ticket: any) => {
        expect(ticket.customerId).toBe('customer-456');
      });
    });
  });

  describe('GET /api/v1/tickets/:id', () => {
    let createdTicketId: string;

    beforeEach(async () => {
      const ticketData = {
        title: 'Test Ticket for GET by ID',
        description: 'Test description',
        priority: TicketPriority.LOW,
        category: 'Bug',
        customerId: 'customer-789',
      };

      const response = await testRequest(app)
        .post('/api/v1/tickets')
        .send(ticketData);

      createdTicketId = response.body.data.id;
    });

    it('should retrieve ticket by ID', async () => {
      const response = await testRequest(app)
        .get(`/api/v1/tickets/${createdTicketId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdTicketId);
      expect(response.body.data.title).toBe('Test Ticket for GET by ID');
    });

    it('should return 404 for non-existent ticket', async () => {
      const response = await testRequest(app)
        .get('/api/v1/tickets/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Ticket not found');
    });
  });

  describe('PUT /api/v1/tickets/:id/status', () => {
    let createdTicketId: string;

    beforeEach(async () => {
      const ticketData = {
        title: 'Test Ticket for Status Update',
        description: 'Test description',
        priority: TicketPriority.URGENT,
        category: 'Critical',
        customerId: 'customer-status',
      };

      const response = await testRequest(app)
        .post('/api/v1/tickets')
        .send(ticketData);

      createdTicketId = response.body.data.id;
    });

    it('should update ticket status successfully', async () => {
      const statusUpdate = {
        status: TicketStatus.ASSIGNED,
        userId: 'agent-123',
        comment: 'Assigning to agent',
      };

      const response = await testRequest(app)
        .put(`/api/v1/tickets/${createdTicketId}/status`)
        .send(statusUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(TicketStatus.ASSIGNED);
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should reject invalid status transition', async () => {
      const invalidStatusUpdate = {
        status: TicketStatus.RESOLVED, // Can't go directly from NEW to RESOLVED
        userId: 'agent-123',
      };

      const response = await testRequest(app)
        .put(`/api/v1/tickets/${createdTicketId}/status`)
        .send(invalidStatusUpdate)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status transition');
    });
  });

  describe('PUT /api/v1/tickets/:id/assign', () => {
    let createdTicketId: string;

    beforeEach(async () => {
      const ticketData = {
        title: 'Test Ticket for Assignment',
        description: 'Test description',
        priority: TicketPriority.MEDIUM,
        category: 'Support',
        customerId: 'customer-assign',
      };

      const response = await testRequest(app)
        .post('/api/v1/tickets')
        .send(ticketData);

      createdTicketId = response.body.data.id;
    });

    it('should assign ticket to agent successfully', async () => {
      const assignmentData = {
        agentId: 'agent-456',
        assignedBy: 'manager-123',
      };

      const response = await testRequest(app)
        .put(`/api/v1/tickets/${createdTicketId}/assign`)
        .send(assignmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedAgentId).toBe('agent-456');
      expect(response.body.data.status).toBe(TicketStatus.ASSIGNED);
    });

    it('should reject assignment with missing agent ID', async () => {
      const invalidAssignment = {
        assignedBy: 'manager-123',
      };

      const response = await testRequest(app)
        .put(`/api/v1/tickets/${createdTicketId}/assign`)
        .send(invalidAssignment)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });
  });
});
