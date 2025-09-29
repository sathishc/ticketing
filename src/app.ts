import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Container } from '@shared/container/Container';
import { createTicketRoutes } from '@modules/ticket/routes/ticketRoutes';
import { createReportingRoutes } from '@modules/reporting/routes/reportingRoutes';
import { createHealthRoutes } from '@shared/routes/healthRoutes';
import { requestLogger } from '@shared/middleware/requestLogger';
import { errorHandler } from '@shared/middleware/errorHandler';
import { logger } from '@shared/utils/logger';

export function createApp(container: Container): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // Routes
  app.use('/api/v1/health', createHealthRoutes());
  app.use('/api/v1/tickets', createTicketRoutes(container));
  app.use('/api/v1/reports', createReportingRoutes(container));

  // Error handling
  app.use(errorHandler);

  return app;
}

// Main application entry point
async function main() {
  try {
    const container = new Container();
    await container.initialize();

    const app = createApp(container);
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      logger.info(`Ticketing service started on port ${port}`, {
        environment: process.env.NODE_ENV || 'development',
      });
    });
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  main();
}
