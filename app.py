from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db  # 使用 models.py 中的 db 實例
from routes import auth

# 創建 Flask 應用
app = Flask(__name__)

# 啟用 CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# SQLite 配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化 SQLAlchemy 與 Flask 應用
db.init_app(app)

# 註冊 Blueprint
app.register_blueprint(auth)

# 創建數據庫
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5002)
