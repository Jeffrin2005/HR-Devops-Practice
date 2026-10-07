#!/bin/bash
set -e

echo "⚠️ WARNING: Destroying DevOps Environment..."
read -p "Are you sure you want to delete all K8s resources? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "1. Deleting Kubernetes Base Manifests..."
    kubectl delete -k k8s/base/

    echo "✅ Clean up complete!"
fi
