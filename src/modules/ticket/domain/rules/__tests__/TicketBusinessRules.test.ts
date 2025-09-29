import { TicketBusinessRules } from '../TicketBusinessRules';
import { TicketStatus, TicketPriority } from '../../entities/Ticket';

describe('TicketBusinessRules', () => {
  describe('validateTicketCreation', () => {
    it('should validate a valid ticket', () => {
      const ticket = {
        title: 'Test Ticket',
        description: 'Test Description',
        customerId: 'customer-123',
        priority: TicketPriority.MEDIUM,
        category: 'Technical'
      };

      const result = TicketBusinessRules.validateTicketCreation(ticket);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject ticket without title', () => {
      const ticket = {
        title: '',
        description: 'Test Description',
        customerId: 'customer-123',
        priority: TicketPriority.MEDIUM,
        category: 'Technical'
      };

      const result = TicketBusinessRules.validateTicketCreation(ticket);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ticket title is required');
    });

    it('should reject ticket without description', () => {
      const ticket = {
        title: 'Test Ticket',
        description: '',
        customerId: 'customer-123',
        priority: TicketPriority.MEDIUM,
        category: 'Technical'
      };

      const result = TicketBusinessRules.validateTicketCreation(ticket);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ticket description is required');
    });

    it('should reject ticket without customerId', () => {
      const ticket = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: TicketPriority.MEDIUM,
        category: 'Technical'
      };

      const result = TicketBusinessRules.validateTicketCreation(ticket);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer ID is required');
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow valid status transitions', () => {
      expect(TicketBusinessRules.validateStatusTransition(TicketStatus.NEW, TicketStatus.ASSIGNED)).toBe(true);
      expect(TicketBusinessRules.validateStatusTransition(TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS)).toBe(true);
      expect(TicketBusinessRules.validateStatusTransition(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED)).toBe(true);
      expect(TicketBusinessRules.validateStatusTransition(TicketStatus.RESOLVED, TicketStatus.CLOSED)).toBe(true);
    });

    it('should reject invalid status transitions', () => {
      expect(TicketBusinessRules.validateStatusTransition(TicketStatus.NEW, TicketStatus.RESOLVED)).toBe(false);
      expect(TicketBusinessRules.validateStatusTransition(TicketStatus.CLOSED, TicketStatus.NEW)).toBe(false);
      expect(TicketBusinessRules.validateStatusTransition(TicketStatus.RESOLVED, TicketStatus.NEW)).toBe(false);
    });
  });

  describe('validateComment', () => {
    it('should validate a valid comment', () => {
      const result = TicketBusinessRules.validateComment('This is a valid comment');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty comment', () => {
      const result = TicketBusinessRules.validateComment('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Comment cannot be empty');
    });

    it('should reject comment that is too long', () => {
      const longComment = 'a'.repeat(5001);
      const result = TicketBusinessRules.validateComment(longComment);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Comment cannot exceed 5000 characters');
    });
  });
});
