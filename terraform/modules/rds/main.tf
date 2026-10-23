resource "aws_security_group" "docdb_sg" {
  name        = "${var.db_name}-docdb-sg"
  description = "Allow inbound MongoDB traffic from VPC"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.db_name}-docdb-sg"
  }
}

resource "aws_docdb_subnet_group" "db_subnets" {
  name       = "${var.db_name}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.db_name}-subnet-group"
  }
}

resource "aws_docdb_cluster" "mongo" {
  cluster_identifier      = var.db_name
  engine                  = "docdb"
  master_username         = "admin"
  master_password         = "SuperSecretPassword123"
  db_subnet_group_name    = aws_docdb_subnet_group.db_subnets.name
  vpc_security_group_ids  = [aws_security_group.docdb_sg.id]
  skip_final_snapshot     = true

  tags = {
    Name = var.db_name
  }
}

resource "aws_docdb_cluster_instance" "cluster_instances" {
  count              = 1
  identifier         = "${var.db_name}-instance-1"
  cluster_identifier = aws_docdb_cluster.mongo.id
  instance_class     = "db.t3.medium"

  tags = {
    Name = "${var.db_name}-instance-1"
  }
}
