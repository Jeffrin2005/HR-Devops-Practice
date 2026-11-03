locals {
  common_tags = {
    Project     = "hr-platform"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

