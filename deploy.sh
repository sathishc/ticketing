#!/bin/bash

set -e

echo "🚀 Deploying Ticketing Service with CDK..."

# Build the application first
echo "📦 Building application..."
npm run build

# Navigate to infrastructure directory
cd infrastructure

# Install CDK dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing CDK dependencies..."
    npm install
fi

# Build CDK
echo "🔨 Building CDK..."
npm run build

# Deploy based on environment (default to dev)
ENVIRONMENT=${1:-dev}

case $ENVIRONMENT in
    dev|development)
        STACK_NAME="TicketingServiceStack-Dev"
        ;;
    staging)
        STACK_NAME="TicketingServiceStack-Staging"
        ;;
    prod|production)
        STACK_NAME="TicketingServiceStack-Prod"
        ;;
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        echo "Valid options: dev, staging, prod"
        exit 1
        ;;
esac

echo "🚀 Deploying to $ENVIRONMENT environment..."
echo "📋 Stack: $STACK_NAME"

# Deploy the stack
npx cdk deploy $STACK_NAME --require-approval never

echo "✅ Deployment complete!"
echo ""
echo "🔗 Check the CloudFormation outputs for:"
echo "   - Load Balancer DNS"
echo "   - Service URL"
echo "   - Health Check URL"
echo ""
echo "📊 Monitor the deployment:"
echo "   - ECS Console: https://console.aws.amazon.com/ecs/"
echo "   - CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups/log-group/%2Fecs%2Fticketing-service"
