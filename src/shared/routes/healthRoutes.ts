import { Router, Request, Response } from 'express';
import { logger } from '@shared/utils/logger';

export function createHealthRoutes(): Router {
  const router = Router();

  router.get('/health', async (req: Request, res: Response) => {
    try {
      const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      };

      res.status(200).json({
        success: true,
        data: healthCheck,
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'Service unhealthy',
      });
    }
  });

  router.get('/metrics', async (req: Request, res: Response) => {
    try {
      const metrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      };

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Metrics endpoint failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics',
      });
    }
  });

  return router;
}
