output "instance_name" {
  description = "The name of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.name
}

output "instance_connection_name" {
  description = "The connection name of the instance to be used in connection strings"
  value       = google_sql_database_instance.postgres.connection_name
}

output "public_ip_address" {
  description = "The public IP address assigned to the instance"
  value       = google_sql_database_instance.postgres.public_ip_address
}

output "private_ip_address" {
  description = "The private IP address assigned to the instance"
  value       = try(google_sql_database_instance.postgres.private_ip_address, "Not allocated")
}

output "database_name" {
  description = "The name of the database"
  value       = var.database_name
}

output "database_user" {
  description = "The database user"
  value       = google_sql_user.db_user.name
}

output "db_password" {
  description = "The database password (sensitive)"
  value       = local.db_password
  sensitive   = true
}

output "postgres_version" {
  description = "The PostgreSQL version"
  value       = google_sql_database_instance.postgres.database_version
}

output "cloud_sql_connection_string" {
  description = "The connection string for the Cloud SQL instance"
  value       = "postgresql://${var.database_user}:PASSWORD@${google_sql_database_instance.postgres.public_ip_address}:5432/${var.database_name}"
}

output "connection_info_file" {
  description = "Path to the connection information file"
  value       = local_file.connection_info.filename
}
