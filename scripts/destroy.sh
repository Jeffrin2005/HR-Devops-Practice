#!/bin/bash
set -e

ENV=${1:-"base"}

echo "⚠️ WARNING: Destroying DevOps Environment ($ENV)..."
read -p "Are you sure you want to delete all K8s resources? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    if [ "$ENV" = "base" ]; then
        echo "1. Deleting Kubernetes Base Manifests..."
        kubectl delete -k k8s/base/
    else
        echo "1. Deleting Kubernetes Overlay for environment: $ENV..."
        kubectl delete -k "k8s/overlays/$ENV/"
    fi

    echo "✅ Clean up complete!"
fi
