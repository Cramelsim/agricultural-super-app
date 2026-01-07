from flask import Blueprint, request, jsonify, current_app, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Message
from datetime import datetime
import json

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        # Get all unique users the current user has conversations with
        sent_to = db.session.query(Message.receiver_id).filter_by(
            sender_id=user.id
        ).distinct()
        
        received_from = db.session.query(Message.sender_id).filter_by(
            receiver_id=user.id
        ).distinct()
        
        # Combine and get unique user IDs
        user_ids = set([id[0] for id in sent_to] + [id[0] for id in received_from])
        
        conversations = []
        for user_id in user_ids:
            if user_id != user.id:
                other_user = User.query.get(user_id)
                if other_user:
                    # Get last message
                    last_message = Message.query.filter(
                        ((Message.sender_id == user.id) & (Message.receiver_id == other_user.id)) |
                        ((Message.sender_id == other_user.id) & (Message.receiver_id == user.id))
                    ).order_by(Message.created_at.desc()).first()
                    
                    # Count unread messages
                    unread_count = Message.query.filter_by(
                        sender_id=other_user.id,
                        receiver_id=user.id,
                        is_read=False
                    ).count()
                    
                    conversations.append({
                        'user': other_user.to_dict(),
                        'last_message': last_message.to_dict() if last_message else None,
                        'unread_count': unread_count,
                        'last_updated': last_message.created_at.isoformat() if last_message else None
                    })
        
        # Sort by last message time
        conversations.sort(key=lambda x: x['last_updated'] or '', reverse=True)
        
        return jsonify({'conversations': conversations}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get conversations error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500