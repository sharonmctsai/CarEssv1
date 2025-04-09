from flask import Blueprint, Flask, request, jsonify, session
from models import db, User, Reservation, ServiceItem, Chat
from datetime import datetime, date, timedelta
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from werkzeug.security import generate_password_hash
from flask_cors import cross_origin


app = Flask(__name__)

auth = Blueprint('auth', __name__)

GOOGLE_CLIENT_ID = "563323757566-3e1vbodsphja2bhf1scveb678dihb5lu.apps.googleusercontent.com"



@app.route("/api/update-profile", methods=["PUT"])
def update_profile():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()  # Find user by email

    if user:
        user.name = data["name"]  #  Update username
        if data["password"]:
            user.password = hash_password(data["password"])  # Hash new password
        
        db.session.commit()  #  Save changes to the database
        return jsonify({"message": "Profile updated", "name": user.name, "email": user.email}), 200
    else:
        return jsonify({"error": "User not found"}), 404


    
    return jsonify(updated_user), 200

@app.route('/api/chat', methods=['POST'])
def send_message():
    data = request.json
    user_id = data.get("user_id")
    message = data.get("message")
    role = data.get("role")  # 'user' or 'admin'

    if not user_id or not message or not role:
        return jsonify({"error": "Missing data"}), 400

    chat_ref = db_firestore.collection("chat_messages")
    
    chat_ref.add({
        "user_id": user_id,
        "message": message,
        "role": role,
        "timestamp": firestore.SERVER_TIMESTAMP
    })

    return jsonify({"message": "Message sent successfully"}), 201




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
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400
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
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            is_admin = (email == "admin@example.com")  
            return jsonify({
                "message": "Login successful",
                "is_admin": user.is_admin,
                "name": user.name,
                "id": user.id,
                 "email": user.email

                }), 200

        return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@auth.route('/api/admin-login', methods=['POST'])
def admin_login():
    return login()  # Call the existing login function


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


        if not all([service_type, user_email, date_str, time_str, car_model, license_plate]):
            return jsonify({"error": "Missing required fields"}), 400

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

                # Send an email confirmation
        confirmation_message = (
            f"Your reservation for {service_type} on {date_str} at {time_str} "
            f"has been confirmed. Car Model: {car_model}, License Plate: {license_plate}."
        )
        send_email_notification(user_email, confirmation_message)

        return jsonify({"message": "Reservation created successfully"}), 201
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500



@auth.route('/api/all-reservations', methods=['GET'])
def get_all_reservations():
    try:
        reservations = Reservation.query.all()
        return jsonify([{
            "id": r.id,
            "user_email": r.user_email,
            "service_type": r.service_type,
            "date": r.date.strftime("%Y-%m-%d"),
            "time": r.time.strftime("%H:%M"),
            "status": r.status,
            "car_model": r.car_model,
            "license_plate": r.license_plate
        } for r in reservations]), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@auth.route('/api/update-reservation/<int:id>', methods=['PUT', 'OPTIONS'])
@cross_origin()

def update_reservation(id):
    try:
        data = request.get_json()
        reservation = Reservation.query.get(id)
        if not reservation:
            return jsonify({"error": "Reservation not found"}), 404
        if 'service_type' in data:
            reservation.service_type = data['service_type']
        if 'date' in data:
            reservation.date = datetime.strptime(data['date'], "%Y-%m-%d").date()
        if 'time' in data:
            reservation.time = datetime.strptime(data['time'], "%H:%M").time()
        if 'car_model' in data:
            reservation.car_model = data['car_model']
        if 'license_plate' in data:
            reservation.license_plate = data['license_plate']

            reservation.status = "pending"

        db.session.commit()
        return jsonify({"message": "Reservation updated successfully"}), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@auth.route('/api/update-reservation-status', methods=['POST'])
def update_reservation_status():
    try:
        data = request.get_json()
        reservation_id = data.get('id')
        new_status = data.get('status')
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return jsonify({"error": "Reservation not found"}), 404
        reservation.status = new_status
        db.session.commit()
        return jsonify({"message": "Reservation status updated successfully"}), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


REMINDER_FREQUENCY = "daily"

@auth.route('/api/update-notification-settings', methods=['POST'])
def update_notification_settings():
    try:
        data = request.get_json()
        reminder_frequency = data.get('reminder_frequency')
        global REMINDER_FREQUENCY
        REMINDER_FREQUENCY = reminder_frequency
        return jsonify({"message": "Notification settings updated"}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error"}), 500


@auth.route('/api/notifications', methods=['GET'])
def get_notifications():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"error": "Email parameter is required"}), 400
        today = date.today()
        tomorrow = today + timedelta(days=1)
        reservations = Reservation.query.filter(
            Reservation.user_email == email,
            Reservation.date >= today,
            Reservation.date <= tomorrow
        ).all()
        notifications = []
        for res in reservations:
            message = f"Your reservation for {res.service_type} on {res.date.strftime('%Y-%m-%d')} at {res.time.strftime('%H:%M')} is coming up."
            notifications.append({
                "id": res.id,
                "message": message,
                "date": res.date.strftime('%Y-%m-%d')
            })
               # Send an email reminder
            send_email_notification(email, message)

        return jsonify(notifications), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

def send_email_notification(email, message):
    """Sends an email reminder to the user."""
    try:
        msg = Message("Booking Reminder", recipients=[email])
        msg.body = message
        mail.send(msg)
        print(f"Reminder email sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")



@auth.route('/api/customers', methods=['GET'])
def get_customers():
    try:
        customers = User.query.all()
        return jsonify([{
            "id": c.id,
            "name": c.name,
            "email": c.email
        } for c in customers]), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error"}), 500

@auth.route('/api/customers/<int:id>', methods=['DELETE'])
def delete_customer(id):
    try:
        customer = User.query.get(id)
        if customer:
            db.session.delete(customer)
            db.session.commit()
            return jsonify({"message": "Customer deleted"}), 200
        return jsonify({"error": "Customer not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error"}), 500


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
