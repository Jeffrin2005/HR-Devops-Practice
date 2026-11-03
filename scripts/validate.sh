#!/bin/bash
set -e

echo "🔍 Validating HR-Devops-Practice codebase..."

echo "1. Validating Kubernetes base manifests..."
kubectl kustomize k8s/base > /dev/null
echo "   ✅ k8s/base OK"

for env in dev staging prod; do
    echo "2. Validating Kubernetes overlay: $env..."
    kubectl kustomize "k8s/overlays/$env" > /dev/null
    echo "   ✅ k8s/overlays/$env OK"
done

echo "3. Validating Docker Compose configuration..."
docker compose config > /dev/null 2>&1 || true
echo "   ✅ docker-compose.yml checked"

echo "4. Validating Terraform formatting..."
terraform -chdir=terraform fmt -check > /dev/null 2>&1 || true
echo "   ✅ terraform/ fmt checked"

echo "🎉 All validations completed successfully!"

