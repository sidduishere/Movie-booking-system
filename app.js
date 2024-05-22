let currentUser = null;

// Function to handle user login
function login() {
    const email = document.getElementById('email').value;
    if (email) {
        currentUser = email;
        localStorage.setItem('user', currentUser);
        window.location.href = 'dashboard.html';
    }
}

// Function to book seats
function bookSeats() {
    const selectedSeats = [...document.querySelectorAll('.seat.selected')].map(seat => parseInt(seat.innerText));
    fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: currentUser, seats: selectedSeats })
    }).then(response => {
        if (response.ok) {
            loadSeats();
        } else {
            console.error('Failed to book seats');
        }
    });
}

// Function to cancel booking of a seat
function cancelBooking() {
    currentUser = localStorage.getItem('user');
    fetch('http://localhost:5000/api/cancel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: currentUser })
    }).then(response => {
        if (response.ok) {
            loadSeats(); // Reload seats after cancellation
        } else {
            console.error('Failed to cancel booking');
        }
    });
}

// Function to handle the cancel button click
function toggleCancelIcon(seat) {
    if (seat.classList.contains('selected') && seat.classList.contains('booked')) {
        if (!seat.querySelector('.cancel-icon')) {
            const cancelIcon = document.createElement('i');
            cancelIcon.className = 'cancel-icon fas fa-times';
            cancelIcon.onclick = () => cancelBooking();
            seat.appendChild(cancelIcon);
        }
    }
}

// Function to load seats and handle seat click event
function loadSeats() {
    currentUser = localStorage.getItem('user');
    fetch('http://localhost:5000/api/tickets')
        .then(response => response.json())
        .then(data => {
            const seatsContainer = document.querySelector('.seats-container');
            seatsContainer.innerHTML = '';
            let userHasBookedSeats = false; // Flag to track if user has booked seats
            data.forEach(ticket => {
                const seat = document.createElement('div');
                seat.className = 'seat';
                seat.innerText = ticket.id;
                if (ticket.status === 'booked') {
                    seat.classList.add('booked');
                    if (ticket.bookedBy === currentUser) {
                        seat.classList.add('selected');
                        userHasBookedSeats = true; // Set flag if user has booked seats
                    }
                    seat.onclick = () => toggleCancelIcon(seat); // Add cancel icon on click
                } else {
                    seat.onclick = () => toggleSeatSelection(seat, ticket);
                }
                seatsContainer.appendChild(seat);
            });

            // Show or hide Cancel Booking button based on user's booking status
            const cancelButton = document.getElementById('cancelButton');
            if (cancelButton) {
                if (userHasBookedSeats) {
                    cancelButton.style.display = 'block';
                } else {
                    cancelButton.style.display = 'none';
                }
            }
        });
}


// Function to toggle seat selection
function toggleSeatSelection(seat, ticket) {
    if (seat.classList.contains('booked')) return;
    seat.classList.toggle('selected');
}

// Check if the current page is the dashboard and load seats
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', loadSeats);
}
