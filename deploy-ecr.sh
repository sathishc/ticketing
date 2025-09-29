#!/bin/bash

set -e

echo "🚀 Deploying Ticketing Service with ECR..."

ENVIRONMENT=${1:-dev}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")

echo "📋 Deployment Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Account: $ACCOUNT_ID"
echo "   Region: $REGION"

# Step 1: Deploy infrastructure first (creates ECR repository)
echo "🏗️  Step 1: Deploying infrastructure..."
cd infrastructure

if [ ! -d "node_modules" ]; then
    npm install
fi

npm run build

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
        exit 1
        ;;
esac

echo "🚀 Deploying infrastructure stack: $STACK_NAME"
npx cdk deploy $STACK_NAME --require-approval never

# Get ECR repository URI from stack outputs
ECR_URI=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryURI'].OutputValue" --output text)

if [ -z "$ECR_URI" ]; then
    echo "❌ Could not get ECR repository URI from stack outputs"
    exit 1
fi

echo "✅ Infrastructure deployed successfully"
echo "📦 ECR Repository: $ECR_URI"

# Step 2: Build and push Docker image
echo "🐳 Step 2: Building and pushing Docker image..."
cd ..

# Build the application
echo "📦 Building application..."
npm run build

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URI

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t ticketing-service .

# Tag for ECR
docker tag ticketing-service:latest $ECR_URI:latest

# Push to ECR
echo "📤 Pushing to ECR..."
docker push $ECR_URI:latest

echo "✅ Docker image pushed successfully"

# Step 3: Update ECS service to use new image
echo "🔄 Step 3: Updating ECS service..."
aws ecs update-service \
    --cluster ticketing-service-cluster \
    --service ticketing-service \
    --force-new-deployment

echo "✅ ECS service updated"
echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Service Information:"
echo "   ECR Repository: $ECR_URI"
echo "   ECS Cluster: ticketing-service-cluster"
echo "   ECS Service: ticketing-service"
echo ""
echo "🔗 Check deployment status:"
echo "   ECS Console: https://console.aws.amazon.com/ecs/"
echo "   CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups/log-group/%2Fecs%2Fticketing-service"
