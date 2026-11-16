variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t3.small"
}

variable "ssh_key_name" {
  description = "AWS Key Pair name for SSH access (create this in EC2 → Key Pairs first)"
  type        = string
  default     = "linkforge-key"
}

# BLOCKER FIX #6: SSH restricted to your IP only
variable "allowed_ssh_cidr" {
  description = "Your public IP in CIDR notation for SSH access e.g. '203.0.113.42/32'. Find yours at https://checkip.amazonaws.com"
  type        = string
  # No default — you MUST set this. Add to terraform.tfvars: allowed_ssh_cidr = "YOUR_IP/32"
}
