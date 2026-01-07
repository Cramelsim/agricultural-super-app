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
@messages_bp.route('/user/<string:user_id>', methods=['GET'])
@jwt_required()
def get_messages(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.filter_by(public_id=current_user_id).first()
        other_user = User.query.filter_by(public_id=user_id).first()
        
        if not current_user or not other_user:
            return jsonify({'error': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        messages = Message.query.filter(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == other_user.id)) |
            ((Message.sender_id == other_user.id) & (Message.receiver_id == current_user.id))
        ).order_by(Message.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Mark messages as read
        unread_messages = Message.query.filter_by(
            sender_id=other_user.id,
            receiver_id=current_user.id,
            is_read=False
        ).all()
        
        for msg in unread_messages:
            msg.is_read = True
        
        db.session.commit()
        
        return jsonify({
            'messages': [msg.to_dict() for msg in reversed(messages.items)],  # Oldest first
            'total': messages.total,
            'page': messages.page,
            'per_page': messages.per_page,
            'pages': messages.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Get messages error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
@messages_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        data = request.get_json()
        
        if not data.get('receiver_id'):
            return jsonify({'error': 'Receiver ID is required'}), 400
        
        if not data.get('content'):
            return jsonify({'error': 'Message content is required'}), 400
        
        receiver = User.query.filter_by(public_id=data['receiver_id']).first()
        
        if not receiver:
            return jsonify({'error': 'Receiver not found'}), 404
        
        if user.id == receiver.id:
            return jsonify({'error': 'Cannot send message to yourself'}), 400
        
        message = Message(
            sender_id=user.id,
            receiver_id=receiver.id,
            content=data['content']
        )
        
        db.session.add(message)
        db.session.commit()
        
        # Here you would typically send a real-time notification
        # For now, we'll just return the message
        
        return jsonify({
            'message': 'Message sent successfully',
            'message_data': message.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Send message error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
@messages_bp.route('/<string:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        message = Message.query.filter_by(public_id=message_id).first()
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Only sender can delete their message
        if message.sender_id != user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({'message': 'Message deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Delete message error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
@messages_bp.route('/unread/count', methods=['GET'])
@jwt_required()
def get_unread_count():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        unread_count = Message.query.filter_by(
            receiver_id=user.id,
            is_read=False
        ).count()
        
        return jsonify({'unread_count': unread_count}), 200
        
    except Exception as e:
        current_app.logger.error(f'Get unread count error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
