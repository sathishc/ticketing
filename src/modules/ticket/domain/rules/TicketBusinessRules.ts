import { Ticket, TicketStatus, TicketPriority } from '../entities/Ticket';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class TicketBusinessRules {
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
