# Eklavya Art School Website

Full-stack website for Eklavya Art School with React frontend and Python FastAPI backend.

## Features

- **Home Page**: Hero section, featured artwork, instructor info, and about us
- **Gallery**: Random art images loaded from Azure Blob Storage
- **Kids Corner**: Random kids artwork loaded from Azure Blob Storage
- **Contact**: Contact form with database storage
- **Payment**: Display Venmo QR code and bank transfer details

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls

### Backend
- Python FastAPI
- SQLAlchemy with PostgreSQL
- Azure Blob Storage SDK
- Pydantic for validation

### Infrastructure
- Docker & Docker Compose
- PostgreSQL database
- Azurite (Azure Storage Emulator)

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

1. Clone the repository and navigate to the project:
```bash
cd /path/to/Eklavya
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Local Development

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Uploading Images to Azure Blob Storage

### Using Azure Storage Explorer (Recommended)
1. Download [Azure Storage Explorer](https://azure.microsoft.com/en-us/products/storage/storage-explorer/)
2. Connect to local Azurite:
   - Connection string: `DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;`
3. Upload images to `gallery` container for gallery images
4. Upload images to `kids` container for kids artwork

### Using Azure CLI
```bash
# Install Azure CLI
pip install azure-cli

# Upload to gallery container
az storage blob upload-batch \
  --connection-string "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;" \
  --destination gallery \
  --source ./your-images-folder

# Upload to kids container
az storage blob upload-batch \
  --connection-string "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;" \
  --destination kids \
  --source ./kids-images-folder
```

## Database Schema

### Contacts Table
- id: Primary key
- name: Contact name
- email: Contact email
- phone: Phone number (optional)
- message: Message content
- created_at: Timestamp

## API Endpoints

- `GET /api/images/gallery?count=12` - Get random gallery images
- `GET /api/images/kids?count=12` - Get random kids images
- `POST /api/contact` - Submit contact form

## Production Deployment

For production, update the following:

1. Replace Azurite with actual Azure Blob Storage
2. Update connection strings in `.env`
3. Set up proper PostgreSQL instance
4. Configure environment-specific variables
5. Enable HTTPS
6. Set up proper authentication

## License

MIT
