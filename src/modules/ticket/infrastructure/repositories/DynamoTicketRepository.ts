import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Ticket } from '../../domain/entities/Ticket';
import { ITicketRepository, TicketFilters, PaginatedResult } from '@shared/interfaces/repositories/ITicketRepository';
import { v4 as uuidv4 } from 'uuid';

export class DynamoTicketRepository implements ITicketRepository {
  private tableName: string;

  constructor(private docClient: DynamoDBDocumentClient) {
    this.tableName = process.env.TICKETS_TABLE_NAME || 'ticketing-tickets';
  }

  async create(ticket: Ticket): Promise<Ticket> {
    const newTicket: Ticket = {
      ...ticket,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: newTicket,
    }));

    return newTicket;
  }

  async findById(id: string): Promise<Ticket | null> {
    const result = await this.docClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { id },
    }));

    return result.Item as Ticket || null;
  }

  async update(ticket: Ticket): Promise<Ticket> {
    const updatedTicket = {
      ...ticket,
      updatedAt: new Date(),
    };

    await this.docClient.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id: ticket.id },
      UpdateExpression: 'SET title = :title, description = :description, #status = :status, priority = :priority, category = :category, assignedAgentId = :assignedAgentId, updatedAt = :updatedAt, resolvedAt = :resolvedAt, closedAt = :closedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':title': updatedTicket.title,
        ':description': updatedTicket.description,
        ':status': updatedTicket.status,
        ':priority': updatedTicket.priority,
        ':category': updatedTicket.category,
        ':assignedAgentId': updatedTicket.assignedAgentId,
        ':updatedAt': updatedTicket.updatedAt,
        ':resolvedAt': updatedTicket.resolvedAt,
        ':closedAt': updatedTicket.closedAt,
      },
    }));

    return updatedTicket;
  }

  async findMany(filters: TicketFilters): Promise<PaginatedResult<Ticket>> {
    const limit = filters.limit || 20;
    const page = filters.page || 1;

    let filterExpression = '';
    let expressionAttributeValues: any = {};
    let expressionAttributeNames: any = {};

    if (filters.status) {
      filterExpression += '#status = :status';
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = filters.status;
    }

    if (filters.priority) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += 'priority = :priority';
      expressionAttributeValues[':priority'] = filters.priority;
    }

    if (filters.category) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += 'category = :category';
      expressionAttributeValues[':category'] = filters.category;
    }

    const result = await this.docClient.send(new ScanCommand({
      TableName: this.tableName,
      FilterExpression: filterExpression || undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      Limit: limit,
    }));

    const items = result.Items as Ticket[] || [];
    const total = result.Count || 0;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCustomerId(customerId: string): Promise<Ticket[]> {
    const result = await this.docClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'customerId-createdAt-index',
      KeyConditionExpression: 'customerId = :customerId',
      ExpressionAttributeValues: {
        ':customerId': customerId,
      },
    }));

    return result.Items as Ticket[] || [];
  }

  async findByAssignedAgent(agentId: string): Promise<Ticket[]> {
    const result = await this.docClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'assignedAgentId-status-index',
      KeyConditionExpression: 'assignedAgentId = :agentId',
      ExpressionAttributeValues: {
        ':agentId': agentId,
      },
    }));

    return result.Items as Ticket[] || [];
  }
}
