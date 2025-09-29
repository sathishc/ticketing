import { Express } from 'express';
import { TestApp, testRequest } from './setup';

describe('Health API Integration Tests', () => {
  let app: Express;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = new TestApp();
    app = await testApp.initialize();
  });

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await testRequest(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        status: 'healthy',
        version: '1.0.0',
        environment: 'development',
      });
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.uptime).toBeGreaterThan(0);
    });

    it('should have correct response headers', async () => {
      const response = await testRequest(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});
