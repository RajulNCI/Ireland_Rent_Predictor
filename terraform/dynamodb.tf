# ============================================================
# DynamoDB Table — Prediction Logs
# ============================================================

resource "aws_dynamodb_table" "predictions" {
  name         = var.dynamo_table_name
  billing_mode = "PAY_PER_REQUEST"  # no provisioned capacity = cheaper for student
  hash_key     = "id"
  tags         = local.tags

  attribute {
    name = "id"
    type = "S"
  }

  # GSI so you can query by city
  attribute {
    name = "city"
    type = "S"
  }

  # GSI so you can query by timestamp
  attribute {
    name = "timestamp"
    type = "S"
  }

  global_secondary_index {
    name            = "city-timestamp-index"
    hash_key        = "city"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }
}
