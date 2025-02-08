from flask import Blueprint, Flask, request, jsonify, session
from models import db, User, Reservation
from datetime import datetime
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

app = Flask(__name__)  # initialize the Flask app

# Setup database, configurations, etc.
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///your_database.db'  # Example URI
db.init_app(app)

# 創建 Blueprint
auth = Blueprint('auth', __name__)

# Replace with your Google OAuth client ID
GOOGLE_CLIENT_ID = "563323757566-h08eu7gboig2s82slulk703lnhdq226s.apps.googleusercontent.com"

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
    
@auth.route('/api/reservations', methods=['GET'])
def get_reservations():
    email = request.args.get('email')  # Get the email from query params
    
    if not email:
        return jsonify({"error": "Email parameter is required"}), 400
    
    reservations = Reservation.query.filter_by(user_email=email).all()

    # Convert the reservations to a list of dictionaries
    reservations_list = [
        {
            "id": res.id,
            "service_type": res.service_type,
            "date": res.date.strftime("%Y-%m-%d"),
            "time": res.time.strftime("%H:%M"),
            "status": res.status
        }
        for res in reservations
    ]

    return jsonify(reservations_list), 200

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
            "status": res.status
        }
        for res in past_reservations
    ]

    return jsonify(history_list), 200


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

@auth.route("/dashboard")
def dashboard():
    print(f"Session data in /dashboard: {session}")  # Debug session storage
    if 'user_email' not in session:
        print("User is not logged in, redirecting to login.")
        return jsonify({"error": "Not logged in", "redirect": "/api/login"}), 401

    return jsonify({"message": f"Welcome {session['user_name']} to the Dashboard!"}), 200
