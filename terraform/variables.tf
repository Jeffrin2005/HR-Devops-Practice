variable "aws_region" {
  description = "AWS region for provisioning resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_name" {
  description = "Name of the VPC"
  type        = string
  default     = "hr-platform-vpc"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "hr-cluster"
}

variable "db_name" {
  description = "Name of the DocumentDB cluster"
  type        = string
  default     = "hr-docdb"
}



variable "cluster_version" {
  type    = string
  default = "1.36"
}
variable "allowed_admin_cidrs" {
  description = "Approved public API access ranges; empty means private endpoint only"
  type        = list(string)
  default     = []
  validation {
    condition     = alltrue([for cidr in var.allowed_admin_cidrs : can(cidrnetmask(cidr)) && cidr != "0.0.0.0/0"])
    error_message = "Use specific approved IPv4 CIDRs, never 0.0.0.0/0."
  }
}
variable "enable_documentdb" {
  description = "Opt in after reviewing the plan; otherwise supply an external MongoDB replica-set URI"
  type        = bool
  default     = false
}
