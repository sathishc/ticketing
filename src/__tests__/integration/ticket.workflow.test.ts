import { Express } from 'express';
import { TestApp, testRequest } from './setup';
import { TicketPriority, TicketStatus } from '@modules/ticket/domain/entities/Ticket';

describe('Ticket Workflow Integration Tests', () => {
  let app: Express;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = new TestApp();
    app = await testApp.initialize();
  });

  describe('Complete Ticket Lifecycle', () => {
    it('should handle complete ticket workflow from creation to resolution', async () => {
      // Step 1: Create ticket
      const ticketData = {
        title: 'Workflow Test Ticket',
        description: 'Testing complete workflow',
        priority: TicketPriority.HIGH,
        category: 'Technical',
        customerId: 'customer-workflow',
      };

      const createResponse = await testRequest(app)
        .post('/api/v1/tickets')
        .send(ticketData)
        .expect(201);

      const ticketId = createResponse.body.data.id;
      expect(createResponse.body.data.status).toBe(TicketStatus.NEW);

      // Step 2: Assign ticket
      const assignmentData = {
        agentId: 'agent-workflow',
        assignedBy: 'manager-workflow',
      };

      const assignResponse = await testRequest(app)
        .put(`/api/v1/tickets/${ticketId}/assign`)
        .send(assignmentData)
        .expect(200);

      expect(assignResponse.body.data.status).toBe(TicketStatus.ASSIGNED);
      expect(assignResponse.body.data.assignedAgentId).toBe('agent-workflow');

      // Step 3: Move to in progress
      const inProgressUpdate = {
        status: TicketStatus.IN_PROGRESS,
        userId: 'agent-workflow',
        comment: 'Starting work on ticket',
      };

      const progressResponse = await testRequest(app)
        .put(`/api/v1/tickets/${ticketId}/status`)
        .send(inProgressUpdate)
        .expect(200);

      expect(progressResponse.body.data.status).toBe(TicketStatus.IN_PROGRESS);

      // Step 4: Resolve ticket
      const resolveUpdate = {
        status: TicketStatus.RESOLVED,
        userId: 'agent-workflow',
        comment: 'Issue has been resolved',
      };

      const resolveResponse = await testRequest(app)
        .put(`/api/v1/tickets/${ticketId}/status`)
        .send(resolveUpdate)
        .expect(200);

      expect(resolveResponse.body.data.status).toBe(TicketStatus.RESOLVED);
      expect(resolveResponse.body.data.resolvedAt).toBeDefined();

      // Step 5: Close ticket
      const closeUpdate = {
        status: TicketStatus.CLOSED,
        userId: 'agent-workflow',
        comment: 'Ticket closed after resolution',
      };

      const closeResponse = await testRequest(app)
        .put(`/api/v1/tickets/${ticketId}/status`)
        .send(closeUpdate)
        .expect(200);

      expect(closeResponse.body.data.status).toBe(TicketStatus.CLOSED);
      expect(closeResponse.body.data.closedAt).toBeDefined();

      // Step 6: Verify final state
      const finalResponse = await testRequest(app)
        .get(`/api/v1/tickets/${ticketId}`)
        .expect(200);

      expect(finalResponse.body.data).toMatchObject({
        id: ticketId,
        title: ticketData.title,
        status: TicketStatus.CLOSED,
        assignedAgentId: 'agent-workflow',
      });
      expect(finalResponse.body.data.resolvedAt).toBeDefined();
      expect(finalResponse.body.data.closedAt).toBeDefined();
    });

    it('should handle multiple tickets for same customer', async () => {
      const customerId = 'customer-multiple';
      const ticketTitles = ['First Ticket', 'Second Ticket', 'Third Ticket'];
      const createdTickets = [];

      // Create multiple tickets
      for (const title of ticketTitles) {
        const ticketData = {
          title,
          description: `Description for ${title}`,
          priority: TicketPriority.MEDIUM,
          category: 'Support',
          customerId,
        };

        const response = await testRequest(app)
          .post('/api/v1/tickets')
          .send(ticketData)
          .expect(201);

        createdTickets.push(response.body.data);
      }

      // Verify all tickets were created
      expect(createdTickets).toHaveLength(3);

      // Filter tickets by customer
      const customerTicketsResponse = await testRequest(app)
        .get(`/api/v1/tickets?customerId=${customerId}`)
        .expect(200);

      expect(customerTicketsResponse.body.data.items).toHaveLength(3);
      customerTicketsResponse.body.data.items.forEach((ticket: any) => {
        expect(ticket.customerId).toBe(customerId);
        expect(ticketTitles).toContain(ticket.title);
      });
    });

    it('should handle concurrent status updates correctly', async () => {
      // Create a ticket
      const ticketData = {
        title: 'Concurrent Update Test',
        description: 'Testing concurrent updates',
        priority: TicketPriority.LOW,
        category: 'Test',
        customerId: 'customer-concurrent',
      };

      const createResponse = await testRequest(app)
        .post('/api/v1/tickets')
        .send(ticketData)
        .expect(201);

      const ticketId = createResponse.body.data.id;

      // First assign the ticket
      const assignmentData = {
        agentId: 'agent-concurrent',
        assignedBy: 'manager-concurrent',
      };

      await testRequest(app)
        .put(`/api/v1/tickets/${ticketId}/assign`)
        .send(assignmentData)
        .expect(200);

      // Then update status to in progress
      const statusUpdate = {
        status: TicketStatus.IN_PROGRESS,
        userId: 'agent-concurrent',
        comment: 'Working on it',
      };

      const statusResponse = await testRequest(app)
        .put(`/api/v1/tickets/${ticketId}/status`)
        .send(statusUpdate)
        .expect(200);

      expect(statusResponse.body.data.status).toBe(TicketStatus.IN_PROGRESS);
      expect(statusResponse.body.data.assignedAgentId).toBe('agent-concurrent');
    });
  });
});
