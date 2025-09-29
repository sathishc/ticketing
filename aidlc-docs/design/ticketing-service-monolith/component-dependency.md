# Component Dependencies - Ticketing Service Monolith

## Dependency Overview

The component dependencies follow Clean Architecture principles with strict dependency direction from outer layers to inner layers.

```
Presentation → Application → Domain ← Infrastructure
```

## Inter-Module Dependencies

### Module Dependency Matrix

| Module | User Management | Ticket Management | Reporting & Analytics | Shared Services |
|--------|----------------|-------------------|---------------------|-----------------|
| **User Management** | - | Provides IUserRepository | Provides IUserRepository | Uses shared services |
| **Ticket Management** | Uses IUserRepository | - | Provides ITicketRepository | Uses shared services |
| **Reporting & Analytics** | Uses IUserRepository | Uses ITicketRepository | - | Uses shared services |
| **Shared Services** | Used by all | Used by all | Used by all | - |

### Dependency Flow Diagram

```
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ User Management │    │ Ticket Management   │    │ Reporting &         │
│                 │    │                     │    │ Analytics           │
│ - AuthController│    │ - TicketController  │    │ - ReportController  │
│ - UserController│    │ - CreateTicketUC    │    │ - DashboardUC       │
│ - LoginUseCase  │    │ - AssignTicketUC    │    │ - AgentPerfUC       │
│ - CreateUserUC  │    │ - UpdateStatusUC    │    │ - TicketReportUC    │
└─────────┬───────┘    └─────────┬───────────┘    └─────────┬───────────┘
          │                      │                          │
          │ provides             │ provides                 │ uses both
          │ IUserRepository      │ ITicketRepository        │ repositories
          │                      │                          │
          ▼                      ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Shared Services                               │
│                                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│ │TokenService │ │PasswordSvc  │ │ AuditSvc    │ │ ValidationService   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘ │
│                                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│ │ Middleware  │ │ DynamoDB    │ │ Error       │ │ Dependency          │ │
│ │ Components  │ │ Client      │ │ Handlers    │ │ Container           │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Layer Dependencies

### Presentation Layer Dependencies

#### Controllers → Use Cases
```typescript
// User Management Controllers
AuthController → LoginUseCase, LogoutUseCase, GetCurrentUserUseCase
UserController → CreateUserUseCase, GetUserUseCase, UpdateUserUseCase, GetUsersUseCase

// Ticket Management Controllers  
TicketController → CreateTicketUseCase, GetTicketUseCase, UpdateTicketStatusUseCase, 
                  AssignTicketUseCase, GetTicketHistoryUseCase, AddCommentUseCase

// Reporting Controllers
ReportingController → GetDashboardMetricsUseCase, GetAgentPerformanceUseCase, 
                     GenerateTicketReportUseCase
```

#### Controllers → Middleware
```typescript
// All controllers depend on:
AuthenticationMiddleware    // JWT token validation
AuthorizationMiddleware    // Role-based access control
ValidationMiddleware       // Request validation
ErrorHandlingMiddleware   // Error response formatting
```

### Application Layer Dependencies

#### Use Cases → Repositories
```typescript
// User Management Use Cases
LoginUseCase → IUserRepository, ISessionRepository
CreateUserUseCase → IUserRepository
GetUserUseCase → IUserRepository
UpdateUserUseCase → IUserRepository

// Ticket Management Use Cases
CreateTicketUseCase → ITicketRepository, IUserRepository
UpdateTicketStatusUseCase → ITicketRepository
AssignTicketUseCase → ITicketRepository, IUserRepository
GetTicketUseCase → ITicketRepository
GetTicketHistoryUseCase → ITicketHistoryRepository

// Reporting Use Cases
GetDashboardMetricsUseCase → ITicketRepository, IUserRepository
GetAgentPerformanceUseCase → ITicketRepository, IUserRepository
GenerateTicketReportUseCase → ITicketRepository, IUserRepository
```

#### Use Cases → Services
```typescript
// Authentication Use Cases
LoginUseCase → IPasswordService, ITokenService
LogoutUseCase → ITokenService

// Ticket Use Cases
CreateTicketUseCase → IAuditService, IValidationService
UpdateTicketStatusUseCase → IAuditService, IValidationService
AssignTicketUseCase → IAuditService, IValidationService

// User Use Cases
CreateUserUseCase → IPasswordService, IValidationService
UpdateUserUseCase → IValidationService

// Reporting Use Cases
GetDashboardMetricsUseCase → IMetricsService
GetAgentPerformanceUseCase → IMetricsService
```

### Infrastructure Layer Dependencies

#### Repositories → Database Client
```typescript
DynamoUserRepository → DynamoDBClient
DynamoTicketRepository → DynamoDBClient
DynamoTicketHistoryRepository → DynamoDBClient
DynamoSessionRepository → DynamoDBClient
```

#### Services → External Dependencies
```typescript
TokenService → jsonwebtoken library
PasswordService → bcrypt library
AuditService → ITicketHistoryRepository
ValidationService → joi library
MetricsService → ITicketRepository, IUserRepository
```

## Cross-Module Communication Patterns

### User Management → Ticket Management
```typescript
// Ticket module uses User module interfaces
interface TicketModuleDependencies {
  userRepository: IUserRepository;  // Validate customer/agent existence
  // Used in: CreateTicketUseCase, AssignTicketUseCase
}

// Example usage in Ticket module
class CreateTicketUseCase {
  async execute(ticketData: CreateTicketRequest, customerId: string): Promise<Ticket> {
    // Validate customer exists
    const customer = await this.userRepository.findById(customerId);
    if (!customer || customer.role !== UserRole.CUSTOMER) {
      throw new Error('Invalid customer');
    }
    
    // Create ticket logic...
  }
}
```

### Ticket Management → User Management
```typescript
// User module provides validation for ticket operations
interface UserModuleDependencies {
  // No direct dependencies - User module is foundational
}

// Ticket module validates permissions through User module
class AssignTicketUseCase {
  async execute(ticketId: string, agentId: string): Promise<Ticket> {
    // Validate agent exists and has correct role
    const agent = await this.userRepository.findById(agentId);
    if (!agent || agent.role !== UserRole.AGENT || !agent.isActive) {
      throw new Error('Invalid agent for assignment');
    }
    
    // Assignment logic...
  }
}
```

### Reporting → User Management & Ticket Management
```typescript
// Reporting module aggregates data from both modules
interface ReportingModuleDependencies {
  userRepository: IUserRepository;    // Agent information
  ticketRepository: ITicketRepository; // Ticket data
}

class GetAgentPerformanceUseCase {
  async execute(period: TimePeriod, agentId?: string): Promise<AgentPerformance[]> {
    // Get agents
    const agents = agentId 
      ? [await this.userRepository.findById(agentId)]
      : await this.userRepository.findMany({ role: UserRole.AGENT });
    
    // Get tickets for each agent
    const performance = await Promise.all(
      agents.map(async (agent) => {
        const tickets = await this.ticketRepository.findByAssignedAgent(agent.id);
        return this.metricsService.calculateAgentPerformance(agent.id, period);
      })
    );
    
    return performance;
  }
}
```

## Shared Service Dependencies

### Authentication Flow Dependencies
```typescript
// Authentication middleware dependency chain
Request → AuthenticationMiddleware → TokenService → JWT Library
       → UserRepository → DynamoDBClient → AWS SDK
```

### Audit Trail Dependencies
```typescript
// Audit service dependency chain
Use Case → AuditService → TicketHistoryRepository → DynamoDBClient → AWS SDK
```

### Validation Dependencies
```typescript
// Validation middleware dependency chain
Request → ValidationMiddleware → ValidationService → Joi Library
       → Business Rules → Domain Entities
```

## Database Dependencies

### Table Relationships
```typescript
// DynamoDB table dependencies
Users Table ← Sessions Table (userId foreign key)
Users Table ← Tickets Table (customerId, assignedAgentId foreign keys)
Tickets Table ← TicketHistory Table (ticketId foreign key)
```

### Repository Access Patterns
```typescript
// Repository dependency on table structure
interface DynamoDBTableDependencies {
  Users: {
    partitionKey: 'id',
    sortKey: null,
    gsi1: 'username-index',
    gsi2: 'email-index'
  },
  Tickets: {
    partitionKey: 'id',
    sortKey: null,
    gsi1: 'customerId-createdAt-index',
    gsi2: 'assignedAgentId-status-index',
    gsi3: 'status-priority-index'
  },
  TicketHistory: {
    partitionKey: 'ticketId',
    sortKey: 'timestamp',
    gsi1: 'userId-timestamp-index'
  },
  Sessions: {
    partitionKey: 'id',
    sortKey: null,
    gsi1: 'token-index',
    gsi2: 'userId-index'
  }
}
```

## Dependency Injection Configuration

### Container Registration Order
```typescript
class Container {
  async initialize(): Promise<void> {
    // 1. Register infrastructure dependencies first
    this.registerDatabaseClient();
    
    // 2. Register repositories
    this.registerRepositories();
    
    // 3. Register shared services
    this.registerSharedServices();
    
    // 4. Register use cases
    this.registerUseCases();
    
    // 5. Register controllers
    this.registerControllers();
    
    // 6. Register middleware
    this.registerMiddleware();
  }
  
  private registerRepositories(): void {
    this.register('userRepository', () => 
      new DynamoUserRepository(this.resolve('dynamoClient'))
    );
    this.register('ticketRepository', () => 
      new DynamoTicketRepository(this.resolve('dynamoClient'))
    );
    this.register('ticketHistoryRepository', () => 
      new DynamoTicketHistoryRepository(this.resolve('dynamoClient'))
    );
    this.register('sessionRepository', () => 
      new DynamoSessionRepository(this.resolve('dynamoClient'))
    );
  }
  
  private registerUseCases(): void {
    // User Management Use Cases
    this.register('loginUseCase', () => 
      new LoginUseCase(
        this.resolve('userRepository'),
        this.resolve('sessionRepository'),
        this.resolve('passwordService'),
        this.resolve('tokenService')
      )
    );
    
    // Ticket Management Use Cases
    this.register('createTicketUseCase', () => 
      new CreateTicketUseCase(
        this.resolve('ticketRepository'),
        this.resolve('userRepository'),
        this.resolve('auditService')
      )
    );
    
    // Reporting Use Cases
    this.register('getDashboardMetricsUseCase', () => 
      new GetDashboardMetricsUseCase(
        this.resolve('ticketRepository'),
        this.resolve('metricsService')
      )
    );
  }
}
```

## Error Handling Dependencies

### Error Propagation Chain
```typescript
// Error flows from inner layers to outer layers
Domain Layer Error → Application Layer → Presentation Layer → HTTP Response

// Example error handling dependency
class CreateTicketUseCase {
  async execute(ticketData: CreateTicketRequest): Promise<Ticket> {
    try {
      // Domain validation
      const validationResult = TicketBusinessRules.validateTicketCreation(ticketData);
      if (!validationResult.isValid) {
        throw new ValidationError(validationResult.errors);
      }
      
      // Repository operation
      return await this.ticketRepository.create(ticket);
    } catch (error) {
      // Error bubbles up to controller, then to error middleware
      throw error;
    }
  }
}
```

## Testing Dependencies

### Test Dependency Isolation
```typescript
// Unit tests mock external dependencies
describe('CreateTicketUseCase', () => {
  let useCase: CreateTicketUseCase;
  let mockTicketRepository: jest.Mocked<ITicketRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockAuditService: jest.Mocked<IAuditService>;
  
  beforeEach(() => {
    mockTicketRepository = createMockTicketRepository();
    mockUserRepository = createMockUserRepository();
    mockAuditService = createMockAuditService();
    
    useCase = new CreateTicketUseCase(
      mockTicketRepository,
      mockUserRepository,
      mockAuditService
    );
  });
});
```

## Performance Considerations

### Dependency Optimization
- **Lazy Loading**: Use cases instantiated only when needed
- **Connection Pooling**: Single DynamoDB client instance shared across repositories
- **Caching**: Repository-level caching for frequently accessed data
- **Async Operations**: All repository operations are asynchronous
- **Batch Operations**: Group related database operations when possible
