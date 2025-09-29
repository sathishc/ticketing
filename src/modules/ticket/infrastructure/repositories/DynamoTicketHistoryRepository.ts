import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { TicketHistory } from '../../domain/entities/TicketHistory';
import { ITicketHistoryRepository } from '@shared/interfaces/repositories/ITicketHistoryRepository';
import { v4 as uuidv4 } from 'uuid';

export class DynamoTicketHistoryRepository implements ITicketHistoryRepository {
  private tableName: string;

  constructor(private docClient: DynamoDBDocumentClient) {
    this.tableName = process.env.TICKET_HISTORY_TABLE_NAME || 'ticketing-ticket-history';
  }

  async create(historyEntry: TicketHistory): Promise<TicketHistory> {
    const newEntry: TicketHistory = {
      ...historyEntry,
      id: uuidv4(),
      timestamp: new Date(),
    };

    await this.docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: newEntry,
    }));

    return newEntry;
  }

  async findByTicketId(ticketId: string): Promise<TicketHistory[]> {
    const result = await this.docClient.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'ticketId = :ticketId',
      ExpressionAttributeValues: {
        ':ticketId': ticketId,
      },
      ScanIndexForward: false, // Most recent first
    }));

    return result.Items as TicketHistory[] || [];
  }
}
