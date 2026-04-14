# Terraform Cloud SQL Setup

This Terraform configuration creates a PostgreSQL database instance in Google Cloud SQL with public IP access.

## Prerequisites

1. **GCP Project**: Have a GCP project created
2. **GCS Bucket**: The bucket `mcd-514-terraform` must exist and be accessible
3. **Terraform**: Install Terraform (>= 1.0)
4. **GCP CLI**: Install and authenticate with `gcloud auth login`
5. **Permissions**: Your GCP account must have permissions to:
   - Create Cloud SQL instances
   - Create databases and users
   - Read/write to the GCS bucket

## Setup Instructions

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

This will configure the remote backend using the GCS bucket and download provider plugins.

### 2. Configure Variables

Copy the example file and update with your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your GCP project ID and desired configuration:

```hcl
gcp_project_id  = "your-project-id"
gcp_region      = "us-central1"
database_password = "your-secure-password"  # Optional - auto-generates if omitted
```

### 3. Review the Plan

```bash
terraform plan
```

This will show you exactly what resources will be created, modified, or destroyed.

### 4. Apply Configuration

```bash
terraform apply
```

Confirm the action by typing `yes`. This will:
- Create a Cloud SQL PostgreSQL instance
- Create the `proyecto` database
- Create the `postgres` user with the provided password
- Generate a connection info file

### 5. Retrieve Connection Information

After applying, get the connection details:

```bash
# Get the public IP
terraform output public_ip_address

# Get the database password (sensitive output)
terraform output -raw db_password

# Get the full connection string
terraform output cloud_sql_connection_string
```

A `connection_info.txt` file is also generated in the terraform directory.

## Database Connection

### From Local Machine

Using the public IP address:

```bash
psql -h <PUBLIC_IP> -U postgres -d proyecto
```

### From GCP Instances (Same VPC)

Using the private IP address (more secure):

```bash
psql -h <PRIVATE_IP> -U postgres -d proyecto
```

## Managing the Infrastructure

### Update Configuration

Modify `terraform.tfvars` and run:

```bash
terraform apply
```

### View Current State

```bash
terraform state list
terraform state show google_sql_database_instance.postgres
```

### Destroy Infrastructure

To remove all resources created by Terraform:

```bash
terraform destroy
```

**Warning**: This will delete the Cloud SQL instance and the `proyecto` database. Ensure you have backups if needed.

### Check Outputs

```bash
terraform output
```

## Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `gcp_project_id` | (required) | GCP project ID |
| `gcp_region` | `us-central1` | GCP region |
| `database_instance_name` | `proyecto-postgres` | Cloud SQL instance name |
| `database_name` | `proyecto` | Database name |
| `database_user` | `postgres` | Database username |
| `database_password` | (auto-generated) | Database password (sensitive) |
| `postgres_version` | `16` | PostgreSQL version |
| `machine_type` | `db-f1-micro` | Instance tier/machine type |
| `availability_type` | `ZONAL` | ZONAL or REGIONAL (HA) |
| `enable_public_ip` | `true` | Enable public IP access |
| `allowed_networks` | `["0.0.0.0/0"]` | CIDR blocks allowed to connect |
| `backup_enabled` | `true` | Enable automated backups |
| `backup_location` | `us` | Backup location |

## State Management

Terraform state is stored remotely in the GCS bucket `mcd-514-terraform` under the `cloud-sql` prefix. This allows:

- **Team Collaboration**: Multiple team members can manage the same infrastructure
- **State Locking**: Prevents concurrent modifications (state file is versioned in GCS)
- **Audit Trail**: All changes are tracked in GCS versioning

### State File Locations

```
gs://mcd-514-terraform/cloud-sql/default.tfstate
gs://mcd-514-terraform/cloud-sql/default.tfstate.backup
```

## Security Considerations

### For Production:

1. **Firewall Rules**: Restrict `allowed_networks` to specific IPs instead of `0.0.0.0/0`
2. **Private IP Only**: Set `enable_public_ip` to `false` and use Cloud SQL Proxy or VPC peering
3. **SSL/TLS**: Enable SSL connections by setting `require_ssl = true` in `main.tf`
4. **Password Management**: Use a secrets manager (e.g., GCP Secret Manager) to manage passwords
5. **HA Setup**: Change `availability_type` to `REGIONAL` for high availability
6. **Backups**: Enable point-in-time recovery (already configured)

### For Development:

The current setup allows public access for easy development. Remember to always use strong passwords.

## Troubleshooting

### Backend Authentication Issues

If you get GCS bucket access errors:

```bash
gcloud auth application-default login
```

### Connection Refused

1. Verify the public IP is accessible: `ping <PUBLIC_IP>`
2. Ensure the allowed_networks includes your IP
3. Check security group rules in GCP

### Terraform State Conflicts

If you get state lock errors:

```bash
terraform force-unlock <ID>
```

## Clean Up

To prevent unexpected charges, always destroy resources when not needed:

```bash
terraform destroy
```

This will safely remove the Cloud SQL instance after confirming.

## Additional Resources

- [Terraform Google Provider Documentation](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud SQL Best Practices](https://cloud.google.com/sql/docs/best-practices)
- [Terraform Remote State Documentation](https://developer.hashicorp.com/terraform/language/state/remote)
