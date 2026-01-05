from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Post, Follow
from app.utils.helpers import save_image, allowed_file

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.form.to_dict()
        
        # Update basic info
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'bio' in data:
            user.bio = data['bio']
        if 'location' in data:
            user.location = data['location']
        if 'expertise_area' in data:
            user.expertise_area = data['expertise_area']
        
        # Handle profile image upload
        if 'profile_image' in request.files:
            file = request.files['profile_image']
            if file and allowed_file(file.filename):
                filename = save_image(file)
                user.profile_image = f'/uploads/{filename}'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Update profile error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<string:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.filter_by(public_id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's posts
        posts = Post.query.filter_by(author_id=user.id).order_by(Post.created_at.desc()).limit(10).all()
        
        user_data = user.to_dict()
        user_data['recent_posts'] = [post.to_dict() for post in posts]
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get user error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
    
@users_bp.route('/search', methods=['GET'])
def search_users():
    try:
        query = request.args.get('q', '')
        user_type = request.args.get('type')
        location = request.args.get('location')
        
        if not query and not user_type and not location:
            return jsonify({'error': 'Search query required'}), 400
        
        search_query = User.query.filter(User.is_active == True)
        
        if query:
            search_query = search_query.filter(
                (User.username.ilike(f'%{query}%')) |
                (User.full_name.ilike(f'%{query}%')) |
                (User.bio.ilike(f'%{query}%')) |
                (User.expertise_area.ilike(f'%{query}%'))
            )
        
        if user_type:
            search_query = search_query.filter_by(user_type=user_type)
        
        if location:
            search_query = search_query.filter(User.location.ilike(f'%{location}%'))
        
        users = search_query.limit(50).all()
        
        return jsonify({
            'users': [user.to_dict() for user in users],
            'count': len(users)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Search users error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500   