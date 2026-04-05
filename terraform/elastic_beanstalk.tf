# ============================================================
# Elastic Beanstalk — Flask Backend
# ============================================================

resource "aws_elastic_beanstalk_application" "backend" {
  name        = var.app_name
  description = "Ireland Rent Predictor Flask Backend"
  tags        = local.tags
}

# Look up the latest Python 3.11 platform dynamically
# so we never hardcode a version string that may not exist
data "aws_elastic_beanstalk_solution_stack" "python311" {
  most_recent = true
  name_regex  = "^64bit Amazon Linux 2023 .* running Python 3.11$"
}

resource "aws_elastic_beanstalk_environment" "backend" {
  name                = "${var.app_name}-env"
  application         = aws_elastic_beanstalk_application.backend.name
  solution_stack_name = data.aws_elastic_beanstalk_solution_stack.python311.name
  tier                = "WebServer"
  tags                = local.tags

  # ── Instance settings ──
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }

  # Use the pre-existing LabInstanceProfile from AWS Academy
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = data.aws_iam_instance_profile.lab_instance_profile.name
  }

  # ── Auto scaling ──
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = "1"
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = "2"
  }

  # Use the pre-existing LabRole as the service role
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = data.aws_iam_role.lab_role.arn
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "LoadBalanced"
  }

  # ── Environment variables for Flask app ──
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_REGION"
    value     = var.aws_region
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "S3_BUCKET"
    value     = aws_s3_bucket.models.bucket
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DYNAMO_TABLE"
    value     = aws_dynamodb_table.predictions.name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "5000"
  }

  # ── Health check ──
  setting {
    namespace = "aws:elasticbeanstalk:application"
    name      = "Application Healthcheck URL"
    value     = "/health"
  }

  # ── Enhanced health reporting ──
  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name      = "SystemType"
    value     = "enhanced"
  }

  # ── Managed updates ──
  setting {
    namespace = "aws:elasticbeanstalk:managedactions"
    name      = "ManagedActionsEnabled"
    value     = "true"
  }

  setting {
    namespace = "aws:elasticbeanstalk:managedactions"
    name      = "PreferredStartTime"
    value     = "Sun:02:00"
  }

  setting {
    namespace = "aws:elasticbeanstalk:managedactions:platformupdate"
    name      = "UpdateLevel"
    value     = "minor"
  }
}
