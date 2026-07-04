# Using Azure Blob Storage with Eklavya Art School

## ✅ Configuration Complete

Your application is now configured to use **Azure Blob Storage** instead of local Azurite.

### Current Setup

**Storage Account:** eklavyastorage  
**Containers:**
- `gallery` - 3 images ✅ (Public access enabled)
- `kids` - 3 images ✅ (Public access enabled)

## How to Add More Images

### Method 1: Azure Portal (Web Interface)
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Storage Account: **eklavyastorage**
3. Click **Containers**
4. Select `gallery` or `kids`
5. Click **Upload** and select your images
6. Supported formats: JPG, JPEG, PNG, GIF, WEBP

### Method 2: Azure Storage Explorer (Desktop App)
1. Download [Azure Storage Explorer](https://azure.microsoft.com/en-us/products/storage/storage-explorer/)
2. Connect using your connection string
3. Navigate to **eklavyastorage** → **Blob Containers**
4. Drag and drop images into `gallery` or `kids` containers

### Method 3: Command Line (Azure CLI)
```bash
# Install Azure CLI
brew install azure-cli  # macOS
# or: pip install azure-cli

# Login
az login

# Upload images
az storage blob upload-batch \
  --account-name eklavyastorage \
  --destination gallery \
  --source ./your-gallery-images/ \
  --pattern "*.jpg"
```

### Method 4: Python Script
```python
from azure.storage.blob import BlobServiceClient
import os

CONNECTION_STRING = "your-connection-string"
blob_service = BlobServiceClient.from_connection_string(CONNECTION_STRING)

# Upload to gallery
container = blob_service.get_container_client("gallery")
for filename in os.listdir("./images"):
    if filename.endswith(('.jpg', '.jpeg', '.png')):
        with open(f"./images/{filename}", "rb") as data:
            container.upload_blob(name=filename, data=data)
```

## Important Notes

### Public Access
Your containers are configured with **Blob-level public access**, which means:
- ✅ Individual blobs (images) are publicly accessible via URL
- ✅ Perfect for displaying images on a website
- ❌ Container listing is not public (for security)

### If Images Don't Load
1. Check Azure Storage Account settings:
   - Go to **Storage Account** → **Configuration**
   - Ensure **"Allow Blob public access"** is **Enabled**

2. Verify container access:
   ```bash
   docker-compose exec backend python -c "
   from app.blob import blob_service_client
   gallery = blob_service_client.get_container_client('gallery')
   print(gallery.get_container_properties().public_access)
   "
   # Should output: blob
   ```

3. If access is None, run:
   ```bash
   python3 enable_public_access.py
   ```

## Cost Considerations

Azure Blob Storage costs:
- **Storage**: ~$0.018 per GB/month (Hot tier)
- **Operations**: ~$0.004 per 10,000 read operations
- **Bandwidth**: First 100 GB free, then ~$0.087/GB

For a small art school website with ~100 images (~500MB), expect **~$1-2/month**.

## Switching Between Local and Azure

Edit `.env` file:

**For Local Development (Azurite):**
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://localhost:10000/devstoreaccount1;
```

**For Production (Azure):**
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=eklavyastorage;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net
```

Then restart:
```bash
docker-compose up -d --force-recreate backend
```

## Security Best Practices

1. **Never commit `.env` to git** - It contains your storage key
2. **Rotate keys periodically** - In Azure Portal under "Access keys"
3. **Consider SAS tokens** - For more granular control (advanced)
4. **Monitor usage** - Set up Azure alerts for unusual activity

## Troubleshooting

**Images not loading?**
```bash
# Check if API returns URLs
curl http://localhost:8000/api/images/gallery?count=3

# Check if container has images
docker-compose exec backend python -c "
from app.blob import blob_service_client
container = blob_service_client.get_container_client('gallery')
print(f'Images: {len(list(container.list_blobs()))}')
"
```

**Connection errors?**
- Verify connection string in `.env`
- Check Azure Storage firewall settings
- Ensure container names are correct (lowercase)
