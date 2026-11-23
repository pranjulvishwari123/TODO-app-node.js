
variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "todo-app"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "container_port" {
  type    = number
  default = 3000
}

variable "container_cpu" {
  type    = number
  default = 256
}

variable "container_memory" {
  type    = number
  default = 512
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "image_tag" {
  description = "Initial image tag for ECS task definition"
  type        = string
  default     = "bootstrap"
}

variable "create_ecs_service" {
  description = "Enable after the first Docker image is pushed to ECR"
  type        = bool
  default     = false
}

variable "github_repository" {
  description = "GitHub owner/repository"
  type        = string
  default     = "pranjulvishwari123/TODO-app-node.js"
}

variable "github_branch" {
  type    = string
  default = "main"
}
