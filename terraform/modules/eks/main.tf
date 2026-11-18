resource "aws_eks_cluster" "main" {
  name                      = var.cluster_name
  role_arn                  = var.cluster_role_arn
  version                   = var.cluster_version
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = length(var.allowed_admin_cidrs) > 0
    public_access_cidrs     = length(var.allowed_admin_cidrs) > 0 ? var.allowed_admin_cidrs : null
  }
}
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-node-group"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids
  scaling_config {
    desired_size = 2
    max_size     = 6
    min_size     = 2
  }
  update_config {
    max_unavailable = 1
  }
  instance_types = ["t3.medium"]
  disk_size      = 30
}
resource "aws_eks_addon" "pod_identity" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "eks-pod-identity-agent"
  depends_on   = [aws_eks_node_group.main]
}
