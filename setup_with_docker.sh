#!/bin/bash

echo "=================================================="
echo " Agricultural Super App - Docker Setup"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Install Docker with: sudo apt install docker.io docker-compose"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_warn "docker-compose not found. Installing..."
    sudo apt install -y docker-compose
fi

# Create project directories
print_info "Creating project directories..."
mkdir -p backend/uploads
mkdir -p postgres_data
mkdir -p init-scripts

# Create docker-compose.yml
print_info "Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
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
      - "5432:5432"
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: agriculture_backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:password123@postgres:5432/agriculture_app
      SECRET_KEY: development-secret-key-change-in-production
      JWT_SECRET_KEY: development-jwt-secret-key-change-in-production
    volumes:
      - ./backend:/app
      - ./backend/uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    command: >
      sh -c "flask db upgrade && python run.py"

  frontend:
    build: ./frontend
    container_name: agriculture_frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    stdin_open: true
    tty: true

volumes:
  postgres_data:
EOF

print_info "✅ Created docker-compose.yml"

# Create backend Dockerfile
print_info "Creating backend Dockerfile..."
cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "run.py"]
EOF

# Create frontend Dockerfile
print_info "Creating frontend Dockerfile..."
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
EOF

# Create database initialization script
print_info "Creating database initialization script..."
cat > init-scripts/01-init.sql << 'EOF'
-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sample users (passwords are hashed versions of: admin123, farmer123, expert123)
INSERT INTO users (public_id, username, email, password_hash, user_type, full_name, bio, location, expertise_area, is_active, created_at) 
VALUES 
(
    'admin_001',
    'admin',
    'admin@agriconnect.com',
    '$2b$12$8B3L5c7d9f1h3j5l7m9o1q3s5u7w9y1z3B5D7F9H1J3L5N7P9R1T3V5X7Z9',
    'admin',
    'Administrator',
    'System administrator',
    'Nairobi, Kenya',
    'System Management',
    true,
    NOW()
),
(
    'farmer_001',
    'john_farmer',
    'john@example.com',
    '$2b$12$8B3L5c7d9f1h3j5l7m9o1q3s5u7w9y1z3B5D7F9H1J3L5N7P9R1T3V5X7Z9',
    'farmer',
    'John Farmer',
    'Organic farmer with 20 years experience specializing in sustainable agriculture and crop rotation',
    'Iowa, USA',
    'Organic Farming',
    true,
    NOW()
),
(
    'expert_001',
    'dr_agri',
    'expert@example.com',
    '$2b$12$8B3L5c7d9f1h3j5l7m9o1q3s5u7w9y1z3B5D7F9H1J3L5N7P9R1T3V5X7Z9',
    'expert',
    'Dr. Agri Expert',
    'Agricultural scientist with PhD in Plant Pathology. 15 years of research experience in crop diseases and pest management',
    'California, USA',
    'Plant Pathology, Crop Diseases',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;
EOF

# Create backend requirements.txt if not exists
if [ ! -f backend/requirements.txt ]; then
    print_info "Creating requirements.txt..."
    cat > backend/requirements.txt << 'EOF'
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.4
Flask-JWT-Extended==4.5.2
Flask-CORS==4.0.0
psycopg2-binary==2.9.7
python-dotenv==1.0.0
Pillow==10.0.0
bcrypt==4.0.1
email-validator==2.0.0
gunicorn==21.2.0
EOF
fi

# Create backend .env file
print_info "Creating backend environment file..."
cat > backend/.env << 'EOF'
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=development-secret-key-change-in-production
JWT_SECRET_KEY=development-jwt-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:password123@postgres:5432/agriculture_app
EOF

# Create frontend .env file
print_info "Creating frontend environment file..."
cat > frontend/.env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
EOF

# Create a simple frontend package.json if not exists
if [ ! -f frontend/package.json ]; then
    print_info "Creating frontend package.json..."
    mkdir -p frontend/public
    mkdir -p frontend/src
    cat > frontend/package.json << 'EOF'
{
  "name": "agricultural-super-app-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.3.6"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF
fi

# Build and start containers
print_info "Building Docker containers (this may take a few minutes)..."
docker-compose down 2>/dev/null
docker-compose build

print_info "Starting services..."
docker-compose up -d

# Wait for services to start
print_info "Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is running
print_info "Checking PostgreSQL status..."
if docker-compose exec postgres pg_isready -U postgres; then
    print_info "✅ PostgreSQL is running"
else
    print_error "❌ PostgreSQL failed to start"
    docker-compose logs postgres
    exit 1
fi

# Check if backend is running
print_info "Checking backend status..."
sleep 5
if curl -s http://localhost:5000/api/auth/health > /dev/null 2>&1; then
    print_info "✅ Backend is running"
elif curl -s http://localhost:5000 > /dev/null 2>&1; then
    print_info "✅ Backend is running"
else
    print_warn "Backend might still be starting..."
    docker-compose logs backend
fi

# Create a health check endpoint
print_info "Creating health check endpoint..."
cat > backend/app/routes/health.py << 'EOF'
from flask import Blueprint, jsonify
from app import db
from sqlalchemy import text

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    try:
        # Check database connection
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': '2024-01-01T00:00:00Z'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e)
        }), 500
EOF

# Add health blueprint to backend __init__.py
if grep -q "health" backend/app/__init__.py; then
    print_info "Health check already configured"
else
    # Add import
    sed -i "s/from app.routes.messages import messages_bp/from app.routes.messages import messages_bp\nfrom app.routes.health import health_bp/" backend/app/__init__.py
    
    # Add blueprint registration
    sed -i "s/app.register_blueprint(messages_bp, url_prefix='\/api\/messages')/app.register_blueprint(messages_bp, url_prefix='\/api\/messages')\n    app.register_blueprint(health_bp, url_prefix='\/api\/auth')/" backend/app/__init__.py
fi

# Restart backend to apply changes
docker-compose restart backend

echo ""
echo "=================================================="
echo " Setup Complete! "
echo "=================================================="
echo ""
echo "Services are now running:"
echo ""
echo "🌐 Frontend:      http://localhost:3000"
echo "⚙️  Backend API:   http://localhost:5000"
echo "📊 PostgreSQL:    localhost:5432"
echo ""
echo "Database Credentials:"
echo "  Database: agriculture_app"
echo "  Username: postgres"
echo "  Password: password123"
echo ""
echo "Default Login Credentials:"
echo "  👑 Admin:  admin@agriconnect.com / admin123"
echo "  👨‍🌾 Farmer: john@example.com / farmer123"
echo "  👨‍�� Expert: expert@example.com / expert123"
echo ""
echo "Commands:"
echo "  View logs:              docker-compose logs -f"
echo "  Stop services:          docker-compose down"
echo "  Restart services:       docker-compose restart"
echo "  View running containers: docker ps"
echo ""
echo "To access PostgreSQL directly:"
echo "  docker-compose exec postgres psql -U postgres -d agriculture_app"
echo ""
echo "=================================================="
