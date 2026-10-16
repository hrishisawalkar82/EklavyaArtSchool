import os
import random
from azure.storage.blob import BlobServiceClient

CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
GALLERY_CONTAINER = os.getenv("AZURE_CONTAINER_GALLERY", "gallery")
KIDS_CONTAINER = os.getenv("AZURE_CONTAINER_KIDS", "kids")

_blob_service_client = None

def _get_blob_service_client():
    global _blob_service_client
    if _blob_service_client is None:
        if not CONNECTION_STRING:
            raise ValueError("AZURE_STORAGE_CONNECTION_STRING is not set")
        _blob_service_client = BlobServiceClient.from_connection_string(CONNECTION_STRING)
    return _blob_service_client

def ensure_containers():
    try:
        client = _get_blob_service_client()
        try:
            client.create_container(GALLERY_CONTAINER)
        except:
            pass
        try:
            client.create_container(KIDS_CONTAINER)
        except:
            pass
    except Exception as e:
        print(f"Warning: Could not ensure containers: {e}")

def get_random_images(container_name: str, count: int = 12):
    try:
        client = _get_blob_service_client()
        container_client = client.get_container_client(container_name)
    except Exception as e:
        print(f"Error getting blob service client: {e}")
        return []
    
    try:
        blobs = list(container_client.list_blobs())
    except Exception as e:
        print(f"Error listing blobs from {container_name}: {e}")
        return []
    
    if not blobs:
        return []
    
    selected = random.sample(blobs, min(count, len(blobs)))
    
    # Generate proper blob URLs
    # For local Azurite: use localhost for browser access
    # For production Azure: use blob client URL
    urls = []
    for blob in selected:
        blob_client = container_client.get_blob_client(blob.name)
        url = blob_client.url
        
        # If using Azurite (contains 'devstoreaccount1'), replace internal Docker hostname with localhost
        if 'devstoreaccount1' in url and 'azurite' in url:
            url = url.replace('azurite', 'localhost')
        
        urls.append({
            "name": blob.name,
            "url": url
        })
    
    return urls
