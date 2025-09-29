# ECR Deployment Guide for Restricted Environments

## 🚀 ECR-Based Deployment (Docker Build Restrictions)

Since Docker builds are restricted in this environment, use this ECR-based approach:

### 📋 **Deployment Process:**

**Step 1: Deploy Infrastructure (Creates ECR Repository)**
```bash
cd infrastructure
npx cdk deploy TicketingServiceStack-Dev
```

**Step 2: Build and Push Image (External Environment)**
```bash
# In an environment with Docker access:

# Get ECR URI from CDK outputs
ECR_URI="<account-id>.dkr.ecr.<region>.amazonaws.com/ticketing-service"

# Build and push
npm run build
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI
docker build -t ticketing-service .
docker tag ticketing-service:latest $ECR_URI:latest
docker push $ECR_URI:latest
```

**Step 3: Update ECS Service**
```bash
aws ecs update-service \
    --cluster ticketing-service-cluster \
    --service ticketing-service \
    --force-new-deployment
```

### 🔧 **Alternative: Use CodeBuild for Docker Build**

Create a CodeBuild project to build and push your Docker image:

**buildspec.yml** (already exists in your project):
```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - npm run build
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
  post_build:
    commands:
      - echo Build completed on `date`
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
```

### 🎯 **What's Fixed:**

**✅ ECR Integration:**
- CDK creates ECR repository automatically
- ECS uses `fromEcrRepository()` instead of local build
- Proper image scanning and security

**✅ Service Code Integration:**
- Your complete service code gets built into the Docker image
- All dependencies and business logic included
- Proper production configuration

**✅ Deployment Workflow:**
1. **Infrastructure First**: CDK creates ECR + ECS + DynamoDB
2. **Image Build**: Docker image built with your service code
3. **Image Push**: Pushed to ECR repository
4. **Service Update**: ECS pulls and runs your service

### 🌐 **Service Endpoints After Deployment:**

Once deployed with your service code:
- `GET /api/v1/health` - Health monitoring
- `POST /api/v1/tickets` - Create tickets
- `GET /api/v1/tickets` - List tickets
- `PUT /api/v1/tickets/:id/status` - Update status
- `PUT /api/v1/tickets/:id/assign` - Assign tickets

**Your ticketing service will now properly run your actual business logic in production!**
