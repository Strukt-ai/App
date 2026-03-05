#!/bin/bash

# AWS Deployment Script for Monolithic Next.js + Backend App

set -e

echo "🚀 Deploying Strukt App to AWS..."

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_NAME=strukt-app
APP_NAME=strukt-app
CONTAINER_PORT=3000

# Step 1: Create ECR Repository
echo "📦 Setting up ECR Repository..."
ECR_REPO_URI="$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

if ! aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION 2>/dev/null; then
    echo "Creating ECR repository..."
    aws ecr create-repository \
        --repository-name $ECR_REPO_NAME \
        --region $AWS_REGION \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256
fi

# Step 2: Build Docker Image
echo "🔨 Building Docker image..."
docker build -t $ECR_REPO_NAME:latest .
docker tag $ECR_REPO_NAME:latest $ECR_REPO_URI:latest
docker tag $ECR_REPO_NAME:latest $ECR_REPO_URI:$(date +%s)

# Step 3: Push to ECR
echo "📤 Pushing to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REPO_URI

docker push $ECR_REPO_URI:latest
docker push $ECR_REPO_URI:$(date +%s)

# Step 4: Deploy to App Runner
echo "🚀 Deploying to App Runner..."

SERVICE_ARN=$(aws apprunner list-services \
    --region $AWS_REGION \
    --query "ServiceSummaryList[?ServiceName=='$APP_NAME'].ServiceArn" \
    --output text 2>/dev/null || echo "")

if [ -z "$SERVICE_ARN" ]; then
    echo "Creating new App Runner service..."
    
    # Create IAM role for App Runner
    ROLE_ARN=$(aws iam create-role \
        --role-name $APP_NAME-apprunner-role \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "apprunner.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }' \
        --region $AWS_REGION \
        --query 'Role.Arn' \
        --output text 2>/dev/null || echo "")

    if [ -n "$ROLE_ARN" ]; then
        # Attach ECR access policy
        aws iam attach-role-policy \
            --role-name $APP_NAME-apprunner-role \
            --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
    fi

    aws apprunner create-service \
        --service-name $APP_NAME \
        --source-configuration '{
            "ImageRepository": {
                "ImageIdentifier": "'$ECR_REPO_URI:latest'",
                "ImageRepositoryType": "ECR",
                "ImageConfiguration": {
                    "Port": "'$CONTAINER_PORT'",
                    "RuntimeEnvironmentVariables": {
                        "NODE_ENV": "production",
                        "BACKEND_DIRECT_CALL": "true",
                        "ENABLE_PYTHON_SUBPROCESS": "true"
                    }
                }
            }
        }' \
        --instance-configuration '{
            "Cpu": "1",
            "Memory": "2048",
            "InstanceRoleArn": "'$ROLE_ARN'"
        }' \
        --region $AWS_REGION

    echo "Service created! Waiting for deployment..."
    sleep 30
else
    echo "Updating existing App Runner service..."
    
    aws apprunner update-service \
        --service-arn $SERVICE_ARN \
        --source-configuration '{
            "ImageRepository": {
                "ImageIdentifier": "'$ECR_REPO_URI:latest'",
                "ImageRepositoryType": "ECR",
                "ImageConfiguration": {
                    "Port": "'$CONTAINER_PORT'",
                    "RuntimeEnvironmentVariables": {
                        "NODE_ENV": "production",
                        "BACKEND_DIRECT_CALL": "true",
                        "ENABLE_PYTHON_SUBPROCESS": "true"
                    }
                }
            }
        }' \
        --region $AWS_REGION
fi

# Step 5: Get Service Details
echo "📋 Service Details:"
SERVICE_INFO=$(aws apprunner describe-service \
    --service-arn $(aws apprunner list-services \
        --region $AWS_REGION \
        --query "ServiceSummaryList[?ServiceName=='$APP_NAME'].ServiceArn" \
        --output text) \
    --region $AWS_REGION)

SERVICE_URL=$(echo $SERVICE_INFO | jq -r '.Service.ServiceUrl')
SERVICE_STATUS=$(echo $SERVICE_INFO | jq -r '.Service.Status')

echo "✅ Service: $APP_NAME"
echo "📍 URL: https://$SERVICE_URL"
echo "🔄 Status: $SERVICE_STATUS"

# Step 6: Setup CloudWatch Logs
echo "📊 Setting up CloudWatch Logs..."
aws logs create-log-group \
    --log-group-name /aws/apprunner/$APP_NAME \
    --region $AWS_REGION 2>/dev/null || true

aws logs put-retention-policy \
    --log-group-name /aws/apprunner/$APP_NAME \
    --retention-in-days 14 \
    --region $AWS_REGION

# Step 7: Run Health Check
echo "🏥 Running health check..."
sleep 60

for i in {1..10}; do
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://$SERVICE_URL/api/health 2>/dev/null || echo "000")
    
    if [ "$HEALTH" = "200" ]; then
        echo "✅ Health check passed!"
        break
    fi
    
    echo "⏳ Attempt $i/10 - Status: $HEALTH"
    sleep 10
done

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📍 Access your app at: https://$SERVICE_URL"
echo "📊 Logs: https://console.aws.amazon.com/logs/home?region=$AWS_REGION#logStream:group=/aws/apprunner/$APP_NAME"
echo ""
echo "Next steps:"
echo "1. Test the app: curl https://$SERVICE_URL/api/health"
echo "2. Setup custom domain in App Runner console"
echo "3. Configure CI/CD for automatic deployments"
echo "4. Monitor performance in CloudWatch"
