output "ec2_public_ip" {
  description = "Public IP address of the LinkForge EC2 instance"
  value       = aws_instance.linkforge_host.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the LinkForge EC2 instance"
  value       = aws_instance.linkforge_host.public_dns
}

output "ecr_api_url" {
  description = "ECR Repository URL for API"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_web_url" {
  description = "ECR Repository URL for Web"
  value       = aws_ecr_repository.web.repository_url
}

output "ecr_worker_url" {
  description = "ECR Repository URL for Worker"
  value       = aws_ecr_repository.worker.repository_url
}
