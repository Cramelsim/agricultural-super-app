# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    
    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Add home route
    @app.route('/')
    def home():
        return "Flask is running!"
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.posts import posts_bp
    from app.routes.comments import comments_bp
    from app.routes.messages import messages_bp
    from app.routes.follows import follows_bp
    from app.routes.communities import communities_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    app.register_blueprint(comments_bp, url_prefix='/api/comments')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(follows_bp, url_prefix='/api/follows')
    app.register_blueprint(communities_bp, url_prefix='/api/communities')
    
    # Create tables and add test data
    with app.app_context():
        db.create_all()
        create_test_data(app)
    
    return app

def create_test_data(app):
    """Create test data if database is empty"""
    from app.models import User
    from werkzeug.security import generate_password_hash
    
    # Create test user if none exist
    if User.query.count() == 0:
        print("Creating test user...")
        test_user = User(
            username='testfarmer',
            email='test@example.com',
            password_hash=generate_password_hash('password123'),
            full_name='Test Farmer',
            user_type='farmer',
            bio='I am a test farmer',
            location='Nairobi'
        )
        db.session.add(test_user)
        db.session.commit()
        print(f"Created test user with public_id: {test_user.public_id}")