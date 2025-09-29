#!/bin/bash

echo "🚀 Starting Ticketing Service Local Deployment..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Set environment variables for local development
export NODE_ENV=development
export PORT=3000
export TICKETS_TABLE_NAME=local-tickets
export TICKET_HISTORY_TABLE_NAME=local-ticket-history
export TICKET_COMMENTS_TABLE_NAME=local-ticket-comments
export AWS_REGION=us-east-1

echo "🔧 Environment configured for local development"
echo "📊 Starting ticketing service on port 3000..."

# Start the service
npm start
