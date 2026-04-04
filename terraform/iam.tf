# ============================================================
# IAM — AWS Academy Student Account
# ============================================================
# Student accounts use a pre-existing LabRole — we cannot
# create or modify IAM roles/policies. We just look up the
# existing role and instance profile by name.
# ============================================================

data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

data "aws_iam_instance_profile" "lab_instance_profile" {
  name = "LabInstanceProfile"
}
