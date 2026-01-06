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
    
@communities_bp.route('/', methods=['POST'])
@jwt_required()
def create_community():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.form.to_dict()
        
        if not data.get('name'):
            return jsonify({'error': 'Community name is required'}), 400
        
        # Check if community name exists
        existing = Community.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({'error': 'Community name already exists'}), 409
        
        # Handle image upload
        image_url = None
        if 'image' in request.files:
            file = request.files['image']
            from app.utils.helpers import save_image, allowed_file
            if file and allowed_file(file.filename):
                filename = save_image(file)
                image_url = f'/uploads/{filename}'
        
        community = Community(
            name=data['name'],
            description=data.get('description', ''),
            admin_id=user.id,
            image_url=image_url,
            is_public=data.get('is_public', 'true').lower() == 'true'
        )
        
        db.session.add(community)
        
        # Add creator as first member
        membership = CommunityMember(
            community_id=community.id,
            user_id=user.id
        )
        db.session.add(membership)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Community created successfully',
            'community': community.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Create community error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
    
@communities_bp.route('/<string:community_id>', methods=['GET'])
def get_community(community_id):
    try:
        community = Community.query.filter_by(public_id=community_id).first()
        
        if not community:
            return jsonify({'error': 'Community not found'}), 404
        
        # Get recent posts in this community
        posts = Post.query.filter_by(category=community.name).order_by(
            Post.created_at.desc()
        ).limit(10).all()
        
        # Get member count
        member_count = CommunityMember.query.filter_by(
            community_id=community.id
        ).count()
        
        community_data = community.to_dict()
        community_data['recent_posts'] = [post.to_dict() for post in posts]
        community_data['member_count'] = member_count
        
        return jsonify({'community': community_data}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get community error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
    
@communities_bp.route('/<string:community_id>/join', methods=['POST'])
@jwt_required()
def join_community(community_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        community = Community.query.filter_by(public_id=community_id).first()
        
        if not user or not community:
            return jsonify({'error': 'User or community not found'}), 404
        
        # Check if already a member
        existing_membership = CommunityMember.query.filter_by(
            community_id=community.id,
            user_id=user.id
        ).first()
        
        if existing_membership:
            # Leave community
            db.session.delete(existing_membership)
            action = 'left'
            is_member = False
        else:
            # Join community
            membership = CommunityMember(
                community_id=community.id,
                user_id=user.id
            )
            db.session.add(membership)
            action = 'joined'
            is_member = True
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully {action} {community.name}',
            'is_member': is_member
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Join community error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
@communities_bp.route('/<string:community_id>/members', methods=['GET'])
def get_community_members(community_id):
    try:
        community = Community.query.filter_by(public_id=community_id).first()
        
        if not community:
            return jsonify({'error': 'Community not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        members = CommunityMember.query.filter_by(
            community_id=community.id
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        member_users = []
        for member in members.items:
            user = User.query.get(member.user_id)
            if user:
                member_users.append(user.to_dict())
        
        return jsonify({
            'members': member_users,
            'total': members.total,
            'page': members.page,
            'per_page': members.per_page,
            'pages': members.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get community members error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
