module "vpc" {
  source               = "./modules/vpc"
  vpc_name             = var.vpc_name
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  single_nat_gateway   = var.environment != "prod"
}
module "iam" {
  source       = "./modules/iam"
  cluster_name = var.cluster_name
}
module "eks" {
  source              = "./modules/eks"
  cluster_name        = var.cluster_name
  cluster_version     = var.cluster_version
  subnet_ids          = module.vpc.private_subnet_ids
  cluster_role_arn    = module.iam.cluster_role_arn
  node_role_arn       = module.iam.node_role_arn
  allowed_admin_cidrs = var.allowed_admin_cidrs
  depends_on          = [module.iam]
}
module "documentdb" {
  count                    = var.enable_documentdb ? 1 : 0
  source                   = "./modules/documentdb"
  db_name                  = var.db_name
  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnet_ids
  client_security_group_id = module.eks.cluster_security_group_id
  instance_count           = var.environment == "prod" ? 3 : 1
}
