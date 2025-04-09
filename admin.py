from flask import Blueprint, request, jsonify
from models import db, Chat py

admin = Blueprint('admin', __name__)  # Define admin Blueprint

# Route to get all messages (for admin to see messages from users)
@admin.route('/api/admin/chat', methods=['GET'])
def get_all_messages():
    messages = Chat.query.all()
    return jsonify([{'id': msg.id, 'user_id': msg.user_id, 'message': msg.message, 'timestamp': msg.timestamp} for msg in messages])

# Route for admin to reply to a user
@admin.route('/api/admin/reply', methods=['POST'])
def admin_reply():
    data = request.get_json()
    user_id = data.get('user_id')
    reply_message = data.get('message')

    if not user_id or not reply_message:
        return jsonify({'error': 'User ID and message are required'}), 400

    new_message = Chat(user_id=user_id, message=reply_message, is_admin=True)
    db.session.add(new_message)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()  # Rollback if error occurs
        print(f"Error occurred: {e}")
        return jsonify({'error': 'Failed to save message to the database'}), 500

        return jsonify({'message': 'Admin response sent successfully'}), 201
 
