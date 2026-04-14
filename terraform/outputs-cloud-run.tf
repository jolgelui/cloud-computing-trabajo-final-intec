output "gcp_project_id" {
  description = "GCP Project ID"
  value       = var.gcp_project_id
}

output "gcp_region" {
  description = "GCP Region"
  value       = var.gcp_region
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository for Docker images"
  value       = google_artifact_registry_repository.api_repo.repository_id
}

output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/proyecto-api"
}

output "cloud_run_service_url" {
  description = "Cloud Run service public URL"
  value       = google_cloud_run_service.api.status[0].url
}

output "cloud_run_service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_service.api.name
}

output "cloud_run_service_account" {
  description = "Service account email for Cloud Run"
  value       = google_service_account.cloud_run_sa.email
}

# React App Outputs
output "artifact_registry_app_url" {
  description = "Artifact Registry repository URL for React app"
  value       = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/proyecto-app"
}

output "cloud_run_app_service_url" {
  description = "Cloud Run service public URL for React app"
  value       = google_cloud_run_service.app.status[0].url
}

output "cloud_run_app_service_name" {
  description = "Cloud Run service name for React app"
  value       = google_cloud_run_service.app.name
}

output "cloud_run_app_service_account" {
  description = "Service account email for React app Cloud Run"
  value       = google_service_account.cloud_run_app_sa.email
}
