output "db_endpoint" {
  description = "The endpoint of the DocumentDB cluster"
  value       = aws_docdb_cluster.mongo.endpoint
}

output "cluster_id" {
  description = "The ID of the DocumentDB cluster"
  value       = aws_docdb_cluster.mongo.id
}

output "cluster_arn" {
  description = "The ARN of the DocumentDB cluster"
  value       = aws_docdb_cluster.mongo.arn
}

output "security_group_id" {
  description = "Security group ID for DocumentDB"
  value       = aws_security_group.docdb_sg.id
}
