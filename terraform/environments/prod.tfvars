environment          = "prod"
aws_region           = "us-east-1"
vpc_name             = "hr-platform-vpc-prod"
vpc_cidr             = "10.2.0.0/16"
public_subnet_cidrs  = ["10.2.101.0/24", "10.2.102.0/24"]
private_subnet_cidrs = ["10.2.1.0/24", "10.2.2.0/24"]
cluster_name         = "hr-cluster-prod"
db_name              = "hr-docdb-prod"

