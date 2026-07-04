#!/usr/bin/env python3
"""
Quick test to upload sample images to local Azurite
This creates simple colored placeholder images for testing
"""
from azure.storage.blob import BlobServiceClient
from PIL import Image, ImageDraw, ImageFont
import io
import random

CONNECTION_STRING = "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"

def create_placeholder_image(width=800, height=600, text="Sample Art"):
    """Create a simple colored placeholder image"""
    color = (random.randint(50, 255), random.randint(50, 255), random.randint(50, 255))
    img = Image.new('RGB', (width, height), color=color)
    draw = ImageDraw.Draw(img)
    
    # Draw text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) / 2
    y = (height - text_height) / 2
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def upload_test_images():
    blob_service = BlobServiceClient.from_connection_string(CONNECTION_STRING)
    
    # Upload to gallery
    gallery_container = blob_service.get_container_client("gallery")
    print("📸 Uploading to gallery container...")
    for i in range(1, 11):
        img = create_placeholder_image(text=f"Art {i}")
        blob_client = gallery_container.get_blob_client(f"art_{i}.jpg")
        blob_client.upload_blob(img, overwrite=True)
        print(f"  ✅ Uploaded art_{i}.jpg")
    
    # Upload to kids
    kids_container = blob_service.get_container_client("kids")
    print("\n🎨 Uploading to kids container...")
    for i in range(1, 11):
        img = create_placeholder_image(text=f"Kid Art {i}")
        blob_client = kids_container.get_blob_client(f"kids_art_{i}.jpg")
        blob_client.upload_blob(img, overwrite=True)
        print(f"  ✅ Uploaded kids_art_{i}.jpg")
    
    print("\n🎉 Done! Uploaded 20 test images.")

if __name__ == "__main__":
    try:
        upload_test_images()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure Docker containers are running:")
        print("  docker-compose ps")
