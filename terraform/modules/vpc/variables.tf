variable "vpc_cidr" {
  type = string
}

variable "public_subnet_cidrs" {
  type = list(string)
}

variable "private_subnet_cidrs" {
  type = list(string)
}

variable "vpc_name" {
  type = string
}


variable "single_nat_gateway" { type = bool }
