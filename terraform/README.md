# HR Platform - Terraform Infrastructure

This directory contains modular Infrastructure as Code (IaC) configuration for deploying the HR Platform infrastructure on AWS using Terraform.

## Directory Structure

```text
terraform/
│
├── main.tf             # Module orchestration and component wiring
├── provider.tf         # AWS provider configuration and default resource tags
├── versions.tf         # Required Terraform and provider versions
├── variables.tf        # Input variable declarations and defaults
├── locals.tf           # Shared local values and tagging strategy
├── data.tf             # AWS data sources (AZs, Account ID)
├── outputs.tf          # Root output values for VPC, EKS, and DocumentDB
│
├── environments/       # Environment-specific configuration
│   ├── dev.tfvars      # Development environment configuration
│   ├── staging.tfvars  # Staging environment configuration
│   └── prod.tfvars     # Production environment configuration
│
├── modules/            # Reusable Terraform modules
│   ├── vpc/            # VPC, public/private subnets, IGW, and route tables
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── iam/            # IAM roles and policies for EKS cluster and nodes
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── eks/            # Amazon EKS cluster and managed node groups
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── documentdb/     # Amazon DocumentDB cluster, instances, and subnet groups
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── .gitignore          # Ignores local state and secrets
└── README.md           # Documentation for Terraform setup
```

## Modules Overview

- **`modules/vpc`**: Creates a customized VPC with separate public and private subnets across multiple Availability Zones, Internet Gateway, and Route Tables.
- **`modules/iam`**: Manages IAM roles and AWS managed policy attachments for EKS control plane and worker nodes.
- **`modules/eks`**: Provisions the AWS EKS Cluster and worker node group with autoscaling configuration.
- **`modules/documentdb`**: Deploys MongoDB-compatible Amazon DocumentDB cluster, security groups, subnet groups, and cluster instances.

## Usage

### 1. Initialize Terraform
```bash
terraform init
```

### 2. Validate Configuration
```bash
terraform validate
```

### 3. Plan Deployment

- **Development:**
  ```bash
  terraform plan -var-file="environments/dev.tfvars"
  ```
- **Staging:**
  ```bash
  terraform plan -var-file="environments/staging.tfvars"
  ```
- **Production:**
  ```bash
  terraform plan -var-file="environments/prod.tfvars"
  ```

### 4. Apply Deployment
```bash
terraform apply -var-file="environments/dev.tfvars"
```

### 5. Destroy Infrastructure
```bash
terraform destroy -var-file="environments/dev.tfvars"
```

