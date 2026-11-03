environment          = "dev"
aws_region           = "us-east-1"
vpc_name             = "hr-platform-vpc-dev"
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.101.0/24", "10.0.102.0/24"]
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
cluster_name         = "hr-cluster-dev"
db_name              = "hr-docdb-dev"

