import { CreateTicketUseCase } from '../CreateTicketUseCase';
import { TicketPriority, TicketStatus } from '../../../domain/entities/Ticket';
import { ITicketRepository } from '@shared/interfaces/repositories/ITicketRepository';
import { IAuditService } from '@shared/interfaces/services/IAuditService';

describe('CreateTicketUseCase', () => {
  let useCase: CreateTicketUseCase;
  let mockTicketRepository: jest.Mocked<ITicketRepository>;
  let mockAuditService: jest.Mocked<IAuditService>;

  beforeEach(() => {
    mockTicketRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findByCustomerId: jest.fn(),
      findByAssignedAgent: jest.fn(),
    };

    mockAuditService = {
      recordTicketAction: jest.fn(),
    };

    useCase = new CreateTicketUseCase(mockTicketRepository, mockAuditService);
  });

  it('should create a ticket successfully', async () => {
    const request = {
      title: 'Test Ticket',
      description: 'Test Description',
      priority: TicketPriority.MEDIUM,
      category: 'Technical',
      customerId: 'customer-123',
    };

    const expectedTicket = {
      id: 'ticket-123',
      title: 'Test Ticket',
      description: 'Test Description',
      status: TicketStatus.NEW,
      priority: TicketPriority.MEDIUM,
      category: 'Technical',
      customerId: 'customer-123',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    };

    mockTicketRepository.create.mockResolvedValue(expectedTicket);

    const result = await useCase.execute(request);

    expect(result).toEqual(expectedTicket);
    expect(mockTicketRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Ticket',
        description: 'Test Description',
        status: TicketStatus.NEW,
        priority: TicketPriority.MEDIUM,
        category: 'Technical',
        customerId: 'customer-123',
      })
    );
    expect(mockAuditService.recordTicketAction).toHaveBeenCalled();
  });

  it('should throw error for invalid ticket data', async () => {
    const request = {
      title: '',
      description: 'Test Description',
      priority: TicketPriority.MEDIUM,
      category: 'Technical',
      customerId: 'customer-123',
    };

    await expect(useCase.execute(request)).rejects.toThrow('Validation failed');
    expect(mockTicketRepository.create).not.toHaveBeenCalled();
  });
});
