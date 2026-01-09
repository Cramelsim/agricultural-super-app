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
    
    # ✅ ADD THE HOME ROUTE HERE
    @app.route('/')
    def home():
        return "Flask is running!"
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.posts import posts_bp
    from app.routes.comments import comments_bp
    from app.routes.messages import messages_bp  # Remove duplicate
    from app.routes.follows import follows_bp
    from app.routes.communities import communities_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    app.register_blueprint(comments_bp, url_prefix='/api/comments')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(follows_bp, url_prefix='/api/follows')
    app.register_blueprint(communities_bp, url_prefix='/api/communities')
    # Remove duplicate: app.register_blueprint(messages_bp, url_prefix='/api/messages')
    
    # Create tables
    with app.app_context():
        db.create_all()

        # Create test user if none exist
        if User.query.count() == 0:
            from werkzeug.security import generate_password_hash
            test_user = User(
                username='admin',
                email='admin@example.com',
                password_hash=generate_password_hash('admin123'),
                full_name='Admin User',
                user_type='admin'
            )
            db.session.add(test_user)
            db.session.commit()
            print(f"Created admin user with public_id: {test_user.public_id}")
    
    return app