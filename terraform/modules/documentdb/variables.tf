variable "db_name" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "vpc_id" {
  type = string
}



variable "client_security_group_id" { type = string }
variable "instance_count" { type = number }
