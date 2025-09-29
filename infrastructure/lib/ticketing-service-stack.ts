import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class TicketingServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
    taskDefinition.taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
    );

    // Log Group
    const logGroup = new logs.LogGroup(this, 'TicketingLogGroup', {
      logGroupName: '/ecs/ticketing-service',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Container Definition
    const container = taskDefinition.addContainer('TicketingContainer', {
      image: ecs.ContainerImage.fromRegistry('node:18-alpine'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ticketing-service',
        logGroup,
      }),
      environment: {
        NODE_ENV: 'production',
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
        path: '/health',
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

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
      description: 'DNS name of the load balancer',
    });

    new cdk.CfnOutput(this, 'TicketsTableName', {
      value: ticketsTable.tableName,
      description: 'Name of the tickets DynamoDB table',
    });
  }
}
