# ============================================================
# TERRAFORM SETUP GUIDE
# ============================================================

## Prerequisites

1. Install Terraform: https://developer.hashicorp.com/terraform/install
2. Install AWS CLI: https://aws.amazon.com/cli/
3. Configure AWS credentials (refresh from AWS Academy):
   ```bash
   aws configure
   # OR paste credentials into ~/.aws/credentials
   ```

## Files

| File                   | Purpose                              |
|------------------------|--------------------------------------|
| main.tf                | Provider config + random suffix      |
| variables.tf           | All configurable variables           |
| s3.tf                  | Models bucket + frontend bucket      |
| cloudfront.tf          | CDN distribution for React SPA       |
| dynamodb.tf            | Prediction logs table                |
| iam.tf                 | Roles and policies                   |
| elastic_beanstalk.tf   | Flask backend deployment             |
| outputs.tf             | URLs and names shown after apply     |

## Step by Step

### Step 1 — Initialise Terraform
```bash
cd terraform/
terraform init
```

### Step 2 — Preview what will be created
```bash
terraform plan
```

### Step 3 — Create all AWS infrastructure
```bash
terraform apply
# Type 'yes' when prompted
```

### Step 4 — Note the outputs
After apply you will see:
- frontend_url          → your React app URL
- backend_url           → your Flask API URL
- models_bucket         → bucket name to upload pkl files
- cloudfront_distribution_id → add to GitHub secrets

### Step 5 — Upload model artefacts to S3
```bash
aws s3 cp backend/dublin_pipeline.pkl    s3://MODELS_BUCKET_NAME/
aws s3 cp backend/dublin_metrics.pkl     s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cork_pipeline.pkl      s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cork_metrics.pkl       s3://MODELS_BUCKET_NAME/
aws s3 cp backend/galway_pipeline.pkl    s3://MODELS_BUCKET_NAME/
aws s3 cp backend/galway_metrics.pkl     s3://MODELS_BUCKET_NAME/
aws s3 cp backend/kildare_pipeline.pkl   s3://MODELS_BUCKET_NAME/
aws s3 cp backend/kildare_metrics.pkl    s3://MODELS_BUCKET_NAME/
aws s3 cp backend/meath_pipeline.pkl     s3://MODELS_BUCKET_NAME/
aws s3 cp backend/meath_metrics.pkl      s3://MODELS_BUCKET_NAME/
aws s3 cp backend/louth_pipeline.pkl     s3://MODELS_BUCKET_NAME/
aws s3 cp backend/louth_metrics.pkl      s3://MODELS_BUCKET_NAME/
aws s3 cp backend/limerick_pipeline.pkl  s3://MODELS_BUCKET_NAME/
aws s3 cp backend/limerick_metrics.pkl   s3://MODELS_BUCKET_NAME/
aws s3 cp backend/waterford_pipeline.pkl s3://MODELS_BUCKET_NAME/
aws s3 cp backend/waterford_metrics.pkl  s3://MODELS_BUCKET_NAME/
aws s3 cp backend/wexford_pipeline.pkl   s3://MODELS_BUCKET_NAME/
aws s3 cp backend/wexford_metrics.pkl    s3://MODELS_BUCKET_NAME/
aws s3 cp backend/kerry_pipeline.pkl     s3://MODELS_BUCKET_NAME/
aws s3 cp backend/kerry_metrics.pkl      s3://MODELS_BUCKET_NAME/

# Upload cleaned CSVs too
aws s3 cp backend/cleaned_dublin.csv    s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cleaned_cork.csv      s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cleaned_galway.csv    s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cleaned_kildare.csv   s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cleaned_meath.csv     s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cleaned_louth.csv     s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cleaned_limerick.csv  s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cleaned_waterford.csv s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cleaned_wexford.csv   s3://MODELS_BUCKET_NAME/
aws s3 cp backend/cleaned_kerry.csv     s3://MODELS_BUCKET_NAME/
```

### Step 6 — Add GitHub Secrets
Go to: GitHub Repo → Settings → Secrets → Actions → New secret

Add these secrets from terraform outputs:
| Secret Name                  | Value from Terraform Output         |
|------------------------------|-------------------------------------|
| AWS_ACCESS_KEY_ID            | From ~/.aws/credentials             |
| AWS_SECRET_ACCESS_KEY        | From ~/.aws/credentials             |
| CLOUDFRONT_DISTRIBUTION_ID   | cloudfront_distribution_id output   |
| BACKEND_API_URL              | backend_url output                  |

### Step 7 — Deploy via GitHub Actions
```bash
git add .
git commit -m "Add terraform infrastructure"
git push origin main
# GitHub Actions will automatically deploy frontend + backend
```

### Destroy everything (save AWS credits)
```bash
terraform destroy
# Type 'yes' when prompted
```

## Important Notes for Student Account

- AWS Academy credentials expire every few hours — refresh before running
- t3.micro is free tier eligible — should not cost credits
- DynamoDB PAY_PER_REQUEST — only pay for actual requests (very cheap)
- CloudFront has a free tier of 1TB transfer/month
- Remember to run `terraform destroy` when not using it
