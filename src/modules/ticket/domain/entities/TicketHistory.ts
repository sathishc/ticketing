export enum TicketAction {
  CREATED = 'created',
  STATUS_CHANGED = 'status_changed',
  ASSIGNED = 'assigned',
  COMMENT_ADDED = 'comment_added',
  PRIORITY_CHANGED = 'priority_changed',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  userId: string;
  action: TicketAction;
  previousValue?: string;
  newValue?: string;
  comment?: string;
  timestamp: Date;
}
