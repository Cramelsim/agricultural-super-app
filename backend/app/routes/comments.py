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