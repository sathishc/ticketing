# Component Architecture - Ticketing Service Monolith (Pure Business Logic)

## Clean Architecture Overview

The ticketing service follows Clean Architecture principles with clear separation of concerns and dependency inversion.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   REST API  │  │  Middleware │  │  Error Handlers     │  │
│  │ Controllers │  │ (Validation)│  │                     │  │
│  │             │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Use Cases │  │   Services  │  │    Interfaces       │  │
│  │             │  │             │  │  (Repositories)     │  │
│  │             │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Entities   │  │ Business    │  │    Value Objects    │  │
│  │             │  │   Rules     │  │                     │  │
│  │             │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Repositories│  │   Database  │  │   External APIs     │  │
│  │             │  │   (DynamoDB)│  │                     │  │
│  │             │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Module Organization

### Ticket Management Module

#### Presentation Layer
```typescript
// src/modules/ticket/controllers/
class TicketController {
  constructor(
    private createTicketUseCase: CreateTicketUseCase,
    private getTicketUseCase: GetTicketUseCase,
    private updateTicketStatusUseCase: UpdateTicketStatusUseCase,
    private assignTicketUseCase: AssignTicketUseCase,
    private addCommentUseCase: AddCommentUseCase
  ) {}
  
  async createTicket(req: Request, res: Response): Promise<void>
  async getTickets(req: Request, res: Response): Promise<void>
  async getTicketById(req: Request, res: Response): Promise<void>
  async updateTicketStatus(req: Request, res: Response): Promise<void>
  async assignTicket(req: Request, res: Response): Promise<void>
  async getTicketHistory(req: Request, res: Response): Promise<void>
  async addComment(req: Request, res: Response): Promise<void>
  async getComments(req: Request, res: Response): Promise<void>
}
```

#### Application Layer
```typescript
// src/modules/ticket/usecases/
class CreateTicketUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private auditService: IAuditService
  ) {}
  
  async execute(ticketData: CreateTicketRequest): Promise<Ticket>
}

class UpdateTicketStatusUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private auditService: IAuditService
  ) {}
  
  async execute(ticketId: string, newStatus: TicketStatus, userId: string, comment?: string): Promise<Ticket>
}

class AssignTicketUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private auditService: IAuditService
  ) {}
  
  async execute(ticketId: string, agentId: string, assignedBy: string): Promise<Ticket>
}

class AddCommentUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private commentRepository: ITicketCommentRepository,
    private auditService: IAuditService
  ) {}
  
  async execute(ticketId: string, commentData: AddCommentRequest): Promise<TicketComment>
}
```

#### Domain Layer
```typescript
// src/modules/ticket/domain/
// Entities and business rules (from business-logic-model.md)
export { Ticket, TicketStatus, TicketPriority } from './entities/Ticket'
export { TicketHistory, TicketAction } from './entities/TicketHistory'
export { TicketComment } from './entities/TicketComment'
export { TicketBusinessRules } from './rules/TicketBusinessRules'
```

#### Infrastructure Layer
```typescript
// src/modules/ticket/repositories/
class DynamoTicketRepository implements ITicketRepository {
  constructor(private dynamoClient: DynamoDBClient) {}
  
  async create(ticket: Ticket): Promise<Ticket>
  async findById(id: string): Promise<Ticket | null>
  async update(ticket: Ticket): Promise<Ticket>
  async findMany(filters: TicketFilters): Promise<PaginatedResult<Ticket>>
  async findByCustomerId(customerId: string): Promise<Ticket[]>
  async findByAssignedAgent(agentId: string): Promise<Ticket[]>
}

class DynamoTicketHistoryRepository implements ITicketHistoryRepository {
  constructor(private dynamoClient: DynamoDBClient) {}
  
  async create(historyEntry: TicketHistory): Promise<TicketHistory>
  async findByTicketId(ticketId: string): Promise<TicketHistory[]>
}

class DynamoTicketCommentRepository implements ITicketCommentRepository {
  constructor(private dynamoClient: DynamoDBClient) {}
  
  async create(comment: TicketComment): Promise<TicketComment>
  async findByTicketId(ticketId: string): Promise<TicketComment[]>
}
```

### Reporting & Analytics Module

#### Presentation Layer
```typescript
// src/modules/reporting/controllers/
class ReportingController {
  constructor(
    private getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
    private getAgentPerformanceUseCase: GetAgentPerformanceUseCase,
    private generateTicketReportUseCase: GenerateTicketReportUseCase,
    private getCategoryReportUseCase: GetCategoryReportUseCase
  ) {}
  
  async getDashboardMetrics(req: Request, res: Response): Promise<void>
  async getAgentPerformance(req: Request, res: Response): Promise<void>
  async generateTicketReport(req: Request, res: Response): Promise<void>
  async getCategoryReport(req: Request, res: Response): Promise<void>
}
```

#### Application Layer
```typescript
// src/modules/reporting/usecases/
class GetDashboardMetricsUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private metricsService: IMetricsService
  ) {}
  
  async execute(filters: MetricsFilters): Promise<DashboardMetrics>
}

class GetAgentPerformanceUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private metricsService: IMetricsService
  ) {}
  
  async execute(period: TimePeriod, agentId?: string): Promise<AgentPerformance[]>
}

class GenerateTicketReportUseCase {
  constructor(
    private ticketRepository: ITicketRepository,
    private reportingService: IReportingService
  ) {}
  
  async execute(filters: ReportFilters): Promise<TicketReport>
}
```

## Shared Components

### Middleware Components
```typescript
// src/shared/middleware/
class ValidationMiddleware {
  static validateRequest(schema: JSONSchema) {
    return (req: Request, res: Response, next: NextFunction) => void
  }
}

class ErrorHandlingMiddleware {
  static handleError(error: Error, req: Request, res: Response, next: NextFunction): void
}

class RequestLoggingMiddleware {
  static logRequest(req: Request, res: Response, next: NextFunction): void
}
```

### Shared Services
```typescript
// src/shared/services/
class AuditService implements IAuditService {
  constructor(private historyRepository: ITicketHistoryRepository) {}
  
  async recordTicketAction(ticketId: string, action: TicketAction, userId: string, details: any): Promise<void>
}

class ValidationService {
  validateTicketData(ticket: Partial<Ticket>): ValidationResult
  validateComment(comment: string): ValidationResult
  validateDateRange(startDate: Date, endDate: Date): ValidationResult
}

class MetricsService implements IMetricsService {
  constructor(private ticketRepository: ITicketRepository) {}
  
  async calculateTicketMetrics(filters: MetricsFilters): Promise<TicketMetrics>
  async calculateAgentPerformance(agentId: string, period: TimePeriod): Promise<AgentPerformance>
}
```

### Database Components
```typescript
// src/shared/database/
class DynamoDBClient {
  constructor(private config: DynamoDBConfig) {}
  
  async get(params: GetItemInput): Promise<GetItemOutput>
  async put(params: PutItemInput): Promise<PutItemOutput>
  async update(params: UpdateItemInput): Promise<UpdateItemOutput>
  async query(params: QueryInput): Promise<QueryOutput>
  async scan(params: ScanInput): Promise<ScanOutput>
}

class DatabaseMigrations {
  async createTables(): Promise<void>
  async createIndexes(): Promise<void>
}
```

## Component Interfaces

### Repository Interfaces
```typescript
// src/shared/interfaces/repositories/
interface ITicketRepository {
  create(ticket: Ticket): Promise<Ticket>
  findById(id: string): Promise<Ticket | null>
  update(ticket: Ticket): Promise<Ticket>
  findMany(filters: TicketFilters): Promise<PaginatedResult<Ticket>>
  findByCustomerId(customerId: string): Promise<Ticket[]>
  findByAssignedAgent(agentId: string): Promise<Ticket[]>
}

interface ITicketHistoryRepository {
  create(historyEntry: TicketHistory): Promise<TicketHistory>
  findByTicketId(ticketId: string): Promise<TicketHistory[]>
}

interface ITicketCommentRepository {
  create(comment: TicketComment): Promise<TicketComment>
  findByTicketId(ticketId: string): Promise<TicketComment[]>
}
```

### Service Interfaces
```typescript
// src/shared/interfaces/services/
interface IAuditService {
  recordTicketAction(ticketId: string, action: TicketAction, userId: string, details: any): Promise<void>
}

interface IMetricsService {
  calculateTicketMetrics(filters: MetricsFilters): Promise<TicketMetrics>
  calculateAgentPerformance(agentId: string, period: TimePeriod): Promise<AgentPerformance>
}

interface IReportingService {
  generateTicketReport(filters: ReportFilters): Promise<TicketReport>
  generateCategoryReport(period: TimePeriod): Promise<CategoryReport>
}
```

## Dependency Injection Container

```typescript
// src/shared/container/Container.ts
class Container {
  private services = new Map<string, any>()
  
  register<T>(name: string, factory: () => T): void
  resolve<T>(name: string): T
  
  // Module registration
  registerTicketModule(): void
  registerReportingModule(): void
  registerSharedServices(): void
}
```

## Application Bootstrap

```typescript
// src/app.ts
class Application {
  private container: Container
  private express: Express
  
  constructor() {
    this.container = new Container()
    this.express = express()
  }
  
  async initialize(): Promise<void> {
    await this.setupDatabase()
    this.registerModules()
    this.setupMiddleware()
    this.setupRoutes()
    this.setupErrorHandling()
  }
  
  private registerModules(): void {
    this.container.registerTicketModule()
    this.container.registerReportingModule()
    this.container.registerSharedServices()
  }
  
  private setupRoutes(): void {
    this.express.use('/api/v1/tickets', this.createTicketRoutes())
    this.express.use('/api/v1/reports', this.createReportingRoutes())
    this.express.use('/api/v1/health', this.createHealthRoutes())
    this.express.use('/api/v1/metrics', this.createMetricsRoutes())
  }
  
  private setupMiddleware(): void {
    this.express.use(express.json())
    this.express.use(RequestLoggingMiddleware.logRequest)
    this.express.use(ValidationMiddleware.validateRequest)
  }
  
  private setupErrorHandling(): void {
    this.express.use(ErrorHandlingMiddleware.handleError)
  }
}
```

## Pure Business Logic Focus

This architecture focuses exclusively on:
- ✅ **Ticket Management**: Core ticket operations and lifecycle
- ✅ **Reporting & Analytics**: Metrics calculation and data aggregation  
- ✅ **Audit Trail**: Change tracking and history
- ✅ **Data Validation**: Input validation and business constraints
- ✅ **Error Handling**: Business rule violations and validation errors

### Completely Removed:
- ❌ **User Management Module**: No user entities, controllers, or use cases
- ❌ **Authentication Components**: No login, logout, or token services
- ❌ **Authorization Middleware**: No role-based access control
- ❌ **Session Management**: No session repositories or services
- ❌ **Password Services**: No password hashing or validation
