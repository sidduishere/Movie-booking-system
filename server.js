const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
const PORT = 5000;

// Path to the tickets file
const ticketsFilePath = path.join(__dirname, 'tickets.js');

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(express.static('public'));

// Load tickets from the file
function loadTickets() {
    delete require.cache[require.resolve('./tickets')];
    return require('./tickets');
}

// Save tickets to the file
function saveTickets(tickets) {
    const ticketsContent = `const tickets = ${JSON.stringify(tickets, null, 4)};\n\nmodule.exports = tickets;\n`;
    fs.writeFileSync(ticketsFilePath, ticketsContent, 'utf8');
}

// Endpoint to get the status of all tickets
app.get('/api/tickets', (req, res) => {
    const tickets = loadTickets();
    res.json(tickets);
});

// Endpoint to book tickets
app.post('/api/tickets', (req, res) => {
    const { user, seats } = req.body;
    const tickets = loadTickets();

    seats.forEach(seatId => {
        const ticket = tickets.find(ticket => ticket.id === seatId);
        if (ticket && ticket.status === 'available') {
            ticket.status = 'booked';
            ticket.bookedBy = user;
        }
    });

    saveTickets(tickets);

    res.json({ message: 'Tickets booked successfully' });
});

// Endpoint to cancel booked seats for a user
app.post('/api/cancel', (req, res) => {
    const { user } = req.body;
    const tickets = loadTickets();

    tickets.forEach(ticket => {
        if (ticket.status === 'booked' && ticket.bookedBy === user) {
            ticket.status = 'available';
            ticket.bookedBy = null;
        }
    });

    saveTickets(tickets);

    res.json({ message: 'Tickets cancelled successfully' });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
