from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, User, Reservation, ServiceItem, Chat
from routes import auth  # Import the auth blueprint
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, firestore
from admin import admin  # Import the admin blueprint from admin.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import json

# Load environment variables from the .env file
load_dotenv()

# Initialize Firebase

firebase_config = {
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),  # Fix newlines
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
}

cred = credentials.Certificate(firebase_config)  # Load from dict instead of file
firebase_admin.initialize_app(cred)
firebase_db = firestore.client()


# Create Flask app
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')

# Enable CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:3000", 
                             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
                             "allow_headers": ["Content-Type", "Authorization"], 
                             "supports_credentials": True}})

@app.after_request
def add_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["Cross-Origin-Embedder-Policy"] = "credentialless"
    return response




# SQLAlchemy setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db?timeout=10'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True  # Enable query logging for debugging


# Register blueprints
app.register_blueprint(admin)  # Register admin routes
app.register_blueprint(auth)  # Register auth routes


# Initialize database and migrations
db.init_app(app)
migrate = Migrate(app, db)
print("Type of db:", type(db))  # Should print: <class 'flask_sqlalchemy.SQLAlchemy'>

# Initialize the scheduler
scheduler = BackgroundScheduler()

def send_reminder_email(user_email, reservation):
    try:
        print(f"Sending reminder email to {user_email}")  # Debug log

        message = Mail(
            from_email='sharonmctsai@gmail.com',
            to_emails='sharonmctsai@gmail.com',
            subject='CarEss: Reminder for Your Next Service 🚗🔧',
            html_content=f'''
                <strong>Dear Customer,</strong><br>
                This is a reminder for your upcoming service.<br><br>
                <strong>Details:</strong><br>
                Service Type: {reservation.service_type}<br>
                Date: {reservation.date}<br>
                Time: {reservation.time}<br>
                Car Model: {reservation.car_model}<br>
                License Plate: {reservation.license_plate}<br>
                <br> If you have any questions or need assistance, you can reply to this email or call us at <a href="tel:+08001234567"> 0800-123-4567</a>.<br>
                <br>

                Thank you for choosing CarEss!<br>
                Regards,<br>
                CarEss Team
            '''
        )
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(f"Reminder email sent! Status Code: {response.status_code}")
    except Exception as e:
        print(f"Error sending reminder email: {str(e)}")

def check_and_send_reminders():
    with app.app_context():
        try:
            now = datetime.now()
            reservations = Reservation.query.filter(
                Reservation.date < now.date(),
                Reservation.status == 'confirmed',
                Reservation.reminder_sent == False
            ).all()
            print(f"Found {len(reservations)} reservations to process.")  # Debug log
            for reservation in reservations:
                print(f"Processing reservation ID: {reservation.id}")  # Debug log
                send_reminder_email(reservation.user_email, reservation)
                reservation.reminder_sent = True
                db.session.commit()
                print(f"Reminder sent for reservation ID: {reservation.id}")
        except Exception as e:
            print(f"Error in reminder task: {str(e)}")


# Schedule the task to run every day at 6:00 AM
scheduler.add_job(
    func=check_and_send_reminders,
    trigger='cron',
    hour=6,
    minute=00,
    timezone='UTC'
)

# Flag to track if the scheduler has been started
scheduler_started = False
print("Scheduler started.")

@app.before_request
def initialize_scheduler():
    global scheduler_started
    if not scheduler_started:
        scheduler.start()
        scheduler_started = True



def send_confirmation_email(user_email, reservation):
    try:
        # Create the email message
        message = Mail(
            from_email='sharonmctsai@gmail.com', 
            to_emails='sharonmctsai@gmail.com',  # User's email
            subject='CareEss : Booking Confirmation 📅',
            html_content=f'''
                <strong>Dear Customer,</strong><br>
                Your booking has been confirmed!<br><br>
                <strong>Details:</strong><br>
                Service Type: {reservation.service_type}<br>
                Date: {reservation.date}<br>
                Time: {reservation.time}<br>
                Car Model: {reservation.car_model}<br>
                License Plate: {reservation.license_plate}<br>
                 <br>
                If you have any questions or need assistance, you can reply to this email or call us at <a href="tel:+08001234567"> 0800-123-4567</a>.<br>
                <br>

                Thank you for choosing CarEss!<br>
                Regards,<br>
                CarEss Team
            '''
        )

        # Initialize SendGrid client
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))  # API key in .env file
        response = sg.send(message)

        # Log the response
        print(f"Confirmation email sent! Status Code: {response.status_code}")
        print(f"Response Body: {response.body}")
        print(f"Response Headers: {response.headers}")

    except Exception as e:
        print(f"Error sending confirmation email: {str(e)}")
        
@app.route('/api/confirm-booking/<int:reservation_id>', methods=['PUT'])
def confirm_booking(reservation_id):
    print(f"Confirming booking for reservation ID: {reservation_id}")  # Debugging
    try:
        # Fetch the reservation from the database
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return jsonify({"error": "Reservation not found."}), 404

        # Update the status to "confirmed"
        reservation.status = 'confirmed'
        db.session.commit()

        # Send a confirmation email to the user
        send_confirmation_email(reservation.user_email, reservation)

        return jsonify({"message": "Reservation confirmed successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    


# Initialize the database
with app.app_context():
    test_reservation = Reservation(
        user_email="sharonmctsai@gmail.com",
        service_type="Oil Change",
        date=datetime(2025, 3, 21).date(),  # Past date
        time=datetime.strptime("14:00", "%H:%M").time(),
        status="confirmed",
        car_model="Toyota Camry",
        license_plate="ABC123",
        reminder_sent=False
    )
    db.session.add(test_reservation)
    db.session.commit()
    print("Test reservation added.")

# Function to shut down the scheduler
def shutdown_scheduler():
    try:
        if scheduler.running:
            scheduler.shutdown()
            print("Scheduler shut down.")
    except Exception as e:
        print(f"Error shutting down scheduler: {e}")

# Ensure the scheduler is shut down when the app stops
@app.teardown_appcontext
def teardown_scheduler(exception=None):
    shutdown_scheduler()


# Run the app
if __name__ == '__main__':
    with app.app_context():
        check_and_send_reminders()  # Manually trigger the function
    app.run(debug=True, port=5002)
   