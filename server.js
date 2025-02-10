const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

let users = [];
let reservations = [];
let reservationId = 1;

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    users.push({ username, password });
    res.json({ message: 'Registration successful' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/reserve', (req, res) => {
    const { date, time, guests } = req.body;
    reservations.push({ id: reservationId++, date, time, guests });
    res.json({ message: 'Reservation successful' });
});

app.get('/reservations', (req, res) => {
    res.json(reservations);
});

app.put('/update_reservation/:id', (req, res) => {
    const { id } = req.params;
    const { date, time, guests } = req.body;
    const reservation = reservations.find(r => r.id == id);
    if (reservation) {
        reservation.date = date;
        reservation.time = time;
        reservation.guests = guests;
        res.json({ message: 'Reservation updated' });
    } else {
        res.status(404).json({ message: 'Reservation not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});