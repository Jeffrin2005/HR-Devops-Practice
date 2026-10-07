#!/bin/bash
set -e

echo "🚀 Starting DevOps Deployment Script..."

echo "1. Applying Kubernetes Base Manifests..."
kubectl apply -k k8s/base/

echo "2. Checking deployment rollout status..."
kubectl rollout status deployment/hr-frontend-deployment
kubectl rollout status deployment/hr-backend-deployment

echo "3. Fetching Services..."
kubectl get svc

echo "✅ Deployment complete!"
