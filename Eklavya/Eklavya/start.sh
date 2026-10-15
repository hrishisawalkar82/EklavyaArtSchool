#!/bin/bash

echo "🎨 Starting Eklavya Art School Website..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

# Build and start all services
echo "🐳 Building and starting Docker containers..."
docker-compose up --build -d

echo ""
echo "✅ All services are starting!"
echo ""
echo "📍 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "💡 To view logs: docker-compose logs -f"
echo "💡 To stop: docker-compose down"
echo ""
echo "📦 Don't forget to upload images to Azure Blob Storage!"
echo "   See README.md for instructions"