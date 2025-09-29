# API Specification - Ticketing Service Monolith (Pure Business Logic)

## Base Configuration

**Base URL**: `https://api.ticketing-service.com/v1`  
**Content-Type**: `application/json`  
**API Version**: v1  
**Authentication**: Handled externally (not part of this service)

## Ticket Management Endpoints

### POST /tickets
Create new ticket.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "low|medium|high|urgent",
  "category": "string",
  "customerId": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "new",
    "priority": "low|medium|high|urgent",
    "category": "string",
    "customerId": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /tickets
Get list of tickets.

**Query Parameters:**
- `status`: Filter by ticket status
- `priority`: Filter by priority
- `assignedTo`: Filter by assigned agent ID
- `customerId`: Filter by customer ID
- `category`: Filter by category
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search in title and description

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "status": "new|assigned|in_progress|pending|resolved|closed",
        "priority": "low|medium|high|urgent",
        "category": "string",
        "customerId": "string",
        "assignedAgentId": "string",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### GET /tickets/:id
Get ticket by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "new|assigned|in_progress|pending|resolved|closed",
    "priority": "low|medium|high|urgent",
    "category": "string",
    "customerId": "string",
    "assignedAgentId": "string",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "resolvedAt": "2024-01-01T00:00:00Z",
    "closedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /tickets/:id/status
Update ticket status.

**Request Body:**
```json
{
  "status": "assigned|in_progress|pending|resolved|closed",
  "comment": "string",
  "userId": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "assigned|in_progress|pending|resolved|closed",
    "updatedAt": "2024-01-01T00:00:00Z",
    "updatedBy": "string"
  }
}
```

### PUT /tickets/:id/assign
Assign ticket to agent.

**Request Body:**
```json
{
  "agentId": "string",
  "assignedBy": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "assignedAgentId": "string",
    "status": "assigned",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /tickets/:id/history
Get ticket history.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "string",
        "action": "created|status_changed|assigned|comment_added",
        "userId": "string",
        "previousValue": "string",
        "newValue": "string",
        "comment": "string",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /tickets/:id/comments
Add comment to ticket.

**Request Body:**
```json
{
  "comment": "string",
  "isInternal": false,
  "userId": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "comment": "string",
    "userId": "string",
    "isInternal": false,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### GET /tickets/:id/comments
Get ticket comments.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "string",
        "comment": "string",
        "userId": "string",
        "isInternal": false,
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

## Reporting Endpoints

### GET /reports/dashboard
Get dashboard metrics.

**Query Parameters:**
- `period`: Time period (today|week|month|quarter|year)
- `agentId`: Filter by agent ID (for agent-specific metrics)
- `customerId`: Filter by customer ID
- `startDate`: Custom start date (ISO 8601)
- `endDate`: Custom end date (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTickets": 1000,
    "openTickets": 150,
    "resolvedTickets": 800,
    "closedTickets": 50,
    "averageResolutionTime": 86400000,
    "ticketsByStatus": {
      "new": 50,
      "assigned": 30,
      "in_progress": 40,
      "pending": 20,
      "resolved": 10
    },
    "ticketsByPriority": {
      "low": 400,
      "medium": 300,
      "high": 200,
      "urgent": 100
    },
    "period": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    }
  }
}
```

### GET /reports/agents
Get agent performance report.

**Query Parameters:**
- `period`: Time period (week|month|quarter|year)
- `agentId`: Specific agent ID (optional)
- `startDate`: Custom start date (ISO 8601)
- `endDate`: Custom end date (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "agentId": "string",
        "assignedTickets": 50,
        "resolvedTickets": 45,
        "averageResolutionTime": 86400000,
        "resolutionRate": 0.9
      }
    ],
    "period": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    }
  }
}
```

### GET /reports/tickets
Generate ticket report.

**Query Parameters:**
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)
- `status`: Filter by status
- `priority`: Filter by priority
- `category`: Filter by category
- `customerId`: Filter by customer ID
- `agentId`: Filter by agent ID
- `format`: Response format (json|csv)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "string",
        "title": "string",
        "status": "string",
        "priority": "string",
        "category": "string",
        "customerId": "string",
        "assignedAgentId": "string",
        "createdAt": "2024-01-01T00:00:00Z",
        "resolvedAt": "2024-01-01T00:00:00Z",
        "resolutionTime": 86400000
      }
    ],
    "summary": {
      "totalTickets": 100,
      "averageResolutionTime": 86400000,
      "resolutionRate": 0.85
    }
  }
}
```

### GET /reports/categories
Get ticket categories report.

**Query Parameters:**
- `period`: Time period (week|month|quarter|year)
- `startDate`: Custom start date (ISO 8601)
- `endDate`: Custom end date (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "Technical Issue",
        "totalTickets": 150,
        "resolvedTickets": 120,
        "averageResolutionTime": 86400000,
        "resolutionRate": 0.8
      }
    ],
    "period": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    }
  }
}
```

## Utility Endpoints

### GET /health
Health check endpoint.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### GET /metrics
Basic service metrics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTickets": 1000,
    "activeTickets": 150,
    "uptime": 86400,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `INVALID_STATUS_TRANSITION`: Ticket status transition not allowed
- `DUPLICATE_RESOURCE`: Resource already exists
- `BUSINESS_RULE_VIOLATION`: Business rule validation failed
- `INVALID_DATE_RANGE`: Invalid date range for reporting
- `COMMENT_TOO_LONG`: Comment exceeds maximum length
- `EMPTY_COMMENT`: Comment cannot be empty

## Request Validation

### Ticket Creation Validation
- `title`: Required, non-empty string
- `description`: Required, non-empty string
- `priority`: Must be valid enum value
- `category`: Optional, non-empty string if provided
- `customerId`: Required, non-empty string

### Status Update Validation
- `status`: Must be valid enum value
- `userId`: Required for audit trail
- Status transition must be valid according to business rules

### Comment Validation
- `comment`: Required, 1-5000 characters
- `userId`: Required for audit trail
- `isInternal`: Boolean flag

### Reporting Validation
- Date ranges cannot exceed 1 year
- Start date must be before end date
- Period parameters must be valid enum values

## Pure Business Logic Focus

This API focuses exclusively on:
- ✅ **Ticket Operations**: CRUD operations and lifecycle management
- ✅ **Business Logic**: Status transitions, validation, and rules
- ✅ **Reporting**: Metrics, analytics, and data aggregation
- ✅ **Audit Trail**: Change tracking and history
- ✅ **Data Integrity**: Validation and consistency

### External Responsibilities (Not Handled):
- ❌ **Authentication**: User login/logout handled externally
- ❌ **Authorization**: Access control handled by external service
- ❌ **User Management**: User CRUD operations handled externally
- ❌ **Session Management**: Token validation handled externally
- ❌ **Rate Limiting**: Request throttling handled by API gateway
- ❌ **CORS**: Cross-origin handling managed by infrastructure
