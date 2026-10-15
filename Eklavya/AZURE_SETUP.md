# Azure Deployment Setup for Eklavya Art School

This guide covers setting up Azure resources and GitHub Actions for automated deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Azure Resources](#create-azure-resources)
3. [Configure Azure Web App](#configure-azure-web-app)
4. [Set Up GitHub Environment Secrets](#set-up-github-environment-secrets)
5. [Deploy](#deploy)
6. [Post-Deployment](#post-deployment)

## Prerequisites

- Azure subscription
- GitHub repository with admin access
- Azure CLI installed (optional, for resource creation)

## Create Azure Resources

### 1. Login to Azure

```bash
az login
```

### 2. Create Resource Group

```bash
az group create --name EklavyaRG --location eastus
```

### 3. Create App Service Plan

```bash
az appservice plan create \
  --name EklavyaPlan \
  --resource-group EklavyaRG \
  --sku B1 \
  --is-linux
```

### 4. Create Web App

```bash
az webapp create \
  --name eklavya-webapp \
  --resource-group EklavyaRG \
  --plan EklavyaPlan \
  --runtime "PYTHON:3.11"
```

### 5. Create Storage Account

```bash
az storage account create \
  --name eklavyastorage \
  --resource-group EklavyaRG \
  --sku Standard_LRS \
  --allow-blob-public-access true
```

### 6. Create Containers

```bash
az storage container create --name gallery --account-name eklavyastorage
az storage container create --name kids --account-name eklavyastorage
```

### 7. Get Storage Connection String

```bash
az storage account show-connection-string \
  --name eklavyastorage \
  --resource-group EklavyaRG \
  --query connectionString
```

### 8. Create PostgreSQL Server

```bash
az postgres flexible-server create \
  --name eklavya-postgres \
  --resource-group EklavyaRG \
  --location eastus \
  --admin-user eklavya \
  --admin-password YourPassword123! \
  --sku-name B_Gen5_2 \
  --storage-size 32 \
  --version 15
```

### 9. Get PostgreSQL Connection String

```bash
az postgres flexible-server show \
  --name eklavya-postgres \
  --resource-group EklavyaRG \
  --query connectionString
```

### 10. Create Communication Services

```bash
az communication create \
  --name eklavya-communication \
  --resource-group EklavyaRG
```

## Configure Azure Web App

### 1. Set App Settings

```bash
# Get the connection strings
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --name eklavyastorage \
  --resource-group EklavyaRG \
  --query connectionString)

POSTGRES_CONNECTION=$(az postgres flexible-server show \
  --name eklavya-postgres \
  --resource-group EklavyaRG \
  --query connectionString)

# Set app settings
az webapp config appsettings set \
  --name eklavya-webapp \
  --resource-group EklavyaRG \
  --settings \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
    AZURE_CONTAINER_GALLERY=gallery \
    AZURE_CONTAINER_KIDS=kids \
    DATABASE_URL="$POSTGRES_CONNECTION" \
    JWT_SECRET=$(openssl rand -base64 32) \
    ADMIN_EMAIL=admin@eklavyaart.com \
    ADMIN_PASSWORD=YourSecurePassword123 \
    ADMIN_NAME="School Admin" \
    ADMIN_NOTIFICATION_EMAIL=admin@eklavyaart.com \
    AZURE_COMMUNICATION_CONNECTION_STRING="" \
    AZURE_COMMUNICATION_SENDER="" \
    SMTP_HOST="" \
    SMTP_PORT=587 \
    SMTP_USER="" \
    SMTP_PASSWORD="" \
    SMTP_FROM=""
```

### 2. Configure Container Settings

```bash
az webapp config container set \
  --name eklavya-webapp \
  --resource-group EklavyaRG \
  --docker-custom-image-name "python:3.11-slim" \
  --docker-registry-server-url ""
```

### 3. Enable Public Blob Access

```bash
az storage account update \
  --name eklavyastorage \
  --resource-group EklavyaRG \
  --enable-public-network true
```

## Set Up GitHub Environment Secrets

### 1. Create Azure Service Principal

```bash
az login
az ad sp create-for-rbac --name "EklavyaDeploy" --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/EklavyaRG \
  --sdk-auth
```

This will output JSON like:
```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "subscriptionId": "your-subscription-id",
  "tenantId": "your-tenant-id",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### 2. Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Environments** → **production**
3. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `AZURE_CREDENTIALS` | The JSON output from the service principal creation |

### 3. Add Staging Environment Secrets

1. Navigate to **Settings** → **Environments** → **staging**
2. Add the same `AZURE_CREDENTIALS` secret (or create a separate one for staging)

### 4. Alternative: Use GitHub Actions Variables

For non-sensitive configuration, you can use repository variables:

1. Go to **Settings** → **Variables** → **Actions**
2. Add variables like:
   - `AZURE_WEBAPP_NAME` = `eklavya-webapp`
   - `AZURE_WEBAPP_PACKAGE_PATH` = `./dist`

## Deploy

### Automatic Deployment (Recommended)

Push to `main` branch to trigger production deployment:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Manual Deployment

1. Go to GitHub repository → **Actions** → **Deploy to Azure Web App**
2. Click **Run workflow**
3. Select branch and environment

### Verify Deployment

1. Visit your web app URL: `https://eklavya-webapp.azurewebsites.net`
2. Check the **Deployment Center** in Azure Portal
3. Monitor logs in GitHub Actions

## Post-Deployment

### 1. Upload Initial Images

```bash
# Using Azure Storage Explorer
# Or use the Python script
python Eklavya/upload_images.py ./gallery_images gallery
```

### 2. Seed Default Admin User

The app will automatically create an admin user on first startup with:
- Email: `admin@eklavyaart.com`
- Password: `YourSecurePassword123`

### 3. Configure DNS

1. Go to Azure Portal → App Service → `eklavya-webapp`
2. Navigate to **Custom domains**
3. Add your domain (e.g., `eklavyaart.com`)
4. Update DNS records with your registrar

### 4. Enable HTTPS

HTTPS is automatically enabled with Azure App Service. You can also:
- Buy a domain in Azure
- Import an existing certificate

## Monitoring and Logging

### View Application Logs

```bash
az webapp log tail \
  --name eklavya-webapp \
  --resource-group EklavyaRG
```

### View GitHub Actions Logs

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select the workflow run
4. View detailed logs

### Set Up Alerts

1. Azure Portal → App Service → `eklavya-webapp`
2. **Alerts** → **Add alert**
3. Configure metrics like CPU percentage, memory usage

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Verify service principal has correct permissions
3. Ensure all required secrets are set

### App Crashes on Startup

1. Check Azure App Service logs
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed

### Images Not Loading

1. Verify "Allow Blob public access" is enabled
2. Check container access policy
3. Verify connection string is correct

### Database Connection Issues

1. Check PostgreSQL firewall settings
2. Verify connection string format
3. Ensure App Service can reach the database

## Security Best Practices

1. **Rotate secrets regularly** - Change passwords and connection strings periodically
2. **Use Azure Key Vault** - For production, consider storing secrets in Key Vault
3. **Enable Managed Identity** - For Azure resource authentication
4. **Restrict IP access** - Configure firewall rules for database access
5. **Monitor activity** - Set up alerts for unusual activity

## Cost Optimization

- Use **B1** (Basic) App Service plan for development
- Scale to **S1** (Standard) for production
- Use **Standard_LRS** storage for cost savings
- Enable **Azure Backup** for disaster recovery

## Support

For issues and questions:
- [Azure Documentation](https://docs.microsoft.com/azure)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)