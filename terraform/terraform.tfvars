# GCP Project Configuration
gcp_project_id = "mcd-514-proyecto-final"
gcp_region     = "us-central1"

# Cloud SQL Configuration
database_instance_name = "proyecto-postgres"
database_name          = "proyecto"
database_user          = "postgres"

# IMPORTANT: Replace with a secure password or comment out to auto-generate
# database_password = "your-secure-password-here"

postgres_version   = "16"
machine_type       = "db-f1-micro"
availability_type  = "ZONAL"
enable_public_ip   = true

# Networks allowed to connect (use restricted IPs in production)
allowed_networks = ["0.0.0.0/0"]

# Backup Configuration
backup_enabled = true
backup_location = "us"
