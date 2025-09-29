#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TicketingServiceStack } from '../lib/ticketing-service-stack';

const app = new cdk.App();

new TicketingServiceStack(app, 'TicketingServiceStack-Dev', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    Environment: 'development',
    Project: 'ticketing-service',
  },
});

new TicketingServiceStack(app, 'TicketingServiceStack-Staging', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    Environment: 'staging',
    Project: 'ticketing-service',
  },
});

new TicketingServiceStack(app, 'TicketingServiceStack-Prod', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    Environment: 'production',
    Project: 'ticketing-service',
  },
});
