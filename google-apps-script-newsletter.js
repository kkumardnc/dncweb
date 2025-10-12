/**
 * Google Apps Script for Newsletter Subscription
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Create a new Google Sheet: https://sheets.google.com
 * 2. Name it "DNC Newsletter Subscriptions"
 * 3. Add headers in row 1: Email | Date | Source | IP Address
 *
 * 4. Open Extensions > Apps Script
 * 5. Delete any existing code
 * 6. Paste this entire script
 * 7. Click "Deploy" > "New deployment"
 * 8. Choose type: "Web app"
 * 9. Execute as: "Me"
 * 10. Who has access: "Anyone"
 * 11. Click "Deploy"
 * 12. Copy the Web App URL
 * 13. Update the SCRIPT_URL in /assets/js/newsletter.js with your URL
 *
 * The script will automatically:
 * - Validate email addresses
 * - Prevent duplicate subscriptions
 * - Log timestamp and source page
 * - Return JSON responses for success/error handling
 */

// Main function to handle POST requests
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const source = data.source || 'Unknown';

    // Validate email
    if (!email || !isValidEmail(email)) {
      return createResponse(false, 'Please enter a valid email address');
    }

    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Check if email already exists
    if (isEmailSubscribed(sheet, email)) {
      return createResponse(false, 'This email is already subscribed to our newsletter');
    }

    // Add subscriber to sheet
    const timestamp = new Date();
    const ipAddress = e.parameter.userip || 'Unknown';

    sheet.appendRow([
      email,
      timestamp,
      source,
      ipAddress
    ]);

    // Return success response
    return createResponse(true, 'Thank you for subscribing! You will receive our quarterly newsletter.');

  } catch (error) {
    console.error('Error processing subscription:', error);
    return createResponse(false, 'An error occurred. Please try again later.');
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'ok',
      message: 'Newsletter subscription API is running',
      timestamp: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if email already exists in sheet
function isEmailSubscribed(sheet, email) {
  const data = sheet.getDataRange().getValues();
  const emailLower = email.toLowerCase().trim();

  // Skip header row (index 0)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase().trim() === emailLower) {
      return true;
    }
  }

  return false;
}

// Create JSON response
function createResponse(success, message) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Optional: Function to export subscribers as CSV
function exportSubscribers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Create CSV content
  let csv = '';
  data.forEach(row => {
    csv += row.join(',') + '\n';
  });

  return csv;
}

// Optional: Function to get subscriber count
function getSubscriberCount() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  return lastRow - 1; // Subtract header row
}

// Optional: Function to remove a subscriber
function removeSubscriber(email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const emailLower = email.toLowerCase().trim();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase().trim() === emailLower) {
      sheet.deleteRow(i + 1); // +1 because sheets are 1-indexed
      return true;
    }
  }

  return false;
}
