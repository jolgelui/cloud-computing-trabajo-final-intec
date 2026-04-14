terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "mcd-514-terraform"
    prefix = "cloud-sql"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
