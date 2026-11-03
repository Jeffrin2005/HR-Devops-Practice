#!/bin/bash
set -e

ENV=${1:-"base"}

echo "🚀 Starting DevOps Deployment Script..."

if [ "$ENV" = "base" ]; then
    echo "1. Applying Kubernetes Base Manifests..."
    kubectl apply -k k8s/base/
else
    echo "1. Applying Kubernetes Overlay for environment: $ENV..."
    kubectl apply -k "k8s/overlays/$ENV/"
fi

echo "2. Checking deployment rollout status..."
kubectl rollout status deployment/hr-frontend-deployment --timeout=120s || true
kubectl rollout status deployment/hr-backend-deployment --timeout=120s || true

echo "3. Fetching Services..."
kubectl get svc

echo "✅ Deployment complete!"
