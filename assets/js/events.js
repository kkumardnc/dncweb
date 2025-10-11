/**
 * Events Loader - Fetch events from Google Sheets via Apps Script
 * Demarest Nature Center
 */

// Replace with your deployed Google Apps Script URL
const EVENTS_API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

/**
 * Load and display upcoming events
 */
async function loadUpcomingEvents() {
  const eventsContainer = document.getElementById('upcomingEvents');
  if (!eventsContainer) return;

  try {
    // Show loading state
    eventsContainer.innerHTML = '<div class="event-loading">Loading upcoming events...</div>';

    // Fetch events from Google Apps Script
    const response = await fetch(`${EVENTS_API_URL}?action=getEvents`);

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const events = await response.json();

    // Display events
    if (events && events.length > 0) {
      displayEvents(events.slice(0, 3), eventsContainer); // Show only first 3 on homepage
    } else {
      eventsContainer.innerHTML = '<p class="text-center">No upcoming events at this time. Check back soon!</p>';
    }

  } catch (error) {
    console.error('Error loading events:', error);
    eventsContainer.innerHTML = `
      <div class="event-error">
        <p>Unable to load events at this time.</p>
        <p><a href="/events/">View our events page</a> for more information.</p>
      </div>
    `;
  }
}

/**
 * Display events in the container
 */
function displayEvents(events, container) {
  container.innerHTML = events.map(event => createEventCard(event)).join('');
}

/**
 * Create HTML for an event card
 */
function createEventCard(event) {
  const date = formatEventDate(event.date);
  const spotsText = event.spotsAvailable !== undefined
    ? `<p class="event-spots">${event.spotsAvailable} spots available</p>`
    : '';

  const priceText = event.price && event.price > 0
    ? `<p class="event-price">$${event.price}</p>`
    : '<p class="event-price">Free</p>';

  return `
    <div class="event-card">
      ${event.image ? `<img src="${event.image}" alt="${event.name}" class="event-image">` : ''}
      <div class="event-content">
        <p class="event-date">${date} ${event.time ? '• ' + event.time : ''}</p>
        <h3>${event.name}</h3>
        <p class="event-description">${event.description || ''}</p>
        ${event.location ? `<p class="event-location">📍 ${event.location}</p>` : ''}
        <div class="event-meta">
          ${priceText}
          ${spotsText}
        </div>
        ${event.spotsAvailable > 0
          ? `<a href="/events/#event-${event.id}" class="btn btn-primary btn-small">Register Now</a>`
          : '<span class="event-full">Event Full</span>'
        }
      </div>
    </div>
  `;
}

/**
 * Format event date
 */
function formatEventDate(dateString) {
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}

/**
 * Load events when page loads
 */
document.addEventListener('DOMContentLoaded', () => {
  loadUpcomingEvents();
});

/**
 * For events page - load all events with filtering
 */
function initializeEventsPage() {
  const eventsPageContainer = document.getElementById('allEvents');
  if (!eventsPageContainer) return;

  loadAllEvents();
  setupEventFilters();
}

/**
 * Load all events (for events page)
 */
async function loadAllEvents() {
  const container = document.getElementById('allEvents');
  if (!container) return;

  try {
    container.innerHTML = '<div class="event-loading">Loading events...</div>';

    const response = await fetch(`${EVENTS_API_URL}?action=getEvents`);
    if (!response.ok) throw new Error('Failed to fetch events');

    const events = await response.json();

    if (events && events.length > 0) {
      displayEvents(events, container);
    } else {
      container.innerHTML = '<p class="text-center">No upcoming events scheduled.</p>';
    }

  } catch (error) {
    console.error('Error loading events:', error);
    container.innerHTML = '<p class="event-error">Unable to load events. Please try again later.</p>';
  }
}

/**
 * Setup event filters (for events page)
 */
function setupEventFilters() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  categoryFilter.addEventListener('change', (e) => {
    filterEvents(e.target.value);
  });
}

/**
 * Filter events by category
 */
function filterEvents(category) {
  const eventCards = document.querySelectorAll('.event-card');

  eventCards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Initialize events page if we're on that page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('allEvents')) {
    initializeEventsPage();
  }
});
