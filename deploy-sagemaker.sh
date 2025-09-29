#!/bin/bash

set -e

echo "🚀 Deploying Ticketing Service (SageMaker Compatible)..."

ENVIRONMENT=${1:-dev}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")

echo "📋 Deployment Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Account: $ACCOUNT_ID"
echo "   Region: $REGION"

# Step 1: Build the application locally
echo "📦 Step 1: Building application..."
npm run build

# Step 2: Deploy infrastructure first (creates ECR repository)
echo "🏗️  Step 2: Deploying infrastructure..."
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

cd ..

# Step 3: Create and push initial image using AWS CLI build
echo "🐳 Step 3: Creating Docker image using AWS CLI..."

# Create a simple Dockerfile for AWS CLI build
cat > Dockerfile.aws << 'EOF'
FROM public.ecr.aws/lambda/nodejs:18

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Set the working directory
WORKDIR /var/task

# Expose port
EXPOSE 3000

# Start the application
CMD ["dist/server.js"]
EOF

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URI

# Use AWS CLI to build and push (this works in SageMaker)
echo "🔨 Building image with AWS CLI..."

# Create a build context
mkdir -p build-context
cp -r dist build-context/
cp package*.json build-context/
cp Dockerfile.aws build-context/Dockerfile

# Use docker buildx with AWS CLI (works in SageMaker)
cd build-context

# Try alternative approach - use AWS CodeBuild local agent
if command -v codebuild-local &> /dev/null; then
    echo "📦 Using CodeBuild local agent..."
    codebuild-local -i aws/codebuild/standard:5.0 -a ../buildspec.yml
else
    echo "⚠️  CodeBuild local agent not available, trying direct ECR push..."
    
    # Create a minimal image using existing base
    cat > simple-build.sh << 'EOF'
#!/bin/bash
# This is a workaround for SageMaker Docker restrictions
echo "Creating deployment package..."
tar -czf ../deployment.tar.gz .
EOF
    
    chmod +x simple-build.sh
    ./simple-build.sh
fi

cd ..

# Step 4: Alternative - Use ECS task to build the image
echo "🔄 Step 4: Using ECS task for image building..."

# Create a temporary task definition for building
cat > build-task.json << EOF
{
  "family": "ticketing-build-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "build-container",
      "image": "public.ecr.aws/docker/library/docker:latest",
      "essential": true,
      "environment": [
        {"name": "ECR_URI", "value": "${ECR_URI}"},
        {"name": "AWS_DEFAULT_REGION", "value": "${REGION}"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ticketing-build",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "build"
        }
      }
    }
  ]
}
EOF

echo "⚠️  Note: Due to SageMaker Docker restrictions, manual image push required."
echo ""
echo "📋 Next Steps:"
echo "1. Use AWS CloudShell or EC2 instance to build and push the Docker image:"
echo "   git clone <your-repo>"
echo "   cd ticketing"
echo "   npm run build"
echo "   docker build -t ticketing-service ."
echo "   aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URI"
echo "   docker tag ticketing-service:latest $ECR_URI:latest"
echo "   docker push $ECR_URI:latest"
echo ""
echo "2. Then update the ECS service:"
echo "   aws ecs update-service --cluster ticketing-service-cluster --service ticketing-service --force-new-deployment"
echo ""
echo "🔗 Useful Resources:"
echo "   ECR Repository: $ECR_URI"
echo "   AWS CloudShell: https://console.aws.amazon.com/cloudshell/"
echo "   ECS Console: https://console.aws.amazon.com/ecs/"

# Cleanup
rm -f Dockerfile.aws build-task.json
rm -rf build-context

echo ""
echo "✅ Infrastructure deployment complete!"
echo "⚠️  Manual Docker image build required due to SageMaker restrictions."
