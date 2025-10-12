// Google Calendar Integration for Demarest Nature Center
const CALENDAR_ID = 'c_581c56b4d09b99b96af9481e68dcc181cf7102482f19fcbcf71f453dc493d6d2@group.calendar.google.com';
const API_KEY = 'YOUR_GOOGLE_API_KEY';

// Embed Google Calendar
function embedGoogleCalendar() {
  const calendarContainer = document.getElementById('google-calendar-embed');

  if (!calendarContainer) return;

  // Create iframe embed
  const calendarEmbed = `
    <iframe
      src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&title=Events&src=Y185ODFjNTZiNGQwOWI5OWI5NmFmOTQ4MWU2OGRjYzE4MWNmNzEwMjQ4MmYxOWZjYmNmNzFmNDUzZGM0OTNkNmQyQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23D81B60"
      style="border: solid 1px #777; width: 100%; height: 600px;"
      frameborder="0"
      scrolling="no"
    ></iframe>
  `;

  calendarContainer.innerHTML = calendarEmbed;
}

// Fetch upcoming events from Google Calendar API
async function fetchUpcomingEvents(maxResults = 5) {
  const eventsContainer = document.getElementById('upcoming-events-list');

  if (!eventsContainer) return;

  try {
    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('Calendar API error:', data.error);
      eventsContainer.innerHTML = '<p>Unable to load events. Please check back later.</p>';
      return;
    }

    if (!data.items || data.items.length === 0) {
      eventsContainer.innerHTML = '<p>No upcoming events scheduled.</p>';
      return;
    }

    // Display events
    const eventsHTML = data.items.map(event => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);

      return `
        <div class="event-card">
          <div class="event-date">
            <span class="month">${start.toLocaleString('en-US', { month: 'short' })}</span>
            <span class="day">${start.getDate()}</span>
          </div>
          <div class="event-details">
            <h3>${event.summary || 'Untitled Event'}</h3>
            <p class="event-time">
              <strong>Time:</strong> ${start.toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
              ${end ? ' - ' + end.toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }) : ''}
            </p>
            ${event.location ? `<p class="event-location"><strong>Location:</strong> ${event.location}</p>` : ''}
            ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    eventsContainer.innerHTML = eventsHTML;
  } catch (error) {
    console.error('Error fetching events:', error);
    eventsContainer.innerHTML = '<p>Unable to load events. Please try again later.</p>';
  }
}

// Initialize calendar on page load
document.addEventListener('DOMContentLoaded', function() {
  embedGoogleCalendar();
  fetchUpcomingEvents();
});

// Export for manual use
window.googleCalendar = {
  embedGoogleCalendar,
  fetchUpcomingEvents
};
