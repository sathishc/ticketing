#!/bin/bash

set -e

echo "🚀 Deploying Ticketing Service with CodeBuild..."

ENVIRONMENT=${1:-dev}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")

echo "📋 Deployment Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Account: $ACCOUNT_ID"
echo "   Region: $REGION"

# Step 1: Deploy infrastructure first (creates ECR repository and CodeBuild project)
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

# Get outputs from stack
ECR_URI=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryURI'].OutputValue" --output text)
CODEBUILD_PROJECT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CodeBuildProjectName'].OutputValue" --output text)

if [ -z "$ECR_URI" ]; then
    echo "❌ Could not get ECR repository URI from stack outputs"
    exit 1
fi

echo "✅ Infrastructure deployed successfully"
echo "📦 ECR Repository: $ECR_URI"
echo "🔨 CodeBuild Project: $CODEBUILD_PROJECT"

# Step 2: Trigger CodeBuild to build and push Docker image
echo "🐳 Step 2: Triggering CodeBuild..."
cd ..

# Create a zip file of the source code
echo "📦 Packaging source code..."
zip -r source.zip . -x "node_modules/*" "dist/*" "coverage/*" ".git/*" "*.log"

# Upload to S3 (CodeBuild needs source from S3)
S3_BUCKET="codebuild-source-$ACCOUNT_ID-$REGION"
S3_KEY="ticketing-service/source-$(date +%s).zip"

# Create S3 bucket if it doesn't exist
aws s3 mb s3://$S3_BUCKET 2>/dev/null || true

echo "📤 Uploading source to S3..."
aws s3 cp source.zip s3://$S3_BUCKET/$S3_KEY

# Start CodeBuild
echo "🔨 Starting CodeBuild..."
BUILD_ID=$(aws codebuild start-build \
    --project-name $CODEBUILD_PROJECT \
    --source-location s3://$S3_BUCKET/$S3_KEY \
    --query 'build.id' --output text)

echo "📋 Build ID: $BUILD_ID"
echo "🔄 Waiting for build to complete..."

# Wait for build to complete
while true; do
    BUILD_STATUS=$(aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].buildStatus' --output text)
    
    case $BUILD_STATUS in
        SUCCEEDED)
            echo "✅ Build completed successfully"
            break
            ;;
        FAILED|FAULT|STOPPED|TIMED_OUT)
            echo "❌ Build failed with status: $BUILD_STATUS"
            echo "🔗 Check logs: https://console.aws.amazon.com/codesuite/codebuild/projects/$CODEBUILD_PROJECT/build/$BUILD_ID"
            exit 1
            ;;
        IN_PROGRESS)
            echo "⏳ Build in progress..."
            sleep 30
            ;;
        *)
            echo "📋 Build status: $BUILD_STATUS"
            sleep 10
            ;;
    esac
done

# Step 3: Update ECS service to use new image
echo "🔄 Step 3: Updating ECS service..."
aws ecs update-service \
    --cluster ticketing-service-cluster \
    --service ticketing-service \
    --force-new-deployment

echo "✅ ECS service updated"

# Cleanup
rm -f source.zip

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Service Information:"
echo "   ECR Repository: $ECR_URI"
echo "   ECS Cluster: ticketing-service-cluster"
echo "   ECS Service: ticketing-service"
echo "   Build ID: $BUILD_ID"
echo ""
echo "🔗 Useful Links:"
echo "   ECS Console: https://console.aws.amazon.com/ecs/"
echo "   CodeBuild Logs: https://console.aws.amazon.com/codesuite/codebuild/projects/$CODEBUILD_PROJECT/build/$BUILD_ID"
echo "   CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups/log-group/%2Fecs%2Fticketing-service"
