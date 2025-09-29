import request from 'supertest';
import { Express } from 'express';
import { Container } from '@shared/container/Container';
import { resetRepositories } from './shared-setup';

export class TestApp {
  private app!: Express;
  private container!: Container;

  async initialize(): Promise<Express> {
    // Force test mode for shared mock repositories
    process.env.NODE_ENV = 'test';
    
    this.container = new Container();
    await this.container.initialize();

    // Import app after container is ready
    const { createApp } = await import('../../app');
    this.app = createApp(this.container);
    
    return this.app;
  }

  getApp(): Express {
    return this.app;
  }

  getContainer(): Container {
    return this.container;
  }

  resetData(): void {
    resetRepositories();
  }
}

export const testRequest = (app: Express) => request(app);
