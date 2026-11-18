#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
for environment in dev staging prod; do
  kubectl kustomize "k8s/overlays/$environment" >/dev/null
done
kubectl kustomize k8s/monitoring >/dev/null
# Values here are throwaway parser inputs; no containers are launched.
MONGO_USERNAME=validation MONGO_PASSWORD=validation JWT_KEY=validation docker compose config --quiet
terraform -chdir=terraform fmt -check -recursive
terraform -chdir=terraform init -backend=false -input=false
terraform -chdir=terraform validate
npm --prefix app/server ci --ignore-scripts
npm --prefix app/server test
npm --prefix app/frontend ci --ignore-scripts
npm --prefix app/frontend run lint
npm --prefix app/frontend run build
