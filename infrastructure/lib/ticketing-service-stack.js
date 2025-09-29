"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketingServiceStack = void 0;
const cdk = require("aws-cdk-lib");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const ecs = require("aws-cdk-lib/aws-ecs");
const ec2 = require("aws-cdk-lib/aws-ec2");
const elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const iam = require("aws-cdk-lib/aws-iam");
const logs = require("aws-cdk-lib/aws-logs");
const ecr = require("aws-cdk-lib/aws-ecr");
const codebuild = require("aws-cdk-lib/aws-codebuild");
const s3 = require("aws-cdk-lib/aws-s3");
class TicketingServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // ECR Repository for the service
        const repository = new ecr.Repository(this, 'TicketingRepository', {
            repositoryName: 'ticketing-service',
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            imageScanOnPush: true,
        });
        // CodeBuild project for building Docker images
        const buildProject = new codebuild.Project(this, 'TicketingBuildProject', {
            projectName: 'ticketing-service-build',
            source: codebuild.Source.s3({
                bucket: s3.Bucket.fromBucketName(this, 'SourceBucket', `codebuild-source-${this.account}-${this.region}`),
                path: 'ticketing-service/',
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
                environmentVariables: {
                    AWS_DEFAULT_REGION: {
                        value: this.region,
                    },
                    AWS_ACCOUNT_ID: {
                        value: this.account,
                    },
                    IMAGE_REPO_NAME: {
                        value: repository.repositoryName,
                    },
                },
            },
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
        });
        // Grant CodeBuild permissions to push to ECR
        repository.grantPullPush(buildProject);
        // VPC for the service
        const vpc = new ec2.Vpc(this, 'TicketingVPC', {
            maxAzs: 2,
            natGateways: 1,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'Private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
            ],
        });
        // DynamoDB Tables
        const ticketsTable = new dynamodb.Table(this, 'TicketsTable', {
            tableName: 'ticketing-tickets',
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // GSI for customer tickets
        ticketsTable.addGlobalSecondaryIndex({
            indexName: 'customerId-createdAt-index',
            partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
        });
        // GSI for agent tickets
        ticketsTable.addGlobalSecondaryIndex({
            indexName: 'assignedAgentId-status-index',
            partitionKey: { name: 'assignedAgentId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'status', type: dynamodb.AttributeType.STRING },
        });
        const ticketHistoryTable = new dynamodb.Table(this, 'TicketHistoryTable', {
            tableName: 'ticketing-ticket-history',
            partitionKey: { name: 'ticketId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        const ticketCommentsTable = new dynamodb.Table(this, 'TicketCommentsTable', {
            tableName: 'ticketing-ticket-comments',
            partitionKey: { name: 'ticketId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // ECS Cluster
        const cluster = new ecs.Cluster(this, 'TicketingCluster', {
            vpc,
            clusterName: 'ticketing-service-cluster',
            containerInsights: true,
        });
        // Task Definition
        const taskDefinition = new ecs.FargateTaskDefinition(this, 'TicketingTaskDef', {
            memoryLimitMiB: 1024,
            cpu: 512,
        });
        // Task Role for DynamoDB access
        taskDefinition.taskRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
        // Log Group
        const logGroup = new logs.LogGroup(this, 'TicketingLogGroup', {
            logGroupName: '/ecs/ticketing-service',
            retention: logs.RetentionDays.ONE_WEEK,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Container Definition - Use ECR repository
        const container = taskDefinition.addContainer('TicketingContainer', {
            image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: 'ticketing-service',
                logGroup,
            }),
            environment: {
                NODE_ENV: 'production',
                PORT: '3000',
                TICKETS_TABLE_NAME: ticketsTable.tableName,
                TICKET_HISTORY_TABLE_NAME: ticketHistoryTable.tableName,
                TICKET_COMMENTS_TABLE_NAME: ticketCommentsTable.tableName,
                AWS_REGION: this.region,
            },
        });
        container.addPortMappings({
            containerPort: 3000,
            protocol: ecs.Protocol.TCP,
        });
        // ECS Service
        const service = new ecs.FargateService(this, 'TicketingService', {
            cluster,
            taskDefinition,
            serviceName: 'ticketing-service',
            desiredCount: 2,
            assignPublicIp: false,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            healthCheckGracePeriod: cdk.Duration.seconds(60),
        });
        // Auto Scaling
        const scaling = service.autoScaleTaskCount({
            minCapacity: 2,
            maxCapacity: 10,
        });
        scaling.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 70,
            scaleInCooldown: cdk.Duration.seconds(300),
            scaleOutCooldown: cdk.Duration.seconds(300),
        });
        // Application Load Balancer
        const alb = new elbv2.ApplicationLoadBalancer(this, 'TicketingALB', {
            vpc,
            internetFacing: true,
            loadBalancerName: 'ticketing-service-alb',
        });
        const listener = alb.addListener('TicketingListener', {
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
        });
        const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TicketingTargetGroup', {
            vpc,
            port: 3000,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targetType: elbv2.TargetType.IP,
            healthCheck: {
                enabled: true,
                path: '/api/v1/health',
                healthyHttpCodes: '200',
                interval: cdk.Duration.seconds(30),
                timeout: cdk.Duration.seconds(5),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 3,
            },
        });
        listener.addTargetGroups('TicketingTargetGroups', {
            targetGroups: [targetGroup],
        });
        service.attachToApplicationTargetGroup(targetGroup);
        // Grant DynamoDB permissions
        ticketsTable.grantReadWriteData(taskDefinition.taskRole);
        ticketHistoryTable.grantReadWriteData(taskDefinition.taskRole);
        ticketCommentsTable.grantReadWriteData(taskDefinition.taskRole);
        // Outputs
        new cdk.CfnOutput(this, 'ECRRepositoryURI', {
            value: repository.repositoryUri,
            description: 'ECR Repository URI for pushing images',
        });
        new cdk.CfnOutput(this, 'CodeBuildProjectName', {
            value: buildProject.projectName,
            description: 'CodeBuild project name for building Docker images',
        });
        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
            value: alb.loadBalancerDnsName,
            description: 'DNS name of the load balancer',
        });
        new cdk.CfnOutput(this, 'ServiceURL', {
            value: `http://${alb.loadBalancerDnsName}`,
            description: 'URL of the ticketing service',
        });
        new cdk.CfnOutput(this, 'HealthCheckURL', {
            value: `http://${alb.loadBalancerDnsName}/api/v1/health`,
            description: 'Health check endpoint',
        });
        new cdk.CfnOutput(this, 'TicketsTableName', {
            value: ticketsTable.tableName,
            description: 'Name of the tickets DynamoDB table',
        });
    }
}
exports.TicketingServiceStack = TicketingServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGlja2V0aW5nLXNlcnZpY2Utc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0aWNrZXRpbmctc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMscURBQXFEO0FBQ3JELDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsZ0VBQWdFO0FBQ2hFLDJDQUEyQztBQUMzQyw2Q0FBNkM7QUFDN0MsMkNBQTJDO0FBQzNDLHVEQUF1RDtBQUN2RCx5Q0FBeUM7QUFHekMsTUFBYSxxQkFBc0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNsRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLGlDQUFpQztRQUNqQyxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ2pFLGNBQWMsRUFBRSxtQkFBbUI7WUFDbkMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTTtZQUN2QyxlQUFlLEVBQUUsSUFBSTtTQUN0QixDQUFDLENBQUM7UUFFSCwrQ0FBK0M7UUFDL0MsTUFBTSxZQUFZLEdBQUcsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUN4RSxXQUFXLEVBQUUseUJBQXlCO1lBQ3RDLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsb0JBQW9CLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN6RyxJQUFJLEVBQUUsb0JBQW9CO2FBQzNCLENBQUM7WUFDRixXQUFXLEVBQUU7Z0JBQ1gsVUFBVSxF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QUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ3pDLEtBQUssRUFBRSxHQUFHLENBQUMsbUJBQW1CO1lBQzlCLFdBQVcsRUFBRSwrQkFBK0I7U0FDN0MsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDcEMsS0FBSyxFQUFFLFVBQVUsR0FBRyxDQUFDLG1CQUFtQixFQUFFO1lBQzFDLFdBQVcsRUFBRSw4QkFBOEI7U0FDNUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN4QyxLQUFLLEVBQUUsVUFBVSxHQUFHLENBQUMsbUJBQW1CLGdCQUFnQjtZQUN4RCxXQUFXLEVBQUUsdUJBQXVCO1NBQ3JDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDMUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxTQUFTO1lBQzdCLFdBQVcsRUFBRSxvQ0FBb0M7U0FDbEQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBblBELHNEQW1QQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgZWNzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgKiBhcyBlY3IgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcic7XG5pbXBvcnQgKiBhcyBjb2RlYnVpbGQgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVidWlsZCc7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBjbGFzcyBUaWNrZXRpbmdTZXJ2aWNlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBFQ1IgUmVwb3NpdG9yeSBmb3IgdGhlIHNlcnZpY2VcbiAgICBjb25zdCByZXBvc2l0b3J5ID0gbmV3IGVjci5SZXBvc2l0b3J5KHRoaXMsICdUaWNrZXRpbmdSZXBvc2l0b3J5Jywge1xuICAgICAgcmVwb3NpdG9yeU5hbWU6ICd0aWNrZXRpbmctc2VydmljZScsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXG4gICAgICBpbWFnZVNjYW5PblB1c2g6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBDb2RlQnVpbGQgcHJvamVjdCBmb3IgYnVpbGRpbmcgRG9ja2VyIGltYWdlc1xuICAgIGNvbnN0IGJ1aWxkUHJvamVjdCA9IG5ldyBjb2RlYnVpbGQuUHJvamVjdCh0aGlzLCAnVGlja2V0aW5nQnVpbGRQcm9qZWN0Jywge1xuICAgICAgcHJvamVjdE5hbWU6ICd0aWNrZXRpbmctc2VydmljZS1idWlsZCcsXG4gICAgICBzb3VyY2U6IGNvZGVidWlsZC5Tb3VyY2UuczMoe1xuICAgICAgICBidWNrZXQ6IHMzLkJ1Y2tldC5mcm9tQnVja2V0TmFtZSh0aGlzLCAnU291cmNlQnVja2V0JywgYGNvZGVidWlsZC1zb3VyY2UtJHt0aGlzLmFjY291bnR9LSR7dGhpcy5yZWdpb259YCksXG4gICAgICAgIHBhdGg6ICd0aWNrZXRpbmctc2VydmljZS8nLFxuICAgICAgfSksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBidWlsZEltYWdlOiBjb2RlYnVpbGQuTGludXhCdWlsZEltYWdlLlNUQU5EQVJEXzVfMCxcbiAgICAgICAgcHJpdmlsZWdlZDogdHJ1ZSwgLy8gUmVxdWlyZWQgZm9yIERvY2tlciBidWlsZHNcbiAgICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXM6IHtcbiAgICAgICAgICBBV1NfREVGQVVMVF9SRUdJT046IHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnJlZ2lvbixcbiAgICAgICAgICB9LFxuICAgICAgICAgIEFXU19BQ0NPVU5UX0lEOiB7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5hY2NvdW50LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgSU1BR0VfUkVQT19OQU1FOiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVwb3NpdG9yeS5yZXBvc2l0b3J5TmFtZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGJ1aWxkU3BlYzogY29kZWJ1aWxkLkJ1aWxkU3BlYy5mcm9tU291cmNlRmlsZW5hbWUoJ2J1aWxkc3BlYy55bWwnKSxcbiAgICB9KTtcblxuICAgIC8vIEdyYW50IENvZGVCdWlsZCBwZXJtaXNzaW9ucyB0byBwdXNoIHRvIEVDUlxuICAgIHJlcG9zaXRvcnkuZ3JhbnRQdWxsUHVzaChidWlsZFByb2plY3QpO1xuXG4gICAgLy8gVlBDIGZvciB0aGUgc2VydmljZVxuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsICdUaWNrZXRpbmdWUEMnLCB7XG4gICAgICBtYXhBenM6IDIsXG4gICAgICBuYXRHYXRld2F5czogMSxcbiAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAge1xuICAgICAgICAgIGNpZHJNYXNrOiAyNCxcbiAgICAgICAgICBuYW1lOiAnUHVibGljJyxcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgICAgbmFtZTogJ1ByaXZhdGUnLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBSSVZBVEVfV0lUSF9FR1JFU1MsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgLy8gRHluYW1vREIgVGFibGVzXG4gICAgY29uc3QgdGlja2V0c1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdUaWNrZXRzVGFibGUnLCB7XG4gICAgICB0YWJsZU5hbWU6ICd0aWNrZXRpbmctdGlja2V0cycsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2lkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlLFxuICAgICAgZW5jcnlwdGlvbjogZHluYW1vZGIuVGFibGVFbmNyeXB0aW9uLkFXU19NQU5BR0VELFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgIH0pO1xuXG4gICAgLy8gR1NJIGZvciBjdXN0b21lciB0aWNrZXRzXG4gICAgdGlja2V0c1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcbiAgICAgIGluZGV4TmFtZTogJ2N1c3RvbWVySWQtY3JlYXRlZEF0LWluZGV4JyxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnY3VzdG9tZXJJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBzb3J0S2V5OiB7IG5hbWU6ICdjcmVhdGVkQXQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgIH0pO1xuXG4gICAgLy8gR1NJIGZvciBhZ2VudCB0aWNrZXRzXG4gICAgdGlja2V0c1RhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KHtcbiAgICAgIGluZGV4TmFtZTogJ2Fzc2lnbmVkQWdlbnRJZC1zdGF0dXMtaW5kZXgnLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdhc3NpZ25lZEFnZW50SWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgc29ydEtleTogeyBuYW1lOiAnc3RhdHVzJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHRpY2tldEhpc3RvcnlUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnVGlja2V0SGlzdG9yeVRhYmxlJywge1xuICAgICAgdGFibGVOYW1lOiAndGlja2V0aW5nLXRpY2tldC1oaXN0b3J5JyxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAndGlja2V0SWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgc29ydEtleTogeyBuYW1lOiAndGltZXN0YW1wJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlLFxuICAgICAgZW5jcnlwdGlvbjogZHluYW1vZGIuVGFibGVFbmNyeXB0aW9uLkFXU19NQU5BR0VELFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgIH0pO1xuXG4gICAgY29uc3QgdGlja2V0Q29tbWVudHNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnVGlja2V0Q29tbWVudHNUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogJ3RpY2tldGluZy10aWNrZXQtY29tbWVudHMnLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICd0aWNrZXRJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBzb3J0S2V5OiB7IG5hbWU6ICd0aW1lc3RhbXAnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcbiAgICAgIHBvaW50SW5UaW1lUmVjb3Zlcnk6IHRydWUsXG4gICAgICBlbmNyeXB0aW9uOiBkeW5hbW9kYi5UYWJsZUVuY3J5cHRpb24uQVdTX01BTkFHRUQsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXG4gICAgfSk7XG5cbiAgICAvLyBFQ1MgQ2x1c3RlclxuICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgZWNzLkNsdXN0ZXIodGhpcywgJ1RpY2tldGluZ0NsdXN0ZXInLCB7XG4gICAgICB2cGMsXG4gICAgICBjbHVzdGVyTmFtZTogJ3RpY2tldGluZy1zZXJ2aWNlLWNsdXN0ZXInLFxuICAgICAgY29udGFpbmVySW5zaWdodHM6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBUYXNrIERlZmluaXRpb25cbiAgICBjb25zdCB0YXNrRGVmaW5pdGlvbiA9IG5ldyBlY3MuRmFyZ2F0ZVRhc2tEZWZpbml0aW9uKHRoaXMsICdUaWNrZXRpbmdUYXNrRGVmJywge1xuICAgICAgbWVtb3J5TGltaXRNaUI6IDEwMjQsXG4gICAgICBjcHU6IDUxMixcbiAgICB9KTtcblxuICAgIC8vIFRhc2sgUm9sZSBmb3IgRHluYW1vREIgYWNjZXNzXG4gICAgdGFza0RlZmluaXRpb24udGFza1JvbGUuYWRkTWFuYWdlZFBvbGljeShcbiAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uRHluYW1vREJGdWxsQWNjZXNzJylcbiAgICApO1xuXG4gICAgLy8gTG9nIEdyb3VwXG4gICAgY29uc3QgbG9nR3JvdXAgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCAnVGlja2V0aW5nTG9nR3JvdXAnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6ICcvZWNzL3RpY2tldGluZy1zZXJ2aWNlJyxcbiAgICAgIHJldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcblxuICAgIC8vIENvbnRhaW5lciBEZWZpbml0aW9uIC0gVXNlIEVDUiByZXBvc2l0b3J5XG4gICAgY29uc3QgY29udGFpbmVyID0gdGFza0RlZmluaXRpb24uYWRkQ29udGFpbmVyKCdUaWNrZXRpbmdDb250YWluZXInLCB7XG4gICAgICBpbWFnZTogZWNzLkNvbnRhaW5lckltYWdlLmZyb21FY3JSZXBvc2l0b3J5KHJlcG9zaXRvcnksICdsYXRlc3QnKSxcbiAgICAgIGxvZ2dpbmc6IGVjcy5Mb2dEcml2ZXJzLmF3c0xvZ3Moe1xuICAgICAgICBzdHJlYW1QcmVmaXg6ICd0aWNrZXRpbmctc2VydmljZScsXG4gICAgICAgIGxvZ0dyb3VwLFxuICAgICAgfSksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICBQT1JUOiAnMzAwMCcsXG4gICAgICAgIFRJQ0tFVFNfVEFCTEVfTkFNRTogdGlja2V0c1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgVElDS0VUX0hJU1RPUllfVEFCTEVfTkFNRTogdGlja2V0SGlzdG9yeVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgVElDS0VUX0NPTU1FTlRTX1RBQkxFX05BTUU6IHRpY2tldENvbW1lbnRzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBBV1NfUkVHSU9OOiB0aGlzLnJlZ2lvbixcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb250YWluZXIuYWRkUG9ydE1hcHBpbmdzKHtcbiAgICAgIGNvbnRhaW5lclBvcnQ6IDMwMDAsXG4gICAgICBwcm90b2NvbDogZWNzLlByb3RvY29sLlRDUCxcbiAgICB9KTtcblxuICAgIC8vIEVDUyBTZXJ2aWNlXG4gICAgY29uc3Qgc2VydmljZSA9IG5ldyBlY3MuRmFyZ2F0ZVNlcnZpY2UodGhpcywgJ1RpY2tldGluZ1NlcnZpY2UnLCB7XG4gICAgICBjbHVzdGVyLFxuICAgICAgdGFza0RlZmluaXRpb24sXG4gICAgICBzZXJ2aWNlTmFtZTogJ3RpY2tldGluZy1zZXJ2aWNlJyxcbiAgICAgIGRlc2lyZWRDb3VudDogMixcbiAgICAgIGFzc2lnblB1YmxpY0lwOiBmYWxzZSxcbiAgICAgIHZwY1N1Ym5ldHM6IHtcbiAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTUyxcbiAgICAgIH0sXG4gICAgICBoZWFsdGhDaGVja0dyYWNlUGVyaW9kOiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgfSk7XG5cbiAgICAvLyBBdXRvIFNjYWxpbmdcbiAgICBjb25zdCBzY2FsaW5nID0gc2VydmljZS5hdXRvU2NhbGVUYXNrQ291bnQoe1xuICAgICAgbWluQ2FwYWNpdHk6IDIsXG4gICAgICBtYXhDYXBhY2l0eTogMTAsXG4gICAgfSk7XG5cbiAgICBzY2FsaW5nLnNjYWxlT25DcHVVdGlsaXphdGlvbignQ3B1U2NhbGluZycsIHtcbiAgICAgIHRhcmdldFV0aWxpemF0aW9uUGVyY2VudDogNzAsXG4gICAgICBzY2FsZUluQ29vbGRvd246IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwMCksXG4gICAgICBzY2FsZU91dENvb2xkb3duOiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMDApLFxuICAgIH0pO1xuXG4gICAgLy8gQXBwbGljYXRpb24gTG9hZCBCYWxhbmNlclxuICAgIGNvbnN0IGFsYiA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlcih0aGlzLCAnVGlja2V0aW5nQUxCJywge1xuICAgICAgdnBjLFxuICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgICBsb2FkQmFsYW5jZXJOYW1lOiAndGlja2V0aW5nLXNlcnZpY2UtYWxiJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGxpc3RlbmVyID0gYWxiLmFkZExpc3RlbmVyKCdUaWNrZXRpbmdMaXN0ZW5lcicsIHtcbiAgICAgIHBvcnQ6IDgwLFxuICAgICAgcHJvdG9jb2w6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHRhcmdldEdyb3VwID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAodGhpcywgJ1RpY2tldGluZ1RhcmdldEdyb3VwJywge1xuICAgICAgdnBjLFxuICAgICAgcG9ydDogMzAwMCxcbiAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFAsXG4gICAgICB0YXJnZXRUeXBlOiBlbGJ2Mi5UYXJnZXRUeXBlLklQLFxuICAgICAgaGVhbHRoQ2hlY2s6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgcGF0aDogJy9hcGkvdjEvaGVhbHRoJyxcbiAgICAgICAgaGVhbHRoeUh0dHBDb2RlczogJzIwMCcsXG4gICAgICAgIGludGVydmFsOiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDUpLFxuICAgICAgICBoZWFsdGh5VGhyZXNob2xkQ291bnQ6IDIsXG4gICAgICAgIHVuaGVhbHRoeVRocmVzaG9sZENvdW50OiAzLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGxpc3RlbmVyLmFkZFRhcmdldEdyb3VwcygnVGlja2V0aW5nVGFyZ2V0R3JvdXBzJywge1xuICAgICAgdGFyZ2V0R3JvdXBzOiBbdGFyZ2V0R3JvdXBdLFxuICAgIH0pO1xuXG4gICAgc2VydmljZS5hdHRhY2hUb0FwcGxpY2F0aW9uVGFyZ2V0R3JvdXAodGFyZ2V0R3JvdXApO1xuXG4gICAgLy8gR3JhbnQgRHluYW1vREIgcGVybWlzc2lvbnNcbiAgICB0aWNrZXRzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHRhc2tEZWZpbml0aW9uLnRhc2tSb2xlKTtcbiAgICB0aWNrZXRIaXN0b3J5VGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHRhc2tEZWZpbml0aW9uLnRhc2tSb2xlKTtcbiAgICB0aWNrZXRDb21tZW50c1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh0YXNrRGVmaW5pdGlvbi50YXNrUm9sZSk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0VDUlJlcG9zaXRvcnlVUkknLCB7XG4gICAgICB2YWx1ZTogcmVwb3NpdG9yeS5yZXBvc2l0b3J5VXJpLFxuICAgICAgZGVzY3JpcHRpb246ICdFQ1IgUmVwb3NpdG9yeSBVUkkgZm9yIHB1c2hpbmcgaW1hZ2VzJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDb2RlQnVpbGRQcm9qZWN0TmFtZScsIHtcbiAgICAgIHZhbHVlOiBidWlsZFByb2plY3QucHJvamVjdE5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0NvZGVCdWlsZCBwcm9qZWN0IG5hbWUgZm9yIGJ1aWxkaW5nIERvY2tlciBpbWFnZXMnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xvYWRCYWxhbmNlckROUycsIHtcbiAgICAgIHZhbHVlOiBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRE5TIG5hbWUgb2YgdGhlIGxvYWQgYmFsYW5jZXInLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1NlcnZpY2VVUkwnLCB7XG4gICAgICB2YWx1ZTogYGh0dHA6Ly8ke2FsYi5sb2FkQmFsYW5jZXJEbnNOYW1lfWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ1VSTCBvZiB0aGUgdGlja2V0aW5nIHNlcnZpY2UnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0hlYWx0aENoZWNrVVJMJywge1xuICAgICAgdmFsdWU6IGBodHRwOi8vJHthbGIubG9hZEJhbGFuY2VyRG5zTmFtZX0vYXBpL3YxL2hlYWx0aGAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0hlYWx0aCBjaGVjayBlbmRwb2ludCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnVGlja2V0c1RhYmxlTmFtZScsIHtcbiAgICAgIHZhbHVlOiB0aWNrZXRzVGFibGUudGFibGVOYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIHRoZSB0aWNrZXRzIER5bmFtb0RCIHRhYmxlJyxcbiAgICB9KTtcbiAgfVxufVxuIl19