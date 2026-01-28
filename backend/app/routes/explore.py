from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app import db
from app.models import User, Community, Post, Follow, CommunityMember

explore_bp = Blueprint('explore', __name__)

@explore_bp.route('/', methods=['GET'])
def get_explore_data():
    """Get explore page data: experts, trending communities, recent posts"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        category = request.args.get('category')
        search = request.args.get('search', '')
        
        # 1. Get Experts (users who are experts or have expertise)
        experts_query = User.query.filter(
            (User.user_type.in_(['expert', 'advisor', 'specialist'])) |
            (User.expertise_area.isnot(None))
        ).filter(User.is_active == True)
        
        if search:
            experts_query = experts_query.filter(
                (User.full_name.ilike(f'%{search}%')) |
                (User.username.ilike(f'%{search}%')) |
                (User.expertise_area.ilike(f'%{search}%')) |
                (User.bio.ilike(f'%{search}%'))
            )
        
        experts = experts_query.order_by(desc(User.created_at)).limit(limit).all()