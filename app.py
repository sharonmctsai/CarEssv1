from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, User, Reservation, ServiceItem, Chat
from routes import auth
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, firestore
from admin import admin  # Import the admin blueprint from admin.py
from flask_mail import Mail
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

cred = credentials.Certificate("/Users/sharon/Desktop/CarEss b/firebase-credentials.json")
firebase_admin.initialize_app(cred)
firebase_db = firestore.client()  # Use a different variable name


# Load environment variables from the .env file
load_dotenv()

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


def send_email(to_email, subject, body):
    from_email = os.getenv("EMAIL_ADDRESS")  # Get email from environment
    password = os.getenv("EMAIL_PASSWORD")  # Get password from environment
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    msg = MIMEMultipart()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(from_email, password)
            server.sendmail(from_email, to_email, msg.as_string())
            print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

@app.route('/send_confirmation', methods=['POST'])
def send_confirmation():
    user_email = request.json.get("email")
    reservation_details = request.json.get("reservation_details")
    
    subject = "Reservation Confirmation"
    body = f"Dear user, your reservation has been confirmed: {reservation_details}"
    
    send_email(user_email, subject, body)
    return {"message": "Email sent"}

# SQLAlchemy setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db?timeout=10'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True  # Enable query logging for debugging

# Email Configuration (Use Google App Password)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # SMTP server
app.config['MAIL_PORT'] = 465  # SMTP port
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'your-email@example.com'
app.config['MAIL_PASSWORD'] = 'your-email-password'
app.config['MAIL_DEFAULT_SENDER'] = 'your-email@example.com'

mail = Mail(app)

app.register_blueprint(admin)  # Register admin routes
app.register_blueprint(auth)

db.init_app(app)
migrate = Migrate(app, db)
print("Type of db:", type(db))  # Should print: <class 'flask_sqlalchemy.SQLAlchemy'>



# Initialize the database and create tables if needed
with app.app_context():
    db.create_all()

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5002)
