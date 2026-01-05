from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Post, Like, Comment
from app.utils.helpers import save_image, allowed_file
import os

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/', methods=['GET'])
def get_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category')
        user_id = request.args.get('user_id')
        
        query = Post.query
        
        if category:
            query = query.filter_by(category=category)
        if user_id:
            query = query.filter_by(author_id=user_id)
        
        posts = query.order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'posts': [post.to_dict() for post in posts.items],
            'total': posts.total,
            'page': posts.page,
            'per_page': posts.per_page,
            'pages': posts.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get posts error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/', methods=['POST'])
@jwt_required()
def create_post():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.form.to_dict()
        
        # Validate required fields
        if not data.get('title') or not data.get('content'):
            return jsonify({'error': 'Title and content are required'}), 400
        
        # Handle image uploads
        image_urls = []
        if 'images' in request.files:
            files = request.files.getlist('images')
            for file in files:
                if file and allowed_file(file.filename):
                    filename = save_image(file)
                    image_url = f'/uploads/{filename}'
                    image_urls.append(image_url)
        
        # Create post
        post = Post(
            title=data['title'],
            content=data['content'],
            author_id=user.id,
            category=data.get('category'),
            tags=data.get('tags', '').split(',') if data.get('tags') else [],
            image_urls=image_urls
        )
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify({
            'message': 'Post created successfully',
            'post': post.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Create post error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
