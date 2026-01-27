#!/bin/bash

echo "=== Fixing All Issues ==="

# 1. Stop everything
echo "1. Stopping all services..."
docker-compose down 2>/dev/null || true
pkill -f "python.*run.py" 2>/dev/null || true

# 2. Fix port conflict
echo "2. Fixing port conflicts..."
sudo fuser -k 5432/tcp 2>/dev/null || true
sudo fuser -k 5433/tcp 2>/dev/null || true
sudo fuser -k 5000/tcp 2>/dev/null || true

# 3. Update docker-compose.yml
echo "3. Updating docker-compose.yml..."
cat > docker-compose.yml << 'DOCKEREOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: agriculture_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: agriculture_app
    ports:
      - "5433:5432"
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
DOCKEREOF

# 4. Start PostgreSQL
echo "4. Starting PostgreSQL on port 5433..."
docker-compose up -d postgres
sleep 8

# 5. Update backend config
echo "5. Updating backend configuration..."
cd backend

cat > config.py << 'CONFIGEOF'
import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://postgres:password123@localhost:5433/agriculture_app'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False
    
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
CONFIGEOF

cat > .env << 'ENVEOF'
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:password123@localhost:5433/agriculture_app
ENVEOF

# 6. Test database connection
echo "6. Testing database connection..."
cd ..
if docker-compose exec postgres pg_isready -U postgres; then
    echo "✅ PostgreSQL is running"
    
    # Initialize database
    echo "Creating database tables..."
    docker-compose exec postgres psql -U postgres -d agriculture_app -c "
        CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT);
        INSERT INTO test_table (name) VALUES ('Test Connection');
        SELECT * FROM test_table;
    "
else
    echo "❌ PostgreSQL failed to start"
    docker-compose logs postgres
    exit 1
fi

# 7. Install Python dependencies
echo "7. Installing Python dependencies..."
cd backend
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt 2>/dev/null || pip install flask flask-sqlalchemy psycopg2-binary

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To start the backend:"
echo "  cd ~/code/agricultural-super-app/backend"
echo "  source venv/bin/activate"
echo "  python run.py"
echo ""
echo "The app will be available at: http://localhost:5000"
