# Ticketing Service

A comprehensive support/help desk ticketing system built with TypeScript, Express.js, and AWS services. This monolithic application follows Clean Architecture principles and is designed to handle large-scale operations with detailed analytics and comprehensive user management.

## Features

### Core Functionality
- **Ticket Management**: Create, assign, track, and manage support tickets through their complete lifecycle
- **User Management**: Role-based access control for Customers, Agents, and Administrators
- **Analytics & Reporting**: Comprehensive ticket analytics and performance metrics
- **Audit Trail**: Complete history tracking for all ticket changes and user actions
- **Priority & Category Management**: Flexible ticket classification and prioritization

### Technical Features
- **Clean Architecture**: Modular design with clear separation of concerns
- **AWS Integration**: DynamoDB for data persistence, with deployment options for ECS, CodeBuild, and SageMaker
- **RESTful API**: Comprehensive REST API with proper error handling and validation
- **Security**: Helmet.js security headers, CORS configuration, and role-based permissions
- **Testing**: Unit and integration tests with Jest
- **Monitoring**: Winston logging and health check endpoints

## Architecture

The application follows Clean Architecture principles with the following structure:

```
src/
├── modules/           # Business logic modules (tickets, users, analytics)
├── shared/           # Shared utilities and infrastructure
│   ├── domain/       # Domain entities and value objects
│   ├── infrastructure/ # External service integrations
│   ├── interfaces/   # Controllers and route handlers
│   └── application/  # Use cases and business logic
└── __tests__/        # Test files
```

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: AWS DynamoDB
- **Testing**: Jest with Supertest
- **Security**: Helmet.js, CORS
- **Validation**: Joi
- **Logging**: Winston
- **Build**: TypeScript compiler with ts-node-dev for development

## Getting Started

### Prerequisites
- Node.js 18+ 
- AWS CLI configured (for deployment)
- Docker (for containerized deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ticketing

# Install dependencies
npm install

# Build the application
npm run build
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

The service provides RESTful endpoints for:

- **Tickets**: CRUD operations, status updates, assignment management
- **Users**: Authentication, profile management, role-based access
- **Analytics**: Ticket metrics, performance reports, dashboard data
- **Health**: Service health checks and monitoring

## Deployment Options

The application supports multiple deployment strategies:

### Local Development
```bash
# Using Docker Compose
docker-compose up

# Using local deployment script
./deploy-local.sh
```

### AWS Deployment
- **ECS**: Container-based deployment with auto-scaling
- **CodeBuild**: CI/CD pipeline integration
- **SageMaker**: ML-enhanced deployment for analytics
- **ECR**: Container registry for image management

See deployment documentation:
- [General Deployment Guide](DEPLOYMENT.md)
- [ECR Deployment](DEPLOY-ECR.md)
- [SageMaker Deployment](SAGEMAKER-DEPLOYMENT.md)

## Configuration

The application uses environment variables for configuration:

```bash
PORT=3000
NODE_ENV=production
AWS_REGION=us-east-1
DYNAMODB_TABLE_PREFIX=ticketing
```

## Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Contributing

1. Follow the existing code structure and Clean Architecture principles
2. Write tests for new features
3. Use TypeScript strict mode
4. Follow the established naming conventions
5. Update documentation for API changes

## License

This project is licensed under the MIT License.

## Project Structure

```
ticketing/
├── src/                    # Source code
├── dist/                   # Compiled JavaScript
├── infrastructure/         # AWS infrastructure code
├── aidlc-docs/            # Project documentation and requirements
├── coverage/              # Test coverage reports
├── Dockerfile             # Container configuration
├── docker-compose.yml     # Local development setup
├── buildspec.yml          # AWS CodeBuild configuration
└── deploy-*.sh           # Deployment scripts
```

## Health Check

The service provides health check endpoints:
- `GET /health` - Basic health status
- `GET /health/detailed` - Detailed system status

## Monitoring

- Winston logging with configurable levels
- Request/response logging middleware
- Error tracking and reporting
- Performance metrics collection
