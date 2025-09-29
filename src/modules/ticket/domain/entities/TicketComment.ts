export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  comment: string;
  isInternal: boolean;
  timestamp: Date;
}
