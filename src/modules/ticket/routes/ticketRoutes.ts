import { Router } from 'express';
import { Container } from '@shared/container/Container';
import { TicketController } from '../presentation/controllers/TicketController';
import { validateRequest } from '@shared/middleware/validation';
import { createTicketSchema, updateTicketStatusSchema, assignTicketSchema } from '../presentation/schemas/ticketSchemas';

export function createTicketRoutes(container: Container): Router {
  const router = Router();
  const ticketController = container.resolve<TicketController>('ticketController');

  router.post('/', validateRequest(createTicketSchema), (req, res) => 
    ticketController.createTicket(req, res)
  );

  router.get('/', (req, res) => 
    ticketController.getTickets(req, res)
  );

  router.get('/:id', (req, res) => 
    ticketController.getTicketById(req, res)
  );

  router.put('/:id/status', validateRequest(updateTicketStatusSchema), (req, res) => 
    ticketController.updateTicketStatus(req, res)
  );

  router.put('/:id/assign', validateRequest(assignTicketSchema), (req, res) => 
    ticketController.assignTicket(req, res)
  );

  return router;
}
