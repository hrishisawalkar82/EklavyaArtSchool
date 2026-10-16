# Kubernetes Deployment for Eklavya Art School on Azure AKS

This directory contains Kubernetes manifests for deploying the Eklavya Art School application on Azure Kubernetes Service (AKS).

## Architecture

- **Backend**: FastAPI application (2 replicas)
- **Frontend**: React/Vite application (2 replicas)
- **Database**: Azure Database for PostgreSQL (external to K8s)
- **Storage**: Azure Blob Storage (external to K8s)
- **Ingress**: Azure Application Gateway (optional)

## Prerequisites

1. Azure AKS cluster running
2. Azure Container Registry (ACR) for storing images
3. Azure Database for PostgreSQL instance
4. Azure Storage account with containers (gallery, kids)
5. `kubectl` configured to connect to your AKS cluster
6. Docker installed and logged into ACR

## Setup Steps

### 1. Create Azure Resources

```bash
# Create resource group
az group create --name EklavyaRG --location eastus

# Create AKS cluster
az aks create \
  --resource-group EklavyaRG \
  --name EklavyaAKS \
  --node-count 2 \
  --enable-addons ingress-appgw \
  --generate-ssh-keys

# Get cluster credentials
az aks get-credentials --resource-group EklavyaRG --name EklavyaAKS

# Create ACR
az acr create --resource-group EklavyaRG --name eklavyacr --sku Basic

# Login to ACR
az acr login --name eklavyacr

# Create Azure Database for PostgreSQL
az postgres flexible-server create \
  --name eklavya-postgres \
  --resource-group EklavyaRG \
  --location eastus \
  --admin-user eklavya \
  --admin-password YourSecurePassword123 \
  --sku-name B_Gen5_2 \
  --storage-size 32 \
  --version 15

# Create Azure Storage account
az storage account create \
  --name eklavyastorage \
  --resource-group EklavyaRG \
  --sku Standard_LRS \
  --allow-blob-public-access true

# Create containers
az storage container create --name gallery --account-name eklavyastorage
az storage container create --name kids --account-name eklavyastorage
```

### 2. Configure Secrets

Edit `k8s/secrets.yaml` with your actual values:

- `database-url`: PostgreSQL connection string from Azure
- `azure-storage-connection-string`: From Azure Storage account
- `jwt-secret`: Secure random string for JWT signing
- `admin-password`: Admin user password
- SMTP settings (optional): For email functionality

Then apply:
```bash
kubectl apply -f k8s/secrets.yaml -n eklavya
```

### 3. Deploy

```bash
# Make deploy script executable
chmod +x k8s/deploy.sh

# Run deployment
./k8s/deploy.sh eklavyacr latest
```

### 4. Verify Deployment

```bash
kubectl get pods -n eklavya
kubectl get services -n eklavya
kubectl get ingress -n eklavya
```

### 5. Access the Application

- **Frontend**: http://<your-ingress-ip> or via Ingress domain
- **Backend API**: http://<your-ingress-ip>/api or via Ingress domain
- **API Docs**: http://<your-ingress-ip>/api/docs

## Domain Setup for Frontend

To connect your custom domain (e.g., `eklavyaart.com`) to the frontend:

### Step 1: Get the Ingress IP Address

```bash
kubectl get ingress -n eklavya
```

Look for the `ADDRESS` or `IP` column - this is your Azure Application Gateway public IP.

### Step 2: Create DNS Records

Go to your domain registrar (GoDaddy, Namecheap, Azure DNS, etc.) and create:

| Type | Host/Name | Value | TTL |
|------|-----------|-------|-----|
| A | @ | `<ingress-ip>` | 3600 |
| A | www | `<ingress-ip>` | 3600 |

Or if using Azure DNS:
```bash
# Create A record for root domain
az network dns record-set a add-record \
  --resource-group EklavyaRG \
  --zone-name eklavyaart.com \
  --record-set-name @ \
  --ipv4-address <ingress-ip>

# Create A record for www subdomain
az network dns record-set a add-record \
  --resource-group EklavyaRG \
  --zone-name eklavyaart.com \
  --record-set-name www \
  --ipv4-address <ingress-ip>
```

### Step 3: Update Ingress with Your Domain

Edit `k8s/ingress.yaml` and replace `eklavyaart.com` with your actual domain:

```yaml
rules:
  - host: yourdomain.com
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: frontend
              port:
                number: 3000
        - path: /api
          pathType: Prefix
          backend:
            service:
              name: backend
              port:
                number: 8000
```

### Step 4: Apply the Ingress

```bash
kubectl apply -f k8s/ingress.yaml -n eklavya
```

### Step 5: Configure TLS/SSL (Optional but Recommended)

For HTTPS, create a TLS secret and update the ingress:

```bash
# Option A: Use cert-manager (recommended for automatic Let's Encrypt)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Option B: Manual certificate
kubectl create secret tls eklavya-tls \
  --cert=path/to/cert.crt \
  --key=path/to/key.key \
  -n eklavya
```

Then apply the ingress with TLS configured.

### Step 6: Update Frontend API URL

The frontend needs to know the backend API URL. Update `VITE_API_URL` in `k8s/frontend-deployment.yaml`:

```yaml
env:
  - name: VITE_API_URL
    value: "https://yourdomain.com/api"
```

Or if using the ingress path-based routing, keep it as `http://backend:8000` since the frontend and backend are in the same cluster.

## Notes

- No PostgreSQL or Azurite pods are deployed - these are Azure managed services external to the cluster
- The backend connects to Azure Database for PostgreSQL via `DATABASE_URL` secret
- The backend connects to Azure Blob Storage via `AZURE_STORAGE_CONNECTION_STRING` secret
- Frontend communicates with backend through Kubernetes service DNS (`http://backend:8000`)
- DNS propagation can take 5-30 minutes after creating A records
</write_to_file>
</execute_command>
<execute_command>
<command>ls -la Eklavya/k8s/</command>
<requires_approval>false</requires_approval>
</execute_command>