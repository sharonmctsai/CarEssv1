from flask import Blueprint, Flask, request, jsonify, session
from models import db, User, Reservation, ServiceItem
from datetime import datetime, date, timedelta
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from werkzeug.security import generate_password_hash

app = Flask(__name__)  # initialize the Flask app

# 創建 Blueprint
auth = Blueprint('auth', __name__)

# Replace with your Google OAuth client ID
GOOGLE_CLIENT_ID = "563323757566-3e1vbodsphja2bhf1scveb678dihb5lu.apps.googleusercontent.com"

# This route will create a link to add the reservation to Google Calendar
@auth.route('/api/add-to-google-calendar/<int:id>', methods=['GET'])
def add_to_google_calendar(id):
    try:
        print(f"Received reservation ID: {id}")  # Log the received ID for debugging

        reservation = Reservation.query.get(id)
        if not reservation:
            return jsonify({"error": "Reservation not found"}), 404

    
        # Combine date and time into datetime objects
        start_datetime = datetime.combine(reservation.date, reservation.time)
        end_datetime = start_datetime + timedelta(hours=1)

        # Format as required by Google Calendar (YYYYMMDDTHHMMSS)
        start_time = start_datetime.strftime("%Y%m%dT%H%M%S")
        end_time = end_datetime.strftime("%Y%m%dT%H%M%S")


        # Format reservation data into Google Calendar parameters
        event_details = {
            "summary": reservation.service_type,
            "description": f"Your {reservation.service_type} appointment.",
            "start_time": start_time,
            "end_time": end_time,
            "attendees": [reservation.user_email],  # Optional: Add more attendees if needed
            "time_zone": "Europe/Dublin"  # Adjust time zone if necessary
        }

        # Convert event details to a Google Calendar URL
        calendar_url = f"https://www.google.com/calendar/render?action=TEMPLATE&text={event_details['summary']}&dates={event_details['start_time']}/{event_details['end_time']}&details={event_details['description']}&ctz={event_details['time_zone']}"

        return jsonify({"calendar_url": calendar_url}), 200

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@auth.route("/api/auth/google", methods=["POST"])
def google_login():
    try:
        data = request.get_json()
        token = data.get("token")

        if not token:
            return jsonify({"error": "Token is required"}), 400

        # Verify the token with Google's servers
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        # Extract user information
        email = idinfo["email"]
        name = idinfo.get("name", "Google User")

        # Check if user exists, otherwise create a new user
        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(name=name, email=email)
            db.session.add(user)
            db.session.commit()


        return jsonify({
            "message": "Google login successful",
            "name": user.name,
            "email": user.email
        }), 200
    
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return jsonify({"error": "Invalid token or Google authentication failed"}), 400
    
# Define the cancel reservation route
@auth.route("/api/cancel-reservation/<int:id>", methods=["DELETE", "OPTIONS"])
def cancel_reservation(id):
    if request.method == "OPTIONS":
        return "", 200  # Handle OPTIONS request for preflight

  # Cancel reservation logic (delete from DB)
    reservation = Reservation.query.filter_by(id=id).first()

    if reservation:
        db.session.delete(reservation)  # Delete the reservation
        db.session.commit()  # Commit the changes to the database
        return jsonify({"message": "Reservation cancelled successfully"}), 200
    else:
        return jsonify({"error": "Reservation not found"}), 404

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
            # Return user details along with the success message
            return jsonify({
                "message": "Login successful",
                "name": user.name,  # Include the user's name
                "email": user.email  # Include the user's email
            }), 200
        return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    


@auth.route('/api/history', methods=['GET'])
def get_reservation_history():
    email = request.args.get('email')  # Get the email from query params

    if not email:
        return jsonify({"error": "Email parameter is required"}), 400

    # Fetch past reservations (assuming "Completed" or past dates indicate history)
    past_reservations = Reservation.query.filter(
        (Reservation.user_email == email) &
        ((Reservation.status == "Completed") | (Reservation.date < datetime.today().date()))
    ).all()

    # Convert reservations to JSON response
    history_list = [
        {
            "id": res.id,
            "service_type": res.service_type,
            "date": res.date.strftime("%Y-%m-%d"),
            "time": res.time.strftime("%H:%M"),
            "status": res.status,
             "car_model": r.car_model,
            "license_plate": r.license_plate
        }
        for res in past_reservations
    ]

    return jsonify(history_list), 200


# 查詢使用者預約（分未來預約與歷史預約）
@auth.route('/api/reservations', methods=['GET'])
def get_reservations():
    try:
        email = request.args.get('email')
        is_history = request.args.get('history', '0') == '1'
        all_reservations = Reservation.query.filter_by(user_email=email).all()
        if is_history:
            filtered = [r for r in all_reservations if r.date < date.today()]
        else:
            filtered = [r for r in all_reservations if r.date >= date.today()]
        return jsonify([{
            "id": r.id,
            "service_type": r.service_type,
            "date": r.date.strftime("%Y-%m-%d"),
            "time": r.time.strftime("%H:%M"),
            "status": r.status,
            "car_model": r.car_model,
            "license_plate": r.license_plate
        } for r in filtered]), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# -----------------------------
# 查詢可用時段（使用全域 AVAILABLE_TIMES）
AVAILABLE_TIMES = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00","16:00","17:00"]

@auth.route('/api/available-times', methods=['GET'])
def get_available_times():
    try:
        date_str = request.args.get('date')
        if date_str:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            reservations = Reservation.query.filter_by(date=date_obj).all()
            reserved_times = [r.time.strftime("%H:%M") for r in reservations]
            available = [t for t in AVAILABLE_TIMES if t not in reserved_times]
            return jsonify({"available_times": available}), 200
        else:
            return jsonify({"available_times": AVAILABLE_TIMES}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error"}), 500

@auth.route('/api/update-available-times', methods=['POST'])
def update_available_times():
    try:
        data = request.get_json()
        new_times = data.get('available_times')
        global AVAILABLE_TIMES
        if isinstance(new_times, list):
            AVAILABLE_TIMES = new_times
            return jsonify({"message": "Available times updated"}), 200
        else:
            return jsonify({"error": "Invalid data format"}), 400
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error"}), 500

# -----------------------------
# 建立預約（含車輛資訊）
@auth.route('/api/reserve', methods=['POST'])
def reserve():
    try:
        data = request.get_json()
        service_type = data.get('service_type')
        user_email = data.get('user_email')
        date_str = data.get('date')
        time_str = data.get('time')
        car_model = data.get('car_model')
        license_plate = data.get('license_plate')
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        time_obj = datetime.strptime(time_str, "%H:%M").time()
        new_reservation = Reservation(
            user_email=user_email,
            service_type=service_type,
            date=date_obj,
            time=time_obj,
            car_model=car_model,
            license_plate=license_plate
        )
        db.session.add(new_reservation)
        db.session.commit()
        return jsonify({"message": "Reservation created successfully"}), 201
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@auth.route("/dashboard")
def dashboard():
    print(f"Session data in /dashboard: {session}")  # Debug session storage
    if 'user_email' not in session:
        print("User is not logged in, redirecting to login.")
        return jsonify({"error": "Not logged in", "redirect": "/api/login"}), 401

    return jsonify({"message": f"Welcome {session['user_name']} to the Dashboard!"}), 200

@auth.route('/api/user/update', methods=['PUT'])
def update_user():
    try:
        data = request.get_json()
        user_email = session.get("user_email") or data.get("email")  # Use session OR request data

        if not user_email:
            return jsonify({"error": "Unauthorized"}), 401

        user = User.query.filter_by(email=user_email).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update only provided fields
        user.name = data.get("name", user.name)
        if "password" in data and data["password"]:
            user.set_password(data["password"])

        db.session.commit()

        return jsonify({"message": "User updated successfully", "name": user.name, "email": user.email}), 200

    except Exception as e:
        print(f"Error updating user: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


# -----------------------------
# 服務項目管理
@auth.route('/api/service-items', methods=['GET'])
def get_service_items():
    try:
        items = ServiceItem.query.all()
        return jsonify([{
            "id": item.id,
            "name": item.name,
            "description": item.description
        } for item in items]), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error"}), 500

@auth.route('/api/service-items', methods=['POST'])
def add_service_item():
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        new_item = ServiceItem(name=name, description=description)
        db.session.add(new_item)
        db.session.commit()
        return jsonify({"message": "Service item added"}), 201
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error"}), 500

@auth.route('/api/service-items/<int:id>', methods=['DELETE'])
def delete_service_item(id):
    try:
        item = ServiceItem.query.get(id)
        if item:
            db.session.delete(item)
            db.session.commit()
            return jsonify({"message": "Service item deleted"}), 200
        return jsonify({"error": "Service item not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error"}), 500
