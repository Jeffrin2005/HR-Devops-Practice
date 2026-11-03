environment          = "staging"
aws_region           = "us-east-1"
vpc_name             = "hr-platform-vpc-staging"
vpc_cidr             = "10.1.0.0/16"
public_subnet_cidrs  = ["10.1.101.0/24", "10.1.102.0/24"]
private_subnet_cidrs = ["10.1.1.0/24", "10.1.2.0/24"]
cluster_name         = "hr-cluster-staging"
db_name              = "hr-docdb-staging"

