
output "alb_dns_name" {
  description = "Public URL of TODO application"
  value       = "http://${aws_lb.app.dns_name}"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = "${var.project_name}-service"
}

output "ecs_task_definition_family" {
  value = aws_ecs_task_definition.app.family
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.tasks.name
}

output "github_actions_role_arn" {
  value = aws_iam_role.github.arn
}

output "public_subnet_ids" {
  value = [
    for subnet in aws_subnet.public : subnet.id
  ]
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}
