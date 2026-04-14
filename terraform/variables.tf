variable "gcp_project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "database_instance_name" {
  description = "The name of the Cloud SQL instance"
  type        = string
  default     = "proyecto-postgres"
}

variable "database_name" {
  description = "The name of the database"
  type        = string
  default     = "proyecto"
}

variable "database_user" {
  description = "The database root user"
  type        = string
  default     = "postgres"
}

variable "database_password" {
  description = "The password for the database user"
  type        = string
  default     = ""
  sensitive   = true
}

variable "postgres_version" {
  description = "The PostgreSQL version"
  type        = string
  default     = "16"
}

variable "machine_type" {
  description = "The machine type/tier for the Cloud SQL instance"
  type        = string
  default     = "db-f1-micro"
}

variable "availability_type" {
  description = "The availability type (REGIONAL for HA, ZONAL for single zone)"
  type        = string
  default     = "ZONAL"
}

variable "enable_public_ip" {
  description = "Enable public IP for the instance"
  type        = bool
  default     = true
}

variable "allowed_networks" {
  description = "CIDR blocks allowed to connect (0.0.0.0/0 for public access)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "backup_enabled" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_location" {
  description = "Location for backups"
  type        = string
  default     = "us"
}
