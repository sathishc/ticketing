#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const ticketing_service_stack_1 = require("../lib/ticketing-service-stack");
const app = new cdk.App();
new ticketing_service_stack_1.TicketingServiceStack(app, 'TicketingServiceStack-Dev', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    tags: {
        Environment: 'development',
        Project: 'ticketing-service',
    },
});
new ticketing_service_stack_1.TicketingServiceStack(app, 'TicketingServiceStack-Staging', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    tags: {
        Environment: 'staging',
        Project: 'ticketing-service',
    },
});
new ticketing_service_stack_1.TicketingServiceStack(app, 'TicketingServiceStack-Prod', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    tags: {
        Environment: 'production',
        Project: 'ticketing-service',
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGlja2V0aW5nLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0aWNrZXRpbmctc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1Q0FBcUM7QUFDckMsbUNBQW1DO0FBQ25DLDRFQUF1RTtBQUV2RSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUUxQixJQUFJLCtDQUFxQixDQUFDLEdBQUcsRUFBRSwyQkFBMkIsRUFBRTtJQUMxRCxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7UUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0tBQ3ZDO0lBQ0QsSUFBSSxFQUFFO1FBQ0osV0FBVyxFQUFFLGFBQWE7UUFDMUIsT0FBTyxFQUFFLG1CQUFtQjtLQUM3QjtDQUNGLENBQUMsQ0FBQztBQUVILElBQUksK0NBQXFCLENBQUMsR0FBRyxFQUFFLCtCQUErQixFQUFFO0lBQzlELEdBQUcsRUFBRTtRQUNILE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtRQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0I7S0FDdkM7SUFDRCxJQUFJLEVBQUU7UUFDSixXQUFXLEVBQUUsU0FBUztRQUN0QixPQUFPLEVBQUUsbUJBQW1CO0tBQzdCO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsSUFBSSwrQ0FBcUIsQ0FBQyxHQUFHLEVBQUUsNEJBQTRCLEVBQUU7SUFDM0QsR0FBRyxFQUFFO1FBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO1FBQ3hDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtLQUN2QztJQUNELElBQUksRUFBRTtRQUNKLFdBQVcsRUFBRSxZQUFZO1FBQ3pCLE9BQU8sRUFBRSxtQkFBbUI7S0FDN0I7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgVGlja2V0aW5nU2VydmljZVN0YWNrIH0gZnJvbSAnLi4vbGliL3RpY2tldGluZy1zZXJ2aWNlLXN0YWNrJztcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxubmV3IFRpY2tldGluZ1NlcnZpY2VTdGFjayhhcHAsICdUaWNrZXRpbmdTZXJ2aWNlU3RhY2stRGV2Jywge1xuICBlbnY6IHtcbiAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OLFxuICB9LFxuICB0YWdzOiB7XG4gICAgRW52aXJvbm1lbnQ6ICdkZXZlbG9wbWVudCcsXG4gICAgUHJvamVjdDogJ3RpY2tldGluZy1zZXJ2aWNlJyxcbiAgfSxcbn0pO1xuXG5uZXcgVGlja2V0aW5nU2VydmljZVN0YWNrKGFwcCwgJ1RpY2tldGluZ1NlcnZpY2VTdGFjay1TdGFnaW5nJywge1xuICBlbnY6IHtcbiAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OLFxuICB9LFxuICB0YWdzOiB7XG4gICAgRW52aXJvbm1lbnQ6ICdzdGFnaW5nJyxcbiAgICBQcm9qZWN0OiAndGlja2V0aW5nLXNlcnZpY2UnLFxuICB9LFxufSk7XG5cbm5ldyBUaWNrZXRpbmdTZXJ2aWNlU3RhY2soYXBwLCAnVGlja2V0aW5nU2VydmljZVN0YWNrLVByb2QnLCB7XG4gIGVudjoge1xuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04sXG4gIH0sXG4gIHRhZ3M6IHtcbiAgICBFbnZpcm9ubWVudDogJ3Byb2R1Y3Rpb24nLFxuICAgIFByb2plY3Q6ICd0aWNrZXRpbmctc2VydmljZScsXG4gIH0sXG59KTtcbiJdfQ==