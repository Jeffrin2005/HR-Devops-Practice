#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
environment=${1:-dev}
case "$environment" in dev|staging|prod) ;; *) echo "Invalid environment" >&2; exit 1;; esac
namespace="hr-$environment"
if kubectl kustomize "k8s/overlays/$environment" | grep -q RELEASE_REQUIRED; then
  echo "Promote verified release digests with scripts/promote.sh first." >&2
  exit 1
fi
kubectl get namespace "$namespace" >/dev/null
kubectl -n "$namespace" get secret hr-api-secret >/dev/null
if [ "$environment" = dev ]; then
  kubectl -n "$namespace" get secret hr-database-secret >/dev/null
else
  kubectl -n "$namespace" get secret hr-tls >/dev/null
  if kubectl kustomize "k8s/overlays/$environment" | grep -q 'REPLACE_WITH\|example.com'; then
    echo "Configure the real HTTPS hostname and private uploads bucket before deployment." >&2
    exit 1
  fi
fi
kubectl apply -k "k8s/overlays/$environment"
kubectl -n "$namespace" rollout status deployment/hr-frontend-deployment --timeout=180s
kubectl -n "$namespace" rollout status deployment/hr-backend-deployment --timeout=180s
kubectl -n "$namespace" get deployments,services
