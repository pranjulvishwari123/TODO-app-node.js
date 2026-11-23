
    resource "aws_cloudwatch_log_group" "app" {
    name              = "/ecs/${var.project_name}"
    retention_in_days = 3
    }

    resource "aws_ecs_cluster" "main" {
    name = "${var.project_name}-cluster"
    }

    resource "aws_ecs_task_definition" "app" {
    family                   = var.project_name
    requires_compatibilities = ["FARGATE"]
    network_mode             = "awsvpc"
    cpu                      = var.container_cpu
    memory                   = var.container_memory

    execution_role_arn = aws_iam_role.execution.arn
    task_role_arn      = aws_iam_role.task.arn

    container_definitions = jsonencode([{
        name      = "todo-app"
        image     = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
        essential = true

        portMappings = [{
        containerPort = var.container_port
        hostPort      = var.container_port
        protocol      = "tcp"
        }]

        environment = [
        {
            name  = "PORT"
            value = tostring(var.container_port)
        },
        {
            name  = "AWS_REGION"
            value = var.aws_region
        },
        {
            name  = "TASK_TABLE"
            value = aws_dynamodb_table.tasks.name
        }
        ]

        logConfiguration = {
        logDriver = "awslogs"

        options = {
            "awslogs-group"         = aws_cloudwatch_log_group.app.name
            "awslogs-region"        = var.aws_region
            "awslogs-stream-prefix" = "todo"
        }
        }
    }])
    }


    resource "aws_ecs_service" "app" {
    count = var.create_ecs_service ? 1 : 0

    name            = "${var.project_name}-service"
    cluster         = aws_ecs_cluster.main.id
    task_definition = aws_ecs_task_definition.app.arn
    desired_count   = var.desired_count
    launch_type     = "FARGATE"

    network_configuration {
        subnets = [
        for subnet in aws_subnet.public : subnet.id
        ]

        security_groups  = [aws_security_group.ecs.id]
        assign_public_ip = true
    }

    load_balancer {
        target_group_arn = aws_lb_target_group.app.arn
        container_name   = "todo-app"
        container_port   = var.container_port
    }

    deployment_minimum_healthy_percent = 0
    deployment_maximum_percent         = 100

    deployment_circuit_breaker {
        enable   = true
        rollback = true
    }

    depends_on = [
        aws_lb_listener.http,
        aws_iam_role_policy_attachment.execution,
        aws_iam_role_policy.dynamodb
    ]

    # GitHub Actions will manage future task definition revisions.
    lifecycle {
        ignore_changes = [task_definition]
    }

    tags = {
        Name = "${var.project_name}-service"
    }
    }
