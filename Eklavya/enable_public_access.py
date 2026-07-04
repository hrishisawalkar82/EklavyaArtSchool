#!/usr/bin/env python3
"""
Enable public blob access on Azure Storage containers
This allows images to be loaded directly in the browser
"""
import os
from azure.storage.blob import BlobServiceClient, PublicAccess

# Get connection string from environment or use default
CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

if not CONNECTION_STRING:
    print("❌ Error: AZURE_STORAGE_CONNECTION_STRING not set")
    print("Run: export AZURE_STORAGE_CONNECTION_STRING='your-connection-string'")
    exit(1)

def enable_public_access():
    blob_service = BlobServiceClient.from_connection_string(CONNECTION_STRING)
    
    containers = ["gallery", "kids"]
    
    for container_name in containers:
        try:
            container_client = blob_service.get_container_client(container_name)
            
            # Set public access to 'blob' level (blobs are public, but container listing is not)
            container_client.set_container_access_policy(
                signed_identifiers={},
                public_access=PublicAccess.Blob
            )
            
            print(f"✅ Enabled public blob access for: {container_name}")
            
        except Exception as e:
            print(f"❌ Error with {container_name}: {e}")
    
    print("\n🎉 Done! Your images should now be accessible in the browser.")
    print("\nNote: If this fails, you may need to enable 'Allow Blob public access'")
    print("in your Azure Storage Account settings first.")

if __name__ == "__main__":
    print("Enabling public blob access on Azure Storage containers...\n")
    enable_public_access()
