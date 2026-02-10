from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Follow

follows_bp = Blueprint('follows', __name__)

@follows_bp.route('/<string:user_id>/follow', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.filter_by(public_id=current_user_id).first()
        target_user = User.query.filter_by(public_id=user_id).first()
        
        if not current_user or not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        if current_user.id == target_user.id:
            return jsonify({'error': 'Cannot follow yourself'}), 400
        
        # Check if already following
        existing_follow = Follow.query.filter_by(
            follower_id=current_user.id,
            following_id=target_user.id
        ).first()
        
        if existing_follow:
            # Unfollow
            db.session.delete(existing_follow)
            action = 'unfollowed'
            is_following = False
        else:
            # Follow
            new_follow = Follow(
                follower_id=current_user.id,
                following_id=target_user.id
            )
            db.session.add(new_follow)
            action = 'followed'
            is_following = True
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully {action} {target_user.username}',
            'is_following': is_following,
            'follower_count': Follow.query.filter_by(following_id=target_user.id).count()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Follow error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
    
@follows_bp.route('/following', methods=['GET'])
@jwt_required()
def get_following():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get following users
        following = Follow.query.filter_by(follower_id=user.id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        following_users = []
        for follow in following.items:
            following_user = User.query.get(follow.following_id)
            if following_user:
                following_users.append(following_user.to_dict())
        
        return jsonify({
            'following': following_users,
            'total': following.total,
            'page': following.page,
            'per_page': following.per_page,
            'pages': following.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get following error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
    
@follows_bp.route('/followers', methods=['GET'])
@jwt_required()
def get_followers():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get followers
        followers = Follow.query.filter_by(following_id=user.id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        follower_users = []
        for follow in followers.items:
            follower_user = User.query.get(follow.follower_id)
            if follower_user:
                follower_users.append(follower_user.to_dict())
        
        return jsonify({
            'followers': follower_users,
            'total': followers.total,
            'page': followers.page,
            'per_page': followers.per_page,
            'pages': followers.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get followers error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
@follows_bp.route('/check/<string:user_id>', methods=['GET'])
@jwt_required()
def check_follow(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.filter_by(public_id=current_user_id).first()
        target_user = User.query.filter_by(public_id=user_id).first()
        
        if not current_user or not target_user:
            return jsonify({'error': 'User not found'}), 404
        
        is_following = Follow.query.filter_by(
            follower_id=current_user.id,
            following_id=target_user.id
        ).first() is not None
        
        return jsonify({
            'is_following': is_following
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Check follow error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
