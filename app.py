from flask import Flask
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

# Load environment variables from the .env file
load_dotenv()

# Initialize Firebase
cred = credentials.Certificate("/Users/sharon/Desktop/CarEss b/firebase-credentials.json")
firebase_admin.initialize_app(cred)
firebase_db = firestore.client()  # Use a different variable name

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

# Initialize the database and create tables if needed
with app.app_context():
    db.create_all()

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5002)