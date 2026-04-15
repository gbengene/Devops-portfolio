output "state_bucket_name" {
  value = aws_s3_bucket.state.bucket
}

output "lock_table_name" {
  value = aws_dynamodb_table.locks.name
}

output "next_step" {
  value = "Backend ready. Now run: cd ../environments/dev && terraform init && terraform apply"
}
