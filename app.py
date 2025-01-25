from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db  # use models.py  db exaplme
from routes import auth

# setup Flask 
app = Flask(__name__)

# allow CORS for all routes
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type"]}})


# SQLite 
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ini SQLAlchemy & Flask 
db.init_app(app)

#  register Blueprint
app.register_blueprint(auth)

# database
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5002)
