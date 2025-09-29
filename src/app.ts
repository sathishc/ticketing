import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Container } from '@shared/container/Container';
import { createTicketRoutes } from '@modules/ticket/routes/ticketRoutes';
import { createReportingRoutes } from '@modules/reporting/routes/reportingRoutes';
import { createHealthRoutes } from '@shared/routes/healthRoutes';
import { errorHandler } from '@shared/middleware/errorHandler';
import { requestLogger } from '@shared/middleware/requestLogger';
import { logger } from '@shared/utils/logger';

class Application {
  private app: express.Application;
  private container: Container;

  constructor() {
    this.app = express();
    this.container = new Container();
  }

  async initialize(): Promise<void> {
    await this.setupContainer();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private async setupContainer(): Promise<void> {
    await this.container.initialize();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    this.app.use('/api/v1/tickets', createTicketRoutes(this.container));
    this.app.use('/api/v1/reports', createReportingRoutes(this.container));
    this.app.use('/api/v1', createHealthRoutes());
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public getApp(): express.Application {
    return this.app;
  }

  public async start(port: number = 3000): Promise<void> {
    await this.initialize();
    
    this.app.listen(port, () => {
      logger.info(`Ticketing service started on port ${port}`);
    });
  }
}

// Start the application
if (require.main === module) {
  const app = new Application();
  const port = parseInt(process.env.PORT || '3000', 10);
  
  app.start(port).catch((error) => {
    logger.error('Failed to start application:', error);
    process.exit(1);
  });
}

export { Application };
