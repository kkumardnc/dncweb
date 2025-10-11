# Google Apps Script Integration Guide
## Demarest Nature Center - Static Site Backend

---

## Overview

This guide provides detailed implementation steps for integrating Google Apps Script as the backend for your static website. Apps Script will handle forms, data storage, email notifications, and dynamic content.

---

## Setup & Prerequisites

### 1. Google Account Setup
- Use existing organizational Google account
- Or create new account: `webforms@demarestnaturecenter.org`
- Enable Google Sheets and Google Apps Script

### 2. Project Organization
Create a folder structure in Google Drive:
```
DNC Website Backend/
├── Sheets/
│   ├── Contact Form Submissions
│   ├── Event Registrations
│   ├── Membership Applications
│   ├── Volunteer Applications
│   ├── Newsletter Subscribers
│   └── Events Calendar (CMS)
└── Apps Scripts/
    ├── Contact Form Handler
    ├── Event Registration System
    ├── Membership System
    └── Newsletter Manager
```

---

## Implementation Examples

### Example 1: Contact Form

#### Step 1: Create Google Sheet
Create sheet: "Contact Form Submissions"

**Columns:**
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Timestamp | Name | Email | Phone | Subject | Message | Status |

#### Step 2: Apps Script Code

**File: `contactForm.gs`**
```javascript
/**
 * Contact Form Handler
 * Receives form submissions, saves to sheet, sends emails
 */

// Configuration
const CONFIG = {
  sheetName: 'Submissions',
  adminEmail: 'info@demarestnaturecenter.org',
  fromName: 'Demarest Nature Center Website'
};

/**
 * Handle POST requests from contact form
 */
function doPost(e) {
  try {
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return createResponse({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      return createResponse({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Save to spreadsheet
    saveToSheet(data);

    // Send email notifications
    sendAdminNotification(data);
    sendUserConfirmation(data);

    return createResponse({
      success: true,
      message: 'Thank you for your message. We will respond shortly.'
    });

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createResponse({
      success: false,
      message: 'An error occurred. Please try again or email us directly.'
    });
  }
}

/**
 * Save submission to Google Sheet
 */
function saveToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.sheetName);

  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.phone || '',
    data.subject || '',
    data.message,
    'New'
  ]);
}

/**
 * Send notification to admin
 */
function sendAdminNotification(data) {
  const subject = `New Contact Form Submission: ${data.subject || 'No Subject'}`;

  const body = `
New contact form submission received:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject || 'Not provided'}

Message:
${data.message}

---
Submitted: ${new Date().toLocaleString()}
  `.trim();

  MailApp.sendEmail({
    to: CONFIG.adminEmail,
    subject: subject,
    body: body
  });
}

/**
 * Send confirmation to user
 */
function sendUserConfirmation(data) {
  const subject = 'Thank you for contacting Demarest Nature Center';

  const body = `
Hi ${data.name},

Thank you for contacting Demarest Nature Center. We have received your message and will respond as soon as possible.

Your message:
"${data.message}"

If you need immediate assistance, please call us at (555) 123-4567.

Best regards,
Demarest Nature Center Team

---
This is an automated confirmation email.
  `.trim();

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body,
    name: CONFIG.fromName
  });
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create JSON response
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle CORS preflight requests
 */
function doGet(e) {
  return createResponse({
    message: 'Contact Form API - Use POST method'
  });
}
```

#### Step 3: Deploy Apps Script

1. Click **Deploy** → **New deployment**
2. Select **Web app**
3. Configuration:
   - Description: "Contact Form Handler v1"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click **Deploy**
5. Copy the Web App URL (looks like: `https://script.google.com/macros/s/AKfycby.../exec`)

#### Step 4: Website HTML Form

**File: `contact.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us - Demarest Nature Center</title>
  <style>
    .contact-form {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    textarea {
      min-height: 150px;
      resize: vertical;
    }
    button {
      background: #2c5f2d;
      color: white;
      padding: 12px 30px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover {
      background: #1e4620;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .message {
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
      display: none;
    }
    .message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .message.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="contact-form">
    <h1>Contact Us</h1>

    <div id="formMessage" class="message"></div>

    <form id="contactForm">
      <div class="form-group">
        <label for="name">Name *</label>
        <input type="text" id="name" name="name" required>
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input type="email" id="email" name="email" required>
      </div>

      <div class="form-group">
        <label for="phone">Phone</label>
        <input type="tel" id="phone" name="phone">
      </div>

      <div class="form-group">
        <label for="subject">Subject</label>
        <input type="text" id="subject" name="subject">
      </div>

      <div class="form-group">
        <label for="message">Message *</label>
        <textarea id="message" name="message" required></textarea>
      </div>

      <button type="submit" id="submitBtn">Send Message</button>
    </form>
  </div>

  <script>
    // Replace with your deployed Apps Script URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('formMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      messageDiv.className = 'message';

      // Get form data
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };

      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Important for Apps Script
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        // Note: With no-cors, we can't read the response
        // We assume success if no error is thrown
        showMessage('Thank you for your message! We will respond shortly.', 'success');
        form.reset();

      } catch (error) {
        showMessage('An error occurred. Please try again or email us directly.', 'error');
        console.error('Error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });

    function showMessage(text, type) {
      messageDiv.textContent = text;
      messageDiv.className = `message ${type} show`;

      // Scroll to message
      messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  </script>
</body>
</html>
```

---

### Example 2: Event Registration System

#### Step 1: Create Google Sheets

**Sheet 1: Events**
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Event ID | Event Name | Date | Time | Location | Capacity | Price | Status |

**Sheet 2: Registrations**
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Timestamp | Event ID | Event Name | Name | Email | Phone | Attendees | Status | Confirmation Sent |

#### Step 2: Apps Script Code

**File: `eventRegistration.gs`**
```javascript
/**
 * Event Registration System
 */

const CONFIG = {
  eventsSheet: 'Events',
  registrationsSheet: 'Registrations',
  adminEmail: 'events@demarestnaturecenter.org'
};

/**
 * Get upcoming events (for website display)
 */
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getEvents') {
    return getUpcomingEvents();
  }

  return createResponse({ error: 'Invalid action' });
}

/**
 * Handle event registrations
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'register') {
      return registerForEvent(data);
    }

    return createResponse({
      success: false,
      message: 'Invalid action'
    });

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createResponse({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
}

/**
 * Get upcoming events as JSON
 */
function getUpcomingEvents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.eventsSheet);
  const data = sheet.getDataRange().getValues();

  // Remove header row
  const headers = data.shift();

  // Filter and format events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = data
    .filter(row => {
      const eventDate = new Date(row[2]); // Date column
      const status = row[7]; // Status column
      return eventDate >= today && status === 'Active';
    })
    .map(row => ({
      id: row[0],
      name: row[1],
      date: formatDate(row[2]),
      time: row[3],
      location: row[4],
      capacity: row[5],
      price: row[6],
      spotsAvailable: getSpotsAvailable(row[0], row[5])
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return createResponse(events);
}

/**
 * Register for an event
 */
function registerForEvent(data) {
  // Validate data
  if (!data.eventId || !data.name || !data.email) {
    return createResponse({
      success: false,
      message: 'Missing required fields'
    });
  }

  // Check event capacity
  const event = getEvent(data.eventId);
  if (!event) {
    return createResponse({
      success: false,
      message: 'Event not found'
    });
  }

  const spotsAvailable = getSpotsAvailable(data.eventId, event.capacity);
  const attendees = parseInt(data.attendees) || 1;

  if (spotsAvailable < attendees) {
    return createResponse({
      success: false,
      message: `Sorry, only ${spotsAvailable} spots available`
    });
  }

  // Save registration
  saveRegistration(data, event);

  // Send confirmation email
  sendRegistrationConfirmation(data, event);
  sendAdminNotification(data, event);

  return createResponse({
    success: true,
    message: 'Registration successful! Check your email for confirmation.'
  });
}

/**
 * Save registration to sheet
 */
function saveRegistration(data, event) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.registrationsSheet);

  sheet.appendRow([
    new Date(),
    data.eventId,
    event.name,
    data.name,
    data.email,
    data.phone || '',
    data.attendees || 1,
    'Confirmed',
    'Yes'
  ]);
}

/**
 * Get event by ID
 */
function getEvent(eventId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.eventsSheet);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == eventId) {
      return {
        id: data[i][0],
        name: data[i][1],
        date: data[i][2],
        time: data[i][3],
        location: data[i][4],
        capacity: data[i][5],
        price: data[i][6]
      };
    }
  }

  return null;
}

/**
 * Calculate available spots
 */
function getSpotsAvailable(eventId, capacity) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.registrationsSheet);
  const data = sheet.getDataRange().getValues();

  let registered = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] == eventId && data[i][7] === 'Confirmed') {
      registered += parseInt(data[i][6]) || 1;
    }
  }

  return capacity - registered;
}

/**
 * Send confirmation email to registrant
 */
function sendRegistrationConfirmation(data, event) {
  const subject = `Event Registration Confirmed: ${event.name}`;

  const body = `
Hi ${data.name},

Your registration for "${event.name}" has been confirmed!

Event Details:
Date: ${formatDate(event.date)}
Time: ${event.time}
Location: ${event.location}
Number of Attendees: ${data.attendees || 1}
${event.price > 0 ? `Price: $${event.price} per person` : 'Free Event'}

We look forward to seeing you!

If you need to cancel or modify your registration, please contact us at ${CONFIG.adminEmail}.

Best regards,
Demarest Nature Center

---
Confirmation Number: ${new Date().getTime()}
  `.trim();

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body
  });
}

/**
 * Helper functions
 */
function formatDate(date) {
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'MMMM dd, yyyy');
}

function sendAdminNotification(data, event) {
  const subject = `New Event Registration: ${event.name}`;
  const body = `New registration received for ${event.name} by ${data.name} (${data.email})`;

  MailApp.sendEmail(CONFIG.adminEmail, subject, body);
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

#### Step 3: Website Integration

**File: `events.html` (excerpt)**
```javascript
<script>
const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// Fetch and display events
async function loadEvents() {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getEvents`);
    const events = await response.json();
    displayEvents(events);
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

// Display events on page
function displayEvents(events) {
  const container = document.getElementById('events-list');

  if (events.length === 0) {
    container.innerHTML = '<p>No upcoming events at this time.</p>';
    return;
  }

  container.innerHTML = events.map(event => `
    <div class="event-card">
      <h3>${event.name}</h3>
      <p><strong>Date:</strong> ${event.date}</p>
      <p><strong>Time:</strong> ${event.time}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Price:</strong> ${event.price > 0 ? '$' + event.price : 'Free'}</p>
      <p><strong>Spots Available:</strong> ${event.spotsAvailable}</p>
      ${event.spotsAvailable > 0
        ? `<button onclick="showRegistrationForm('${event.id}')">Register Now</button>`
        : `<span class="sold-out">Sold Out</span>`
      }
    </div>
  `).join('');
}

// Submit registration
async function submitRegistration(formData) {
  const data = {
    action: 'register',
    eventId: formData.eventId,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    attendees: formData.attendees
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      alert('Registration successful! Check your email for confirmation.');
      // Reload events to update capacity
      loadEvents();
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert('Registration failed. Please try again.');
    console.error('Error:', error);
  }
}

// Load events on page load
loadEvents();
</script>
```

---

## Additional Integration Examples

### 3. Newsletter Signup

**Simple implementation:**
```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'subscribe') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Newsletter');

    // Check if already subscribed
    const emails = sheet.getRange('B:B').getValues();
    for (let email of emails) {
      if (email[0] === data.email) {
        return createResponse({
          success: false,
          message: 'Email already subscribed'
        });
      }
    }

    // Add subscriber
    sheet.appendRow([
      new Date(),
      data.email,
      data.name || '',
      'Active'
    ]);

    // Send welcome email
    MailApp.sendEmail({
      to: data.email,
      subject: 'Welcome to Demarest Nature Center Newsletter',
      body: 'Thank you for subscribing!'
    });

    return createResponse({
      success: true,
      message: 'Successfully subscribed!'
    });
  }
}
```

---

## Security Best Practices

### 1. Input Validation
```javascript
function validateInput(data) {
  // Email validation
  if (data.email && !isValidEmail(data.email)) {
    throw new Error('Invalid email format');
  }

  // Sanitize strings
  data.name = sanitizeString(data.name);
  data.message = sanitizeString(data.message);

  // Length limits
  if (data.message && data.message.length > 5000) {
    throw new Error('Message too long');
  }

  return data;
}

function sanitizeString(str) {
  if (!str) return '';
  return str.toString().trim().slice(0, 1000);
}
```

### 2. Rate Limiting
```javascript
function checkRateLimit(identifier) {
  const cache = CacheService.getScriptCache();
  const key = `ratelimit_${identifier}`;
  const count = cache.get(key);

  if (count && parseInt(count) > 10) {
    throw new Error('Too many requests. Please try again later.');
  }

  cache.put(key, (parseInt(count) || 0) + 1, 3600); // 1 hour
}
```

### 3. CORS Headers
```javascript
function createResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Add CORS headers if needed
  // Note: Apps Script handles CORS automatically for Web Apps

  return output;
}
```

---

## Testing & Debugging

### 1. Test Functions in Apps Script Editor
```javascript
function testContactForm() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-1234',
    subject: 'Test Subject',
    message: 'This is a test message'
  };

  saveToSheet(testData);
  Logger.log('Test completed');
}
```

### 2. View Logs
- In Apps Script Editor: View → Executions
- Check execution logs for errors
- Monitor email quota usage

### 3. Version Control
- Deploy new versions for testing
- Keep old versions accessible
- Use deployment descriptions

---

## Maintenance & Monitoring

### 1. Automated Cleanup (Time-driven Trigger)
```javascript
function cleanupOldRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Submissions');
  const data = sheet.getDataRange().getValues();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Archive or delete old records
  // Implementation depends on retention policy
}
```

### 2. Daily Summary Emails
```javascript
function sendDailySummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Registrations');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Count yesterday's registrations
  // Send summary email to admin
}
```

### 3. Error Notifications
```javascript
function notifyOnError(error) {
  MailApp.sendEmail({
    to: 'admin@demarestnaturecenter.org',
    subject: 'Website Form Error',
    body: `An error occurred: ${error.toString()}`
  });
}
```

---

## Deployment Checklist

- [ ] Create Google Sheets with proper column headers
- [ ] Write and test Apps Script functions locally
- [ ] Set up email templates
- [ ] Configure script properties (if needed)
- [ ] Deploy as Web App
- [ ] Test with Postman or similar tool
- [ ] Update website with correct Script URL
- [ ] Test from website
- [ ] Set up time-driven triggers (if needed)
- [ ] Document for future maintenance
- [ ] Train staff on managing spreadsheets

---

## Troubleshooting

### Common Issues

**1. "Authorization required"**
- Run function once in editor to authorize
- Check deployment permissions

**2. "Script has been disabled"**
- Re-authorize the script
- Check Google account security settings

**3. "No response from form submission"**
- Verify Script URL is correct
- Check browser console for CORS errors
- Use `mode: 'no-cors'` in fetch

**4. "Emails not sending"**
- Check email quota (100/day for free accounts)
- Verify email addresses
- Check spam folder

**5. "Data not saving to sheet"**
- Verify sheet name matches exactly
- Check for locked cells/protected ranges
- Review execution logs for errors

---

## Next Steps

1. Start with Contact Form (simplest)
2. Test thoroughly before deploying
3. Add Event Registration system
4. Implement Newsletter signup
5. Build remaining integrations as needed

For questions or issues, refer to:
- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Apps Script Community](https://stackoverflow.com/questions/tagged/google-apps-script)
