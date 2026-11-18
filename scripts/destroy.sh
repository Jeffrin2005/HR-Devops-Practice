#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
environment=${1:?Usage: destroy.sh dev|staging|prod}
case "$environment" in dev|staging|prod) ;; *) exit 1;; esac
namespace="hr-$environment"
echo "This stops application workloads in $namespace. Storage, secrets, database, and history are retained."
read -r -p "Type $namespace to continue: " confirmation
[ "$confirmation" = "$namespace" ] || exit 1
kubectl -n "$namespace" delete deployment hr-frontend-deployment hr-backend-deployment
