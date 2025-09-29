# SageMaker Deployment Guide

## Docker Build Restrictions in SageMaker

SageMaker environments have Docker build restrictions that prevent local Docker builds with the error:
```
{"message":"Forbidden. Reason: [ImageBuild] 'sagemaker' is the only user allowed network input"}
```

This guide provides multiple solutions to deploy your ticketing service from SageMaker.

## Solution 1: Infrastructure-Only Deployment (Recommended)

Deploy the infrastructure first, then build the Docker image externally.

### Step 1: Deploy Infrastructure
```bash
./deploy-sagemaker.sh dev
```

This will:
- Build the TypeScript application
- Deploy AWS infrastructure (VPC, ECS, DynamoDB, ECR, ALB)
- Create ECR repository for your Docker images
- Provide instructions for manual image build

### Step 2: Build Docker Image Externally

Choose one of these options:

#### Option A: AWS CloudShell (Easiest)
1. Open [AWS CloudShell](https://console.aws.amazon.com/cloudshell/)
2. Clone your repository:
   ```bash
   git clone <your-repo-url>
   cd ticketing
   ```
3. Build and push:
   ```bash
   npm install
   npm run build
   
   # Get ECR URI from CloudFormation outputs
   ECR_URI=$(aws cloudformation describe-stacks --stack-name TicketingServiceStack-Dev --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryURI'].OutputValue" --output text)
   
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI
   
   # Build and push
   docker build -t ticketing-service .
   docker tag ticketing-service:latest $ECR_URI:latest
   docker push $ECR_URI:latest
   ```

#### Option B: EC2 Instance
1. Launch an EC2 instance with Docker installed
2. Follow the same steps as CloudShell

#### Option C: Local Development Machine
If you have Docker installed locally:
```bash
# Configure AWS CLI with your credentials
aws configure

# Follow the same build and push steps
```

### Step 3: Deploy to ECS
After pushing the image, update the ECS service:
```bash
aws ecs update-service \
    --cluster ticketing-service-cluster \
    --service ticketing-service \
    --force-new-deployment
```

## Solution 2: CodeBuild Integration

Use AWS CodeBuild to build Docker images automatically.

### Prerequisites
- Source code in a Git repository (GitHub, CodeCommit, etc.)

### Step 1: Update Infrastructure
The CDK stack includes a CodeBuild project. Deploy it:
```bash
cd infrastructure
npx cdk deploy TicketingServiceStack-Dev --require-approval never
```

### Step 2: Trigger CodeBuild
```bash
# Get CodeBuild project name
PROJECT_NAME=$(aws cloudformation describe-stacks --stack-name TicketingServiceStack-Dev --query "Stacks[0].Outputs[?OutputKey=='CodeBuildProjectName'].OutputValue" --output text)

# Start build (requires source in Git repository)
aws codebuild start-build --project-name $PROJECT_NAME
```

## Solution 3: GitHub Actions / CI/CD

Set up automated deployment using GitHub Actions:

### .github/workflows/deploy.yml
```yaml
name: Deploy Ticketing Service

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build application
        run: npm run build
      
      - name: Deploy infrastructure
        run: |
          cd infrastructure
          npm install
          npm run build
          npx cdk deploy TicketingServiceStack-Dev --require-approval never
      
      - name: Build and push Docker image
        run: |
          ECR_URI=$(aws cloudformation describe-stacks --stack-name TicketingServiceStack-Dev --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryURI'].OutputValue" --output text)
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI
          docker build -t ticketing-service .
          docker tag ticketing-service:latest $ECR_URI:latest
          docker push $ECR_URI:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster ticketing-service-cluster \
            --service ticketing-service \
            --force-new-deployment
```

## Verification

After deployment, verify the service:

### Check ECS Service Status
```bash
aws ecs describe-services \
    --cluster ticketing-service-cluster \
    --services ticketing-service
```

### Test Health Endpoint
```bash
# Get ALB DNS name
ALB_DNS=$(aws cloudformation describe-stacks --stack-name TicketingServiceStack-Dev --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" --output text)

# Test health endpoint
curl http://$ALB_DNS/api/v1/health
```

### Check Logs
```bash
aws logs tail /ecs/ticketing-service --follow
```

## Troubleshooting

### Common Issues

1. **ECS Service Not Starting**
   - Check CloudWatch logs: `/ecs/ticketing-service`
   - Verify ECR image exists and is accessible
   - Check task definition environment variables

2. **Health Check Failures**
   - Ensure application starts on port 3000
   - Verify `/api/v1/health` endpoint responds with 200

3. **Database Connection Issues**
   - Check DynamoDB table names in environment variables
   - Verify ECS task role has DynamoDB permissions

### Useful Commands

```bash
# Check stack outputs
aws cloudformation describe-stacks --stack-name TicketingServiceStack-Dev

# Check ECS task logs
aws ecs describe-tasks --cluster ticketing-service-cluster --tasks $(aws ecs list-tasks --cluster ticketing-service-cluster --service-name ticketing-service --query 'taskArns[0]' --output text)

# Force new deployment
aws ecs update-service --cluster ticketing-service-cluster --service ticketing-service --force-new-deployment

# Check ECR images
aws ecr describe-images --repository-name ticketing-service
```

## Cost Optimization

- Use Fargate Spot for non-production environments
- Set appropriate auto-scaling policies
- Use DynamoDB on-demand billing for variable workloads
- Consider using Application Load Balancer with multiple target groups for blue/green deployments

## Security Best Practices

- Use least-privilege IAM roles
- Enable VPC Flow Logs
- Use AWS Secrets Manager for sensitive configuration
- Enable CloudTrail for audit logging
- Use HTTPS with SSL/TLS certificates (add to ALB listener)
