from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from models import db, User, Reservation

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'your_secret_key'
db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    new_user = User(username=data['username'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username'], password=data['password']).first()
    if user:
        login_user(user)
        return jsonify({'message': 'Logged in successfully'})
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/reserve', methods=['POST'])
@login_required
def reserve():
    data = request.get_json()
    new_reservation = Reservation(user_id=current_user.id, date=data['date'], time=data['time'], guests=data['guests'])
    db.session.add(new_reservation)
    db.session.commit()
    return jsonify({'message': 'Reservation made successfully'}), 201

@app.route('/reservations', methods=['GET'])
@login_required
def get_reservations():
    reservations = Reservation.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'id': r.id, 'date': r.date, 'time': r.time, 'guests': r.guests} for r in reservations])

@app.route('/update_reservation/<int:reservation_id>', methods=['PUT'])
@login_required
def update_reservation(reservation_id):
    data = request.get_json()
    reservation = Reservation.query.get(reservation_id)
    if reservation and reservation.user_id == current_user.id:
        reservation.date = data['date']
        reservation.time = data['time']
        reservation.guests = data['guests']
        db.session.commit()
        return jsonify({'message': 'Reservation updated successfully'})
    return jsonify({'message': 'Reservation not found or not authorized'}), 404



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
