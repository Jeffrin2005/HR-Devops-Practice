terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source               = "./modules/vpc"
  vpc_name             = "hr-platform-vpc"
  vpc_cidr             = "10.0.0.0/16"
  public_subnet_cidrs  = ["10.0.101.0/24", "10.0.102.0/24"]
  private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
}

module "iam" {
  source       = "./modules/iam"
  cluster_name = "hr-cluster"
}

module "eks" {
  source           = "./modules/eks"
  cluster_name     = "hr-cluster"
  subnet_ids       = module.vpc.public_subnet_ids
  cluster_role_arn = module.iam.cluster_role_arn
  node_role_arn    = module.iam.node_role_arn
}

