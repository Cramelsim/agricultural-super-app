from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Community, CommunityMember, Post

communities_bp = Blueprint('communities', __name__)

@communities_bp.route('/', methods=['GET'])
def get_communities():
    try:
        search = request.args.get('search', '')
        category = request.args.get('category')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Community.query
        
        if search:
            query = query.filter(Community.name.ilike(f'%{search}%'))
        
        if category:
            query = query.filter(Community.category == category)
        
        communities = query.order_by(Community.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'communities': [community.to_dict() for community in communities.items],
            'total': communities.total,
            'page': communities.page,
            'per_page': communities.per_page,
            'pages': communities.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get communities error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500