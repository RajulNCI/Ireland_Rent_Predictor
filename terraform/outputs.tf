# ============================================================
# Outputs — shown after terraform apply
# ============================================================

output "frontend_url" {
  description = "S3 website URL for the React frontend"
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "backend_url" {
  description = "Elastic Beanstalk URL for the Flask API"
  value       = "http://${aws_elastic_beanstalk_environment.backend.cname}"
}

output "models_bucket" {
  description = "S3 bucket name for model artefacts"
  value       = aws_s3_bucket.models.bucket
}

output "frontend_bucket" {
  description = "S3 bucket name for frontend assets"
  value       = aws_s3_bucket.frontend.bucket
}

output "dynamodb_table" {
  description = "DynamoDB table name for prediction logs"
  value       = aws_dynamodb_table.predictions.name
}
