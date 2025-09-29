import { DynamoDBClientWrapper } from '@shared/database/DynamoDBClient';
import { DynamoTicketRepository } from '@modules/ticket/infrastructure/repositories/DynamoTicketRepository';
import { DynamoTicketHistoryRepository } from '@modules/ticket/infrastructure/repositories/DynamoTicketHistoryRepository';
import { CreateTicketUseCase } from '@modules/ticket/application/usecases/CreateTicketUseCase';
import { UpdateTicketStatusUseCase } from '@modules/ticket/application/usecases/UpdateTicketStatusUseCase';
import { GetTicketUseCase } from '@modules/ticket/application/usecases/GetTicketUseCase';
import { AssignTicketUseCase } from '@modules/ticket/application/usecases/AssignTicketUseCase';
import { TicketController } from '@modules/ticket/presentation/controllers/TicketController';
import { AuditService } from '@shared/services/AuditService';

export class Container {
  private services = new Map<string, any>();

  async initialize(): Promise<void> {
    this.registerDatabase();
    this.registerRepositories();
    this.registerServices();
    this.registerUseCases();
    this.registerControllers();
  }

  private registerDatabase(): void {
    this.register('dynamoClient', () => new DynamoDBClientWrapper());
  }

  private registerRepositories(): void {
    this.register('ticketRepository', () => 
      new DynamoTicketRepository((this.resolve('dynamoClient') as DynamoDBClientWrapper).getDocumentClient())
    );
    
    this.register('ticketHistoryRepository', () => 
      new DynamoTicketHistoryRepository((this.resolve('dynamoClient') as DynamoDBClientWrapper).getDocumentClient())
    );
  }

  private registerServices(): void {
    this.register('auditService', () => 
      new AuditService(this.resolve('ticketHistoryRepository'))
    );
  }

  private registerUseCases(): void {
    this.register('createTicketUseCase', () => 
      new CreateTicketUseCase(
        this.resolve('ticketRepository'),
        this.resolve('auditService')
      )
    );

    this.register('updateTicketStatusUseCase', () => 
      new UpdateTicketStatusUseCase(
        this.resolve('ticketRepository'),
        this.resolve('auditService')
      )
    );

    this.register('getTicketUseCase', () => 
      new GetTicketUseCase(this.resolve('ticketRepository'))
    );

    this.register('assignTicketUseCase', () => 
      new AssignTicketUseCase(
        this.resolve('ticketRepository'),
        this.resolve('auditService')
      )
    );
  }

  private registerControllers(): void {
    this.register('ticketController', () => 
      new TicketController(
        this.resolve('createTicketUseCase'),
        this.resolve('updateTicketStatusUseCase'),
        this.resolve('getTicketUseCase'),
        this.resolve('assignTicketUseCase')
      )
    );
  }

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory);
  }

  resolve<T>(name: string): T {
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not found`);
    }
    return factory();
  }
}
