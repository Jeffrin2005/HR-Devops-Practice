module "vpc" {
  source               = "./modules/vpc"
  vpc_name             = var.vpc_name
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

module "iam" {
  source       = "./modules/iam"
  cluster_name = var.cluster_name
}

module "eks" {
  source           = "./modules/eks"
  cluster_name     = var.cluster_name
  subnet_ids       = module.vpc.public_subnet_ids
  cluster_role_arn = module.iam.cluster_role_arn
  node_role_arn    = module.iam.node_role_arn
}

module "documentdb" {
  source     = "./modules/documentdb"
  db_name    = var.db_name
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
}
