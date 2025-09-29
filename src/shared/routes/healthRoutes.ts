import { Router, Request, Response } from 'express';

export function createHealthRoutes(): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    res.status(200).json({
      success: true,
      data: healthData,
    });
  });

  return router;
}
