# backend/routes/explore.py
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
        
        # 2. Get Trending Communities (by member count)
        communities_query = Community.query.filter(Community.is_public == True)
        
        if search:
            communities_query = communities_query.filter(
                (Community.name.ilike(f'%{search}%')) |
                (Community.description.ilike(f'%{search}%'))
            )
        
        # Get communities with member counts
        communities = []
        for community in communities_query.order_by(desc(Community.created_at)).limit(limit).all():
            member_count = CommunityMember.query.filter_by(community_id=community.id).count()
            communities.append({
                'community': community.to_dict(),
                'member_count': member_count
            })
        
        # Sort communities by member count
        communities.sort(key=lambda x: x['member_count'], reverse=True)
        
        # 3. Get Trending Posts (most engagement in last week)
        one_week_ago = datetime.utcnow() - timedelta(days=7)
        
        trending_query = Post.query.filter(Post.created_at >= one_week_ago)
        
        if category:
            trending_query = trending_query.filter_by(category=category)
        
        if search:
            trending_query = trending_query.filter(
                (Post.title.ilike(f'%{search}%')) |
                (Post.content.ilike(f'%{search}%'))
            )
        
        trending_posts = trending_query.order_by(
            desc(Post.like_count + Post.comment_count)
        ).limit(limit).all()
        
        # 4. Get Categories (for filtering)
        categories = db.session.query(Post.category).distinct().filter(
            Post.category.isnot(None)
        ).order_by(Post.category).limit(20).all()
        
        # Format response
        experts_data = []
        for expert in experts:
            # Get follower count
            follower_count = Follow.query.filter_by(following_id=expert.id).count()
            
            experts_data.append({
                'public_id': expert.public_id,
                'name': expert.full_name or expert.username,
                'username': expert.username,
                'role': expert.expertise_area or expert.user_type.capitalize(),
                'user_type': expert.user_type,
                'location': expert.location,
                'profile_image': expert.profile_image,
                'bio': expert.bio,
                'expertise_area': expert.expertise_area,
                'follower_count': follower_count,
                'post_count': len(expert.posts),
                'created_at': expert.created_at.isoformat() if expert.created_at else None
            })
        
        communities_data = []
        for community_info in communities[:limit]:  # Limit the number of communities
            community_data = community_info['community']
            community_data['member_count'] = community_info['member_count']
            communities_data.append(community_data)
        
        trending_posts_data = []
        for post in trending_posts:
            post_data = post.to_dict()
            # Add engagement score
            post_data['engagement_score'] = post.like_count + post.comment_count
            trending_posts_data.append(post_data)
        
        categories_data = [category[0] for category in categories if category[0]]
        
        return jsonify({
            'success': True,
            'data': {
                'experts': experts_data,
                'communities': communities_data,
                'trending_posts': trending_posts_data,
                'categories': categories_data,
                'stats': {
                    'total_experts': len(experts_data),
                    'total_communities': len(communities_data),
                    'total_trending_posts': len(trending_posts_data)
                }
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get explore data error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@explore_bp.route('/experts', methods=['GET'])
def get_explore_experts():
    """Get experts for explore page"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        sort_by = request.args.get('sort_by', 'recent')  # recent, popular, name
        user_type = request.args.get('user_type')  # expert, advisor, specialist
        
        query = User.query.filter(
            (User.user_type.in_(['expert', 'advisor', 'specialist'])) |
            (User.expertise_area.isnot(None))
        ).filter(User.is_active == True)
        
        if user_type:
            query = query.filter(User.user_type == user_type)
        
        if search:
            query = query.filter(
                (User.full_name.ilike(f'%{search}%')) |
                (User.username.ilike(f'%{search}%')) |
                (User.expertise_area.ilike(f'%{search}%')) |
                (User.bio.ilike(f'%{search}%'))
            )
        
        # Apply sorting
        if sort_by == 'name':
            query = query.order_by(User.full_name.asc())
        elif sort_by == 'popular':
            # Sort by follower count (this is a simplified version)
            query = query.order_by(desc(User.created_at))
        else:  # recent
            query = query.order_by(desc(User.created_at))
        
        # Pagination
        experts = query.paginate(page=page, per_page=per_page, error_out=False)
        
        experts_data = []
        for expert in experts.items:
            follower_count = Follow.query.filter_by(following_id=expert.id).count()
            
            experts_data.append({
                'public_id': expert.public_id,
                'name': expert.full_name or expert.username,
                'username': expert.username,
                'role': expert.expertise_area or expert.user_type.capitalize(),
                'user_type': expert.user_type,
                'location': expert.location,
                'profile_image': expert.profile_image,
                'bio': expert.bio,
                'expertise_area': expert.expertise_area,
                'follower_count': follower_count,
                'post_count': len(expert.posts),
                'created_at': expert.created_at.isoformat() if expert.created_at else None
            })
        
        return jsonify({
            'success': True,
            'experts': experts_data,
            'total': experts.total,
            'page': experts.page,
            'per_page': experts.per_page,
            'pages': experts.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get explore experts error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@explore_bp.route('/communities', methods=['GET'])
def get_explore_communities():
    """Get communities for explore page"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        sort_by = request.args.get('sort_by', 'popular')  # popular, recent, name
        
        query = Community.query.filter(Community.is_public == True)
        
        if search:
            query = query.filter(
                (Community.name.ilike(f'%{search}%')) |
                (Community.description.ilike(f'%{search}%'))
            )
        
        # Apply sorting
        if sort_by == 'name':
            query = query.order_by(Community.name)
        elif sort_by == 'recent':
            query = query.order_by(desc(Community.created_at))
        else:  # popular (by member count)
            query = query.order_by(desc(Community.created_at))  # Placeholder
        
        # Pagination
        communities = query.paginate(page=page, per_page=per_page, error_out=False)
        
        communities_data = []
        for community in communities.items:
            member_count = CommunityMember.query.filter_by(
                community_id=community.id
            ).count()
            
            community_dict = community.to_dict()
            community_dict['member_count'] = member_count
            communities_data.append(community_dict)
        
        return jsonify({
            'success': True,
            'communities': communities_data,
            'total': communities.total,
            'page': communities.page,
            'per_page': communities.per_page,
            'pages': communities.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get explore communities error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@explore_bp.route('/trending', methods=['GET'])
def get_trending_posts():
    """Get trending posts for explore page"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category')
        time_frame = request.args.get('time_frame', 'week')  # day, week, month
        search = request.args.get('search', '')
        
        # Calculate time filter
        now = datetime.utcnow()
        if time_frame == 'day':
            time_filter = now - timedelta(days=1)
        elif time_frame == 'month':
            time_filter = now - timedelta(days=30)
        else:  # week
            time_filter = now - timedelta(days=7)
        
        query = Post.query.filter(Post.created_at >= time_filter)
        
        if category:
            query = query.filter_by(category=category)
        
        if search:
            query = query.filter(
                (Post.title.ilike(f'%{search}%')) |
                (Post.content.ilike(f'%{search}%'))
            )
        
        # Sort by engagement (likes + comments)
        posts = query.order_by(
            desc(Post.like_count + Post.comment_count)
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        posts_data = []
        for post in posts.items:
            post_dict = post.to_dict()
            post_dict['engagement_score'] = post.like_count + post.comment_count
            posts_data.append(post_dict)
        
        return jsonify({
            'success': True,
            'posts': posts_data,
            'total': posts.total,
            'page': posts.page,
            'per_page': posts.per_page,
            'pages': posts.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get trending posts error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@explore_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all post categories for filtering"""
    try:
        categories = db.session.query(Post.category).distinct().filter(
            Post.category.isnot(None)
        ).order_by(Post.category).all()
        
        categories_list = [category[0] for category in categories if category[0]]
        
        # Get counts for each category
        categories_with_counts = []
        for category in categories_list:
            count = Post.query.filter_by(category=category).count()
            categories_with_counts.append({
                'name': category,
                'count': count,
                'slug': category.lower().replace(' ', '-')
            })
        
        return jsonify({
            'success': True,
            'categories': categories_with_counts
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get categories error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@explore_bp.route('/stats', methods=['GET'])
def get_explore_stats():
    """Get explore page statistics"""
    try:
        # Total experts
        total_experts = User.query.filter(
            (User.user_type.in_(['expert', 'advisor', 'specialist'])) |
            (User.expertise_area.isnot(None))
        ).filter(User.is_active == True).count()
        
        # Total communities
        total_communities = Community.query.filter_by(is_public=True).count()
        
        # Total posts (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_posts = Post.query.filter(Post.created_at >= thirty_days_ago).count()
        
        # Top categories (by post count)
        top_categories = db.session.query(
            Post.category, 
            func.count(Post.id).label('post_count')
        ).filter(
            Post.category.isnot(None),
            Post.created_at >= thirty_days_ago
        ).group_by(Post.category).order_by(
            func.count(Post.id).desc()
        ).limit(5).all()
        
        top_categories_data = [
            {'name': cat[0], 'count': cat[1]}
            for cat in top_categories if cat[0]
        ]
        
        return jsonify({
            'success': True,
            'stats': {
                'total_experts': total_experts,
                'total_communities': total_communities,
                'recent_posts': recent_posts,
                'top_categories': top_categories_data
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get explore stats error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500