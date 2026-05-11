/**
 * Demarest Nature Center — Newsletter Subscription Apps Script
 *
 * Receives POST submissions from the newsletter forms on
 * https://www.demarestnaturecenter.org (see assets/js/newsletter.js),
 * validates the email address, appends the subscriber to a Google Sheet,
 * and notifies the team via a Google Chat incoming webhook.
 *
 * Deployment
 *   1. Open https://script.google.com and create a new project.
 *   2. Paste the contents of this file into Code.gs.
 *   3. Set SHEET_ID below to the target spreadsheet ID. The script will
 *      auto-create a "Subscribers" tab with a header row on first run.
 *   4. Deploy > New deployment > Web app
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Copy the /exec URL and paste it into SCRIPT_URL in
 *      assets/js/newsletter.js.
 *
 * Frontend note
 *   newsletter.js posts an `application/x-www-form-urlencoded` body built
 *   with URLSearchParams. That avoids the CORS preflight Apps Script web
 *   apps do not handle and, unlike a text/plain JSON body, survives the
 *   302 redirect from script.google.com to script.googleusercontent.com
 *   on iOS Safari and in-app webviews. This script still reads from both
 *   e.postData.contents (JSON) and e.parameter (form fields), so a JSON
 *   body would also work if the frontend ever switches back.
 */

const SHEET_ID = 'REPLACE_WITH_YOUR_GOOGLE_SHEET_ID';
const SHEET_NAME = 'Subscribers';

const CHAT_WEBHOOK_URL =
  'https://chat.googleapis.com/v1/spaces/AAQA8VT1Kdo/messages' +
  '?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI' +
  '&token=Mc8rgVXlSTRKxg0m6G2aVeUv519zfhYty8wG8dUr6qI';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  try {
    const payload = parsePayload(e);
    const email = (payload.email || '').toString().trim().toLowerCase();
    const source = (payload.source || 'Unknown').toString().trim();
    const timestamp = payload.timestamp
      ? new Date(payload.timestamp)
      : new Date();

    if (!email || !EMAIL_REGEX.test(email)) {
      return jsonResponse({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    const sheet = getSubscribersSheet();

    if (emailAlreadySubscribed(sheet, email)) {
      return jsonResponse({
        success: true,
        message: "You're already subscribed — thank you!"
      });
    }

    sheet.appendRow([
      timestamp,
      email,
      source,
      (e && e.parameter && e.parameter.userAgent) || ''
    ]);

    notifyChat(email, source, timestamp);

    return jsonResponse({
      success: true,
      message: 'Thanks for subscribing! Check your inbox for our next update.'
    });
  } catch (err) {
    console.error('Newsletter subscription failed:', err);
    return jsonResponse({
      success: false,
      message: 'An error occurred while subscribing. Please try again later.'
    });
  }
}

function doGet() {
  return jsonResponse({
    success: true,
    message: 'Demarest Nature Center newsletter endpoint is live.'
  });
}

function parsePayload(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // Fall through to form-encoded handling below.
    }
  }
  return (e && e.parameter) || {};
}

function getSubscribersSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Email', 'Source', 'User Agent']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function emailAlreadySubscribed(sheet, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    const existing = (values[i][0] || '').toString().trim().toLowerCase();
    if (existing === email) return true;
  }
  return false;
}

function notifyChat(email, source, timestamp) {
  const message = {
    text:
      '*New newsletter subscriber* \n' +
      '• Email: ' + email + '\n' +
      '• Source: ' + source + '\n' +
      '• Time: ' + Utilities.formatDate(
        timestamp,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd HH:mm:ss z'
      )
  };

  try {
    UrlFetchApp.fetch(CHAT_WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(message),
      muteHttpExceptions: true
    });
  } catch (err) {
    console.error('Google Chat webhook failed:', err);
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
