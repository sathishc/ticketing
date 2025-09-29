import Joi from 'joi';
import { TicketPriority, TicketStatus } from '../../domain/entities/Ticket';

export const createTicketSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().min(1).max(5000).required(),
  priority: Joi.string().valid(...Object.values(TicketPriority)).required(),
  category: Joi.string().trim().min(1).max(100).required(),
  customerId: Joi.string().trim().min(1).required(),
});

export const updateTicketStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(TicketStatus)).required(),
  comment: Joi.string().trim().max(1000).optional(),
  userId: Joi.string().trim().min(1).required(),
});

export const assignTicketSchema = Joi.object({
  agentId: Joi.string().trim().min(1).required(),
  assignedBy: Joi.string().trim().min(1).required(),
});
