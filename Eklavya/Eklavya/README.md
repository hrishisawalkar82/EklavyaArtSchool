# Eklavya Art School

A full-stack web application for an art school with:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI + PostgreSQL
- **Storage**: Azure Blob Storage
- **Email**: Azure Communication Services

## Project Structure

```
Eklavya/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── routes/   # API routes
│   │   ├── models/   # SQLAlchemy models
│   │   └── main.py   # FastAPI app entry
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── AZURE_SETUP.md    # Azure configuration guide
```

## Prerequisites

1. **Azure Account** - Free account available at [azure.microsoft.com](https://azure.microsoft.com)
2. **Azure CLI** - Install from [docs.microsoft.com/cli](https://docs.microsoft.com/cli)
3. **GitHub Account** - For CI/CD deployment

## Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/hrishisawalkar82/EklavyaArtSchool.git
cd EklavyaArtSchool/Eklavya

# Create .env file from template
cp .env.example .env

# Start all services
./start.sh
```

### Azure Deployment

1. Create Azure resources (App Service, Storage, Database)
2. Configure environment secrets in GitHub
3. Push to main branch to trigger deployment

## Azure Resources Required

| Resource | Purpose | Free Tier |
|----------|---------|-----------|
| App Service | Hosts the web app | Yes |
| Storage Account | Blob storage for images | Yes |
| PostgreSQL | Database | No (paid) |
| Communication Services | Email | Yes |

## Environment Variables

### Azure Blob Storage
- `AZURE_STORAGE_CONNECTION_STRING` - Connection string from Azure Storage
- `AZURE_CONTAINER_GALLERY` - Gallery container name (default: gallery)
- `AZURE_CONTAINER_KIDS` - Kids container name (default: kids)

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Authentication
- `JWT_SECRET` - Secret for JWT token generation
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password

### Email
- `AZURE_COMMUNICATION_CONNECTION_STRING` - Azure Communication Services
- `AZURE_COMMUNICATION_SENDER` - Verified sender email

## GitHub Actions CI/CD

The repository includes GitHub Actions workflows for automated deployment:

- `.github/workflows/deploy.yml` - Deploys to production on main branch
- `.github/workflows/deploy-staging.yml` - Deploys to staging on develop branch

### Required GitHub Secrets

Configure the following secrets in your GitHub repository:

1. **AZURE_CREDENTIALS** - Azure service principal credentials
2. **AZURE_CREDENTIALS_STAGING** - Azure service principal for staging

#### Creating Azure Service Principal

```bash
az login
az ad sp create-for-rbac --name "EklavyaDeploy" --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
  --sdk-auth
```

## Deployment Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub     │────▶│  GitHub      │────▶│  Azure       │
│  Actions     │     │  Environment │     │  App Service │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Azure Blob  │
                     │   Storage    │
                     └──────────────┘
```

## Troubleshooting

### Images not loading
- Verify "Allow Blob public access" is enabled in Azure Storage
- Check container access policy

### Database connection issues
- Ensure PostgreSQL is accessible from App Service
- Check firewall settings

### Email not sending
- Verify Azure Communication Services is configured
- Check sender email is verified

## License

MIT