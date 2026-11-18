#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
environment=${1:?Usage: infra.sh dev|staging|prod plan|apply}
action=${2:-plan}
case "$environment" in dev|staging|prod) ;; *) echo "Invalid environment" >&2; exit 1;; esac
case "$action" in plan|apply) ;; *) echo "Use plan or apply" >&2; exit 1;; esac
: "${TF_STATE_BUCKET:?Set the existing private versioned state bucket}"
: "${AWS_REGION:?Set AWS_REGION}"
export TF_DATA_DIR="$PWD/terraform/.terraform/$environment"
terraform -chdir=terraform init -reconfigure -backend-config="bucket=$TF_STATE_BUCKET" -backend-config="region=$AWS_REGION" -backend-config="key=hr/$environment/terraform.tfstate"
if [ "$action" = plan ]; then
  terraform -chdir=terraform plan -var-file="environments/$environment.tfvars" -out="$environment.tfplan"
else
  test -f "terraform/$environment.tfplan"
  terraform -chdir=terraform apply "$environment.tfplan"
fi
