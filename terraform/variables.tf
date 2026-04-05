# ============================================================
# Variables
# ============================================================

variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "ireland-rent-predictor"
}

variable "instance_type" {
  description = "EC2 instance type for Elastic Beanstalk"
  type        = string
  default     = "t3.micro"
}

variable "dynamo_table_name" {
  description = "DynamoDB table name for prediction logs"
  type        = string
  default     = "rent-predictions"
}
