# AWS infrastructure

The stack defines private EKS workers, VPC routing/NAT, restricted cluster endpoint access, a private versioned uploads bucket with workload IAM permissions, and optional DocumentDB. It does not install the ingress controller, monitoring chart, database application user, TLS certificates, or Kubernetes secrets.

## State and environment isolation

Terraform uses an encrypted S3 backend with native lockfiles. Before first use, provision a private versioned state bucket with restrictive IAM access and TLS-only access. Set TF_STATE_BUCKET and AWS_REGION. Use scripts/infra.sh so each environment receives its own state key and initialization directory:

```sh
export TF_STATE_BUCKET=YOUR_EXISTING_PRIVATE_STATE_BUCKET
export AWS_REGION=us-east-1
./scripts/infra.sh dev plan
# Review all actions in the saved plan.
./scripts/infra.sh dev apply
```

Use staging or prod for those environments. Switching only tfvars in one local state is unsafe.

For an existing local state, back it up securely and perform an explicit terraform init -migrate-state with the correct destination key for the environment it already represents. Verify terraform state list and a no-surprise plan. Do not use the helper's -reconfigure path to abandon existing state. Local state, plans, and historical backups can contain credentials; protect them and do not commit them.

## Access and database configuration

The cluster API is private by default. Access it from the VPC using your VPN/SSM-connected runner. To enable public access, supply explicit approved IPv4 CIDRs through allowed_admin_cidrs. 0.0.0.0/0 is rejected. Kubernetes upgrades must follow AWS's supported sequential upgrade path for an existing cluster; the configured version is a target for a reviewed plan.

Workers use private subnets with NAT egress. Dev/staging use one NAT gateway; production uses one per AZ. Review AWS costs before applying. A managed node group's min/max settings are not a cluster autoscaler installation.

enable_documentdb defaults to false. If you use DocumentDB, opt in explicitly in the chosen environment, review the plan, obtain the managed master secret through your authorized Secrets Manager workflow, and create a least-privilege application user. Configure the application with a TLS-enabled DocumentDB URI and trusted CA. Do not store the master password in tfvars.

Deletion protection and final snapshots are enabled for DocumentDB. A generic destroy should not silently erase production data. Test restoration in a separate environment. Object bucket versioning does not replace a tested backup/retention policy.

Configure the EBS CSI add-on and IAM role for any dev PVCs. Configure a NetworkPolicy-capable CNI. Install the pod identity add-on defined by the stack and verify the hr-backend service account can access only its environment's uploads objects. Kubernetes secrets should be supplied by an external secret manager with encrypted-at-rest storage and appropriate RBAC.

Validate without cloud changes:

```sh
terraform -chdir=terraform init -backend=false
terraform -chdir=terraform fmt -check -recursive
terraform -chdir=terraform validate
```
