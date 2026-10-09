resource "aws_db_subnet_group" "db_subnets" {
  name       = "${var.db_name}-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_docdb_cluster" "mongo" {
  cluster_identifier      = var.db_name
  engine                  = "docdb"
  master_username         = "admin"
  master_password         = "SuperSecretPassword123"
  db_subnet_group_name    = aws_db_subnet_group.db_subnets.name
  skip_final_snapshot     = true
}
