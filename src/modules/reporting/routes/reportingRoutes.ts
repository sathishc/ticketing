import { Router } from 'express';
import { Container } from '@shared/container/Container';

export function createReportingRoutes(container: Container): Router {
  const router = Router();

  router.get('/dashboard', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        averageResolutionTime: 0,
        ticketsByStatus: {},
        ticketsByPriority: {},
      },
    });
  });

  return router;
}
