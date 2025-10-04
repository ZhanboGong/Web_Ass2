// backend interface: event
const eventsAPI = 'http://localhost:3030/api/events';

/**
 * Retrieve the list of events data from the specified API and call the `renderEventData` method for dynamic injection and rendering.
 * And call `setupModalTriggers` to initialize the modal functionality
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const eventId = new URLSearchParams(window.location.search).get('id');
        if (!eventId) {
            window.location.href = '/';
            return;
        }
        const response = await fetch(`${eventsAPI}/${eventId}`);
        if (!response.ok) {
            throw new Error(`Event not found or server error (Status: ${response.status})`);
        }
        const event = await response.json();
        // render data
        renderEventData(event);
        // register form modal
        setupModalTriggers();

    } catch (error) {
        // Prompt injection in error situations
        console.error('Failed to load event details:', error);
        document.getElementById('event-title').textContent = 'Error: Event Not Found';
        document.getElementById('event-description').textContent = 'Could not load the event details. Please check the URL or try again later.';
    }
});


/**
 * Render the received event data
 * @param {*} event received event data
 */
function renderEventData(event) {
    const ticketPrice = parseFloat(event.TicketPrice) === 0 ? 'Free' : `$${event.TicketPrice}`;
    const attendeeProgress = calculateAttendeeProgress(event.CurrentAttendees, event.GoalAttendees);
    const formattedDate = formatDate(event.EventDate);

    // Update the page title
    document.title = `${event.EventName} - Hope Charity`;

    // Find each element by ID and set its content
    document.getElementById('event-image').src = event.EventImage;
    document.getElementById('event-image').alt = event.EventName;
    document.getElementById('event-date-header').textContent = formattedDate;
    document.getElementById('event-title').textContent = event.EventName;
    document.getElementById('attendee-count-display').textContent = `${event.CurrentAttendees} / ${event.GoalAttendees} attendees`;
    document.getElementById('Fundraising-has0been-completed').textContent = `Fundraising has been completed: $${event.CurrentAttendees * event.TicketPrice}`;
    document.getElementById('attendee-progress-bar').style.width = `${attendeeProgress}%`;
    document.getElementById('event-date-time').textContent = formatDate(event.EventDate);
    document.getElementById('event-location').textContent = event.Location;
    document.getElementById('event-price').textContent = ticketPrice;
    document.getElementById('event-category').textContent = event.CategoryName;
    document.getElementById('event-description').textContent = event.Description;
}


/**
 * Used for managing the GetTicket pop-up window
 * Assignment 3 can be directly replaced with an existing component using the Angular framework.
 * @returns 
 */
function setupModalTriggers() {
    const getTicketsBtn = document.getElementById('get-tickets-btn');
    const modal = document.getElementById('modal');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    const registrationForm = document.getElementById('registration-form');
    if (!getTicketsBtn || !modal || !closeModalBtn || !registrationForm) {
        console.error("Modal elements not found on the page!");
        return;
    }
    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => modal.classList.add('hidden');
    getTicketsBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    registrationForm.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('This feature is currently under construction.');
        closeModal();
    });
}

/**
 * A 'format' was defined as a formatting template.
 * Calling the `toLocaleDateString` method will format the Date object in a custom format
 * @param {*} dateString The original date string that needs to be initially formatted first
 * @returns The date string formatted through the custom template
 */
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * calculates the progress percentage of current attendees towards a goal
 * @param {*} currentAttendees The current number of participants in the registration activity
 * @param {*} goalAttendees The target number of participants for this activity
 * @returns The calculated percentage (ranging from 0 to 100)
 */
function calculateAttendeeProgress(currentAttendees, goalAttendees) {
    if (goalAttendees <= 0) {
        return 0;
    }
    const percentage = (currentAttendees / goalAttendees) * 100;
    return Math.min(100, percentage);
}

// Obtain the content that needs to be searched in the search box and redirect to the "search" page for the search operation.
document.getElementById('basicSearchBtn').addEventListener('click', () => {
    const keyword = document.getElementById('basicSearch').value.trim();
    if (keyword) {
        window.location.href = `/search?q=${encodeURIComponent(keyword)}`;
    }
});