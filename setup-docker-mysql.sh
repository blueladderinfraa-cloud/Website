#!/bin/bash

echo "🐳 Setting up MySQL with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Stop and remove existing container if it exists
docker stop blueladder-mysql 2>/dev/null || true
docker rm blueladder-mysql 2>/dev/null || true

# Run MySQL container
echo "🚀 Starting MySQL container..."
docker run -d \
  --name blueladder-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=blueladder_db \
  -p 3306:3306 \
  mysql:8.0

echo "⏳ Waiting for MySQL to be ready..."
sleep 30

# Test connection
if docker exec blueladder-mysql mysql -uroot -ppassword -e "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ MySQL is ready!"
    echo "📊 Database: blueladder_db"
    echo "🔑 Username: root"
    echo "🔐 Password: password"
    echo "🌐 Host: localhost:3306"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Run: npm run db:push"
    echo "   2. Run: npm run dev"
else
    echo "❌ Failed to connect to MySQL"
    exit 1
fi
