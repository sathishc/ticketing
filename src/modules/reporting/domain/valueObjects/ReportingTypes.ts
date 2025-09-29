import { TicketStatus, TicketPriority } from '@modules/ticket/domain/entities/Ticket';

export interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  ticketsByStatus: Record<TicketStatus, number>;
  ticketsByPriority: Record<TicketPriority, number>;
}

export interface AgentPerformance {
  agentId: string;
  assignedTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  period: TimePeriod;
}

export interface TimePeriod {
  startDate: Date;
  endDate: Date;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  customerId?: string;
  agentId?: string;
}
