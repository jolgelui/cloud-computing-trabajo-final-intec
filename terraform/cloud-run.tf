# Artifact Registry repository for Docker images
resource "google_artifact_registry_repository" "api_repo" {
  location      = var.gcp_region
  repository_id = "proyecto-api"
  description   = "Docker repository for proyecto API"
  format        = "DOCKER"

  docker_config {
    immutable_tags = false
  }
}

# Service account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "proyecto-api-sa"
  display_name = "Service account for proyecto API Cloud Run"
}

# Cloud Run service
resource "google_cloud_run_service" "api" {
  name     = "proyecto-api"
  location = var.gcp_region

  template {
    spec {
      service_account_name = google_service_account.cloud_run_sa.email

      containers {
        image = "us-central1-docker.pkg.dev/mcd-514-proyecto-final/proyecto-api/proyecto-api:latest"

        env {
          name  = "DATABASE_URL"
          value = "postgresql://postgres:mcd514password@localhost:5432/proyecto?host=/cloudsql/mcd-514-proyecto-final:us-central1:proyecto-postgres"
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }
    }

    metadata {
      annotations = {
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.postgres.connection_name
        "run.googleapis.com/client-name"         = "terraform"
        "autoscaling.knative.dev/minScale"      = "0"
        "autoscaling.knative.dev/maxScale"      = "20"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_artifact_registry_repository.api_repo,
    google_service_account.cloud_run_sa
  ]
}

# Make Cloud Run service publicly accessible
resource "google_cloud_run_service_iam_member" "public_access" {
  service       = google_cloud_run_service.api.name
  location      = google_cloud_run_service.api.location
  role          = "roles/run.invoker"
  member        = "allUsers"
}

# Allow Cloud Run service account to pull from Artifact Registry
resource "google_artifact_registry_repository_iam_member" "cloud_run_access" {
  repository = google_artifact_registry_repository.api_repo.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Grant Cloud SQL Client role to Cloud Run service account (required for Cloud SQL Proxy)
resource "google_project_iam_member" "cloud_run_sql_client" {
  project = var.gcp_project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}
