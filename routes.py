from flask import Blueprint, request, jsonify
from models import db, User, Reservation
from datetime import datetime

# 創建 Blueprint
auth = Blueprint('auth', __name__)

@auth.route('/api/register', methods=['POST'])
def register():
    try:
        # 接收用戶提交的數據
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        # 檢查用戶是否已存在
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        # 創建新用戶
        new_user = User(name=name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@auth.route('/api/login', methods=['POST'])
def login():
    try:
        # 接收用戶提交的數據
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # 查詢用戶
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            return jsonify({"message": "Login successful"}), 200
        return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@auth.route('/api/reservations', methods=['GET'])
def get_reservations():
    try:
        email = request.args.get('email')
        reservations = Reservation.query.filter_by(user_email=email).all()
        return jsonify([{
            "id": r.id,
            "service_type": r.service_type,
            "date": r.date.strftime("%Y-%m-%d"),
            "time": r.time.strftime("%H:%M"),
            "status": r.status
        } for r in reservations]), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@auth.route('/api/available-times', methods=['GET'])
def get_available_times():
    try:
        date = request.args.get('date')
        reservations = Reservation.query.filter_by(date=datetime.strptime(date, "%Y-%m-%d").date()).all()
        reserved_times = [r.time.strftime("%H:%M") for r in reservations]
        all_times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]
        available_times = [t for t in all_times if t not in reserved_times]
        return jsonify({"available_times": available_times}), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    
@auth.route('/api/reserve', methods=['POST', 'OPTIONS'])
def reserve():
    if request.method == 'OPTIONS':
        # Respond to the OPTIONS preflight request
        return '', 200  # Just return an empty response with status 200

    try:
        # Receive the reservation data from the frontend
        data = request.get_json()
        service_type = data.get('service_type')
        date = data.get('date')
        time = data.get('time')
        user_email = data.get('user_email')

        # Ensure the necessary data is provided
        if not all([service_type, date, time, user_email]):
            return jsonify({"error": "Missing required fields"}), 400

        # Create a new reservation instance
        new_reservation = Reservation(
            service_type=service_type,
            date=datetime.strptime(date, "%Y-%m-%d").date(),
            time=datetime.strptime(time, "%H:%M").time(),
            user_email=user_email,
            status="Pending",  # You can adjust the default status as per your logic
        )

        # Add the reservation to the database
        db.session.add(new_reservation)
        db.session.commit()

        # Return the created reservation data as response
        return jsonify({
            "message": "Reservation successful",
            "reservation": {
                "id": new_reservation.id,
                "service_type": new_reservation.service_type,
                "date": new_reservation.date.strftime("%Y-%m-%d"),
                "time": new_reservation.time.strftime("%H:%M"),
                "status": new_reservation.status
            }
        }), 200

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500



    

    