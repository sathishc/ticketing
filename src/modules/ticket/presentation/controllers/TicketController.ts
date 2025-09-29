import { Request, Response } from 'express';
import { CreateTicketUseCase } from '../../application/usecases/CreateTicketUseCase';
import { UpdateTicketStatusUseCase } from '../../application/usecases/UpdateTicketStatusUseCase';
import { GetTicketUseCase } from '../../application/usecases/GetTicketUseCase';
import { AssignTicketUseCase } from '../../application/usecases/AssignTicketUseCase';
import { logger } from '@shared/utils/logger';

export class TicketController {
  constructor(
    private createTicketUseCase: CreateTicketUseCase,
    private updateTicketStatusUseCase: UpdateTicketStatusUseCase,
    private getTicketUseCase: GetTicketUseCase,
    private assignTicketUseCase: AssignTicketUseCase
  ) {}

  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticket = await this.createTicketUseCase.execute(req.body);
      
      res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      logger.error('Error creating ticket:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create ticket',
      });
    }
  }

  async getTickets(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        category: req.query.category as string,
        customerId: req.query.customerId as string,
        assignedAgentId: req.query.assignedTo as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await this.getTicketUseCase.executeMany(filters);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting tickets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tickets',
      });
    }
  }

  async getTicketById(req: Request, res: Response): Promise<void> {
    try {
      const ticket = await this.getTicketUseCase.execute(req.params.id);
      
      if (!ticket) {
        res.status(404).json({
          success: false,
          error: 'Ticket not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      logger.error('Error getting ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve ticket',
      });
    }
  }

  async updateTicketStatus(req: Request, res: Response): Promise<void> {
    try {
      const ticket = await this.updateTicketStatusUseCase.execute(
        req.params.id,
        req.body
      );
      
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      logger.error('Error updating ticket status:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update ticket status',
      });
    }
  }

  async assignTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticket = await this.assignTicketUseCase.execute(
        req.params.id,
        req.body
      );
      
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      logger.error('Error assigning ticket:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign ticket',
      });
    }
  }
}
