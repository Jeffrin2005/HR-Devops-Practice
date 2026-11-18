variable "cluster_name" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "cluster_role_arn" {
  type = string
}

variable "node_role_arn" {
  type = string
}


variable "cluster_version" { type = string }
variable "allowed_admin_cidrs" { type = list(string) }
