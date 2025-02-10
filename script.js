async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    alert(data.message);
}

async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    alert(data.message);
    if (response.ok) {
        fetchReservations();
    }
}

async function makeReservation() {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const guests = document.getElementById('guests').value;
    const response = await fetch('http://localhost:5000/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, guests })
    });
    const data = await response.json();
    alert(data.message);
    fetchReservations();
}

async function fetchReservations() {
    const response = await fetch('http://localhost:5000/reservations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const reservations = await response.json();
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
}

async function updateReservation() {
    const id = document.getElementById('updateReservationId').value;
    const date = document.getElementById('updateDate').value;
    const time = document.getElementById('updateTime').value;
    const guests = document.getElementById('updateGuests').value;

    const response = await fetch(`http://localhost:5000/update_reservation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, guests })
    });
    const data = await response.json();
    alert(data.message);
    fetchReservations();
    document.getElementById('updateReservation').style.display = 'none';
}