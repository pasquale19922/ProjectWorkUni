from flask import Flask, request, jsonify, render_template, session #creare le sessioni utente
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_cors import CORS
from models import db, User, Reservation

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'pasquale'
app.config['SESSION_COOKIE_SECURE'] = True  # Per i cookie
app.config['SESSION_COOKIE_SAMESITE'] = 'None' 
db.init_app(app)

CORS(app, supports_credentials=True) # Enable CORS

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    new_user = User(username=data['username'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Utente registrato con successo!'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # Ho inserito dei controlli per verificare il giusto funzionamento della funzione
    # Ho commentato, non è coinvolto nel funzionamento del programma
    # print(f"Login attempt with username: {data['username']} and password: {data['password']}")
    user = User.query.filter_by(username=data['username'], password=data['password']).first()

    if user:
        login_user(user)
        # print(f"Login riuscito per: {user.username}")
        # print(f"Session cookie: {session}")
        return jsonify({'message': 'Utente Loggato con successo'})
        
    
    # print(f"Login fallito per: {data['username']}")
    return jsonify({'message': 'Credenziali non valide! Ritenta o contatta il ristorante'}), 401


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Sessione terminata con succcesso! Grazie'})


@app.route('/reserve', methods=['POST'])
@login_required
def reserve():
    # print(f"Utente autenticato: {current_user.username}") 
    data = request.get_json()
    new_reservation = Reservation(user_id=current_user.id, date=data['date'], time=data['time'], guests=data['guests'])
    db.session.add(new_reservation)
    db.session.commit()
    return jsonify({'message': 'Prenotazione effettuata con successo!'}), 201

@app.route('/reservations', methods=['GET'])
@login_required
def get_reservations():
    # print(f"Utente loggato: {current_user.username}")  # Verifica che l'utente sia loggato
    try:
        reservations = Reservation.query.filter_by(user_id=current_user.id).all() 
        return jsonify([reservation.to_dict() for reservation in reservations]) 
    except Exception as e:
        return jsonify({'message': 'Errore nel recupero delle prenotazioni'}), 500


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
        return jsonify({'message': 'Prenotazione modificata con successo!'})
    return jsonify({'message': 'Prenotazione non trovata o non autorizzata'}), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)