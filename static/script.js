async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        // Controlla se la risposta è corretta
        if (!response.ok) {
            throw new Error('Errore nella registrazione!');
        }

        const data = await response.json();
        alert(data.message);  // Mostra il messaggio di successo
    } catch (error) {
        console.error('Errore:', error);
        alert('Si è verificato un errore durante la registrazione.');
    }
}


async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        // Controlla se la risposta è positiva
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Errore durante il login!');
        }

        alert(data.message);  // Mostra il messaggio di successo

        // Se login è riuscito, carica le prenotazioni
        fetchReservations();
    } catch (error) {
        console.error('Errore:', error);
        alert('Credenziali non valide o errore nel login.');
    }
}

async function makeReservation() {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const guests = document.getElementById('guests').value;
    const response = await fetch('http://localhost:5000/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, guests }),
        credentials: 'include' /* NECESSARIO per la gestione della sessione*/
    });

    // Verifica se la risposta è un successo (status 200)
    if (!response.ok) {
        console.error('Errore nella risposta:', response.status);
        // Se non è un successo, prova a leggere il corpo della risposta come testo
        const errorText = await response.text();
        console.error('Errore body:', errorText);
        alert('Errore nella prenotazione');
        return;
    }

    try {
        // Prova a leggere la risposta come JSON
        const data = await response.json();
        console.log(date, time, guests);
        alert(data.message);  // Mostra il messaggio di successo
        fetchReservations();
    } catch (error) {
        console.error('Errore durante il parsing della risposta JSON:', error);
        alert('Errore durante la prenotazione. Impossibile decodificare la risposta.');
    }
    
}

async function fetchReservations() {
    try {
        const response = await fetch('http://localhost:5000/reservations', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        console.log('Stato della risposta: ', response.status);
        // Controlla se la risposta è positiva (401 Unauthorized?)
        if (!response.ok) {
            if (response.status === 401) {
                alert('Sessione scaduta o non autenticato! Per favore, effettua il login.');
            } else {
                alert('Errore nel caricamento delle prenotazioni1.');
            }
            throw new Error('Impossibile caricare le prenotazioni.');
        }

        const reservations = await response.json();
        console.log('Prenotazioni:', reservations);
        // Qui puoi elaborare o visualizzare le prenotazioni
        const reservationList = document.getElementById('reservationList');
        reservationList.innerHTML = '';
        reservations.forEach(reservation => {
        const li = document.createElement('li');
        li.textContent = `Date: ${reservation.date}, Time: ${reservation.time}, Guests: ${reservation.guests}`;
        li.onclick = () => {
            document.getElementById('updateReservationId').value = reservation.id;
            document.getElementById('updateDate').value = reservation.date;
            document.getElementById('updateTime').value = reservation.time;
            document.getElementById('updateGuests').value = reservation.guests;
            document.getElementById('updateReservation').style.display = 'block';
        };
        reservationList.appendChild(li);
    });
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore nel caricamento delle prenotazioni2.');
    }
}


async function updateReservation() {
    const id = document.getElementById('updateReservationId').value;
    const date = document.getElementById('updateDate').value;
    const time = document.getElementById('updateTime').value;
    const guests = document.getElementById('updateGuests').value;

    const response = await fetch(`http://localhost:5000/update_reservation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, guests }),
        credentials: 'include' 
    });
    const data = await response.json();
    alert(data.message);
    fetchReservations();
    document.getElementById('updateReservation').style.display = 'none';
}