# Business Logic Model - Ticketing Service Monolith (Pure Business Logic)

## Core Entities

### Ticket Entity
```typescript
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  customerId: string;           // External user identifier
  assignedAgentId?: string;     // External user identifier
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

enum TicketStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### TicketHistory Entity
```typescript
interface TicketHistory {
  id: string;
  ticketId: string;
  userId: string;               // External user identifier
  action: TicketAction;
  previousValue?: string;
  newValue?: string;
  comment?: string;
  timestamp: Date;
}

enum TicketAction {
  CREATED = 'created',
  STATUS_CHANGED = 'status_changed',
  ASSIGNED = 'assigned',
  COMMENT_ADDED = 'comment_added',
  PRIORITY_CHANGED = 'priority_changed',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}
```

### TicketComment Entity
```typescript
interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;               // External user identifier
  comment: string;
  isInternal: boolean;
  timestamp: Date;
}
```

## Value Objects

### TicketMetrics
```typescript
interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  ticketsByStatus: Record<TicketStatus, number>;
  ticketsByPriority: Record<TicketPriority, number>;
}
```

### AgentPerformance
```typescript
interface AgentPerformance {
  agentId: string;              // External user identifier
  assignedTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  period: TimePeriod;
}

interface TimePeriod {
  startDate: Date;
  endDate: Date;
}
```

## Business Rules

### Ticket Management Rules
```typescript
class TicketBusinessRules {
  static validateTicketCreation(ticket: Partial<Ticket>): ValidationResult {
    const errors: string[] = [];
    
    if (!ticket.title || ticket.title.trim().length === 0) {
      errors.push('Ticket title is required');
    }
    
    if (!ticket.description || ticket.description.trim().length === 0) {
      errors.push('Ticket description is required');
    }
    
    if (!ticket.customerId) {
      errors.push('Customer ID is required');
    }
    
    if (ticket.priority && !Object.values(TicketPriority).includes(ticket.priority)) {
      errors.push('Invalid ticket priority');
    }
    
    if (ticket.category && ticket.category.trim().length === 0) {
      errors.push('Category cannot be empty if provided');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  static validateStatusTransition(currentStatus: TicketStatus, newStatus: TicketStatus): boolean {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.NEW]: [TicketStatus.ASSIGNED, TicketStatus.CLOSED],
      [TicketStatus.ASSIGNED]: [TicketStatus.IN_PROGRESS, TicketStatus.PENDING, TicketStatus.CLOSED],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.PENDING, TicketStatus.RESOLVED, TicketStatus.CLOSED],
      [TicketStatus.PENDING]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
      [TicketStatus.CLOSED]: []
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
  
  static validateTicketAssignment(ticket: Ticket, agentId: string): ValidationResult {
    const errors: string[] = [];
    
    if (!agentId) {
      errors.push('Agent ID is required for assignment');
    }
    
    if (ticket.status === TicketStatus.CLOSED) {
      errors.push('Cannot assign closed tickets');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  static calculateResolutionTime(ticket: Ticket): number | null {
    if (!ticket.resolvedAt) return null;
    return ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
  }
  
  static validateComment(comment: string): ValidationResult {
    const errors: string[] = [];
    
    if (!comment || comment.trim().length === 0) {
      errors.push('Comment cannot be empty');
    }
    
    if (comment.length > 5000) {
      errors.push('Comment cannot exceed 5000 characters');
    }
    
    return { isValid: errors.length === 0, errors };
  }
}
```

### Reporting Rules
```typescript
class ReportingBusinessRules {
  static validateReportingPeriod(startDate: Date, endDate: Date): ValidationResult {
    const errors: string[] = [];
    
    if (startDate >= endDate) {
      errors.push('Start date must be before end date');
    }
    
    const maxPeriod = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (endDate.getTime() - startDate.getTime() > maxPeriod) {
      errors.push('Reporting period cannot exceed 1 year');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  static calculateTicketMetrics(tickets: Ticket[]): TicketMetrics {
    const openStatuses = [TicketStatus.NEW, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS, TicketStatus.PENDING];
    const resolvedTickets = tickets.filter(t => t.status === TicketStatus.RESOLVED);
    
    const ticketsByStatus = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<TicketStatus, number>);
    
    const ticketsByPriority = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<TicketPriority, number>);
    
    const resolutionTimes = resolvedTickets
      .map(t => this.calculateResolutionTime(t))
      .filter(time => time !== null) as number[];
    
    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;
    
    return {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => openStatuses.includes(t.status)).length,
      resolvedTickets: resolvedTickets.length,
      averageResolutionTime,
      ticketsByStatus,
      ticketsByPriority
    };
  }
  
  private static calculateResolutionTime(ticket: Ticket): number | null {
    if (!ticket.resolvedAt) return null;
    return ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
  }
}
```

## Business Events

### Domain Events
```typescript
interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  timestamp: Date;
  data: any;
}

// Ticket Events
interface TicketCreatedEvent extends DomainEvent {
  type: 'TicketCreated';
  data: {
    ticketId: string;
    customerId: string;
    title: string;
    priority: TicketPriority;
  };
}

interface TicketStatusChangedEvent extends DomainEvent {
  type: 'TicketStatusChanged';
  data: {
    ticketId: string;
    previousStatus: TicketStatus;
    newStatus: TicketStatus;
    changedBy: string;
  };
}

interface TicketAssignedEvent extends DomainEvent {
  type: 'TicketAssigned';
  data: {
    ticketId: string;
    agentId: string;
    assignedBy: string;
  };
}

interface TicketCommentAddedEvent extends DomainEvent {
  type: 'TicketCommentAdded';
  data: {
    ticketId: string;
    commentId: string;
    userId: string;
    isInternal: boolean;
  };
}

interface TicketResolvedEvent extends DomainEvent {
  type: 'TicketResolved';
  data: {
    ticketId: string;
    resolvedBy: string;
    resolutionTime: number;
  };
}
```

## Validation Types

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface BusinessRuleResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: string[];
}
```

## Business Invariants

### System-Wide Invariants
1. **Ticket Ownership**: Every ticket must have a valid customer ID
2. **Status Consistency**: Ticket status transitions must follow defined workflow
3. **Agent Assignment**: Agent ID must be provided for assignment operations
4. **Audit Trail**: All ticket changes must be recorded in history
5. **Data Integrity**: All timestamps must be consistent and logical
6. **Comment Validation**: All comments must be non-empty and within length limits
7. **Resolution Tracking**: Resolved tickets must have resolution timestamp
8. **Priority Consistency**: Ticket priority must be valid enum value

## Request/Response Types

### Ticket Operations
```typescript
interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  customerId: string;
}

interface UpdateTicketStatusRequest {
  status: TicketStatus;
  comment?: string;
  userId: string;
}

interface AssignTicketRequest {
  agentId: string;
  assignedBy: string;
}

interface AddCommentRequest {
  comment: string;
  isInternal: boolean;
  userId: string;
}
```

### Reporting Operations
```typescript
interface ReportFilters {
  startDate: Date;
  endDate: Date;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  customerId?: string;
  agentId?: string;
}

interface TicketSearchFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  customerId?: string;
  assignedAgentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

## Pure Business Logic Focus

This model now focuses exclusively on:
- ✅ **Ticket Management**: Core ticket operations and lifecycle
- ✅ **Business Rules**: Validation and workflow enforcement
- ✅ **Reporting Logic**: Metrics calculation and data aggregation
- ✅ **Audit Trail**: Change tracking and history
- ✅ **Data Validation**: Input validation and business constraints

### Removed Completely:
- ❌ **Authentication Logic**: No login, logout, or token management
- ❌ **Authorization Rules**: No role-based access control
- ❌ **User Management**: No user entities or user operations
- ❌ **Session Management**: No session tracking or validation
- ❌ **Permission Checking**: No access control logic
