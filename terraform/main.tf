resource "random_password" "db_password" {
  count   = var.database_password == "" ? 1 : 0
  length  = 32
  special = true
}

locals {
  db_password = var.database_password != "" ? var.database_password : (
    length(random_password.db_password) > 0 ? random_password.db_password[0].result : ""
  )
}

resource "google_sql_database_instance" "postgres" {
  name             = var.database_instance_name
  database_version = "POSTGRES_${var.postgres_version}"
  region           = var.gcp_region
  deletion_protection = false

  settings {
    tier              = var.machine_type
    availability_type = var.availability_type
    disk_size         = 20
    disk_autoresize   = true

    ip_configuration {
      require_ssl  = false
      ipv4_enabled = true

      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled                        = var.backup_enabled
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
      location = var.backup_location
    }

    user_labels = {
      environment = "production"
      managed_by  = "terraform"
    }
  }
}

resource "google_sql_user" "db_user" {
  name     = var.database_user
  instance = google_sql_database_instance.postgres.name
  password = local.db_password
}

resource "local_file" "connection_info" {
  filename = "${path.module}/connection_info.txt"
  content = <<-EOT
    Cloud SQL Connection Information
    ================================
    
    Instance Name: ${google_sql_database_instance.postgres.name}
    Database: ${var.database_name}
    Region: ${var.gcp_region}
    
    Public IP: ${google_sql_database_instance.postgres.public_ip_address}
    Private IP: ${try(google_sql_database_instance.postgres.private_ip_address, "Not allocated")}
    
    Username: ${var.database_user}
    Password: (stored in terraform state)
    
    Connection String (public):
    postgresql://${var.database_user}:PASSWORD@${google_sql_database_instance.postgres.public_ip_address}:5432/${var.database_name}
    
    To retrieve the password, run:
    terraform output -raw db_password
  EOT

  depends_on = [
    google_sql_database_instance.postgres,
    google_sql_user.db_user
  ]
}
