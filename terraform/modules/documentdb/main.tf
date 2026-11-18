resource "aws_security_group" "docdb_sg" {
  name        = "${var.db_name}-docdb-sg"
  description = "Database access only from the EKS workload security group"
  vpc_id      = var.vpc_id
  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [var.client_security_group_id]
  }
}
resource "aws_docdb_subnet_group" "db_subnets" {
  name       = "${var.db_name}-subnet-group"
  subnet_ids = var.subnet_ids
}
resource "aws_docdb_cluster" "mongo" {
  cluster_identifier              = var.db_name
  engine                          = "docdb"
  engine_version                  = "5.0.0"
  master_username                 = "hr_admin"
  manage_master_user_password     = true
  db_subnet_group_name            = aws_docdb_subnet_group.db_subnets.name
  vpc_security_group_ids          = [aws_security_group.docdb_sg.id]
  storage_encrypted               = true
  backup_retention_period         = 14
  preferred_backup_window         = "03:00-04:00"
  deletion_protection             = true
  skip_final_snapshot             = false
  final_snapshot_identifier       = "${var.db_name}-final"
  enabled_cloudwatch_logs_exports = ["audit", "profiler"]
}
resource "aws_docdb_cluster_instance" "cluster_instances" {
  count                      = var.instance_count
  identifier                 = "${var.db_name}-instance-${count.index + 1}"
  cluster_identifier         = aws_docdb_cluster.mongo.id
  instance_class             = "db.t3.medium"
  auto_minor_version_upgrade = true
}
