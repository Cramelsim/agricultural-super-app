from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Post, Comment

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/post/<string:post_id>', methods=['GET'])
def get_comments(post_id):
    try:
        post = Post.query.filter_by(public_id=post_id).first()
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        comments = Comment.query.filter_by(post_id=post.id).order_by(
            Comment.created_at.asc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'comments': [comment.to_dict() for comment in comments.items],
            'total': comments.total,
            'page': comments.page,
            'per_page': comments.per_page,
            'pages': comments.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get comments error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
    
@comments_bp.route('/post/<string:post_id>', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        post = Post.query.filter_by(public_id=post_id).first()
        
        if not user or not post:
            return jsonify({'error': 'User or post not found'}), 404
        
        data = request.get_json()
        
        if not data.get('content'):
            return jsonify({'error': 'Comment content is required'}), 400
        
        comment = Comment(
            post_id=post.id,
            user_id=user.id,
            content=data['content']
        )
        
        # Update comment count on post
        post.comment_count += 1
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({
            'message': 'Comment added successfully',
            'comment': comment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Create comment error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
@comments_bp.route('/<string:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        comment = Comment.query.filter_by(public_id=comment_id).first()
        
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Check ownership
        if comment.user_id != user.id and user.user_type != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if not data.get('content'):
            return jsonify({'error': 'Comment content is required'}), 400
        
        comment.content = data['content']
        db.session.commit()
        
        return jsonify({
            'message': 'Comment updated successfully',
            'comment': comment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Update comment error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
    
@comments_bp.route('/<string:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        comment = Comment.query.filter_by(public_id=comment_id).first()
        
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Check ownership
        if comment.user_id != user.id and user.user_type != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update comment count on post
        post = Post.query.get(comment.post_id)
        if post:
            post.comment_count = max(0, post.comment_count - 1)
        
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({'message': 'Comment deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Delete comment error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
