# Newsletter Subscription Setup Guide

## Overview
This guide will help you set up a free newsletter subscription system using Google Sheets and Google Apps Script. All email submissions will be stored in a Google Sheet that you can access anytime.

---

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it: **DNC Newsletter Subscriptions**
4. In Row 1, add these headers:
   - Cell A1: `Email`
   - Cell B1: `Date`
   - Cell C1: `Source`
   - Cell D1: `IP Address`

Your sheet should look like this:
```
| Email | Date | Source | IP Address |
|-------|------|--------|------------|
```

---

## Step 2: Add the Apps Script

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code in the editor
3. Open the file `/Users/kriskumar/dnc/google-apps-script-newsletter.js`
4. Copy ALL the code from that file
5. Paste it into the Apps Script editor
6. Click the **💾 Save** icon (or press Ctrl+S / Cmd+S)
7. Name your project: **Newsletter Subscription Handler**

---

## Step 3: Deploy as Web App

1. In the Apps Script editor, click **Deploy** > **New deployment**
2. Click the **gear icon** ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in the deployment settings:
   - **Description**: Newsletter Subscription v1
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. If prompted, click **Authorize access**
7. Choose your Google account
8. Click **Advanced** > **Go to Newsletter Subscription Handler (unsafe)**
9. Click **Allow**
10. **IMPORTANT**: Copy the **Web app URL** - it will look like:
    ```
    https://script.google.com/macros/s/AKfycbyXXXXXXXXXXXXXXXXXXXX/exec
    ```

---

## Step 4: Update Your Website

1. Open the file: `/Users/kriskumar/dnc/assets/js/newsletter.js`
2. Find this line near the top:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace it with your Web App URL:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec';
   ```
4. Save the file

---

## Step 5: Add Newsletter Script to Your Pages

Add this line before the closing `</body>` tag on ALL pages with newsletter forms:

```html
<script src="/assets/js/newsletter.js"></script>
```

### Pages that need this script:
- ✅ All pages (already in footer with forms)

The script will automatically detect and handle all newsletter forms on the page.

---

## Step 6: Test Your Setup

1. Open your website in a browser
2. Scroll to the footer newsletter form
3. Enter a test email address
4. Click **Subscribe**
5. Check your Google Sheet - the email should appear!

---

## How It Works

### What Happens When Someone Subscribes:

1. User enters email and clicks Subscribe
2. JavaScript validates the email format
3. Form data is sent to your Google Apps Script URL
4. Apps Script:
   - Validates the email
   - Checks for duplicates
   - Adds to your Google Sheet with timestamp and source page
   - Returns success/error message
5. User sees confirmation message

### Your Google Sheet Will Show:

| Email | Date | Source | IP Address |
|-------|------|--------|------------|
| user@example.com | 2025-10-12 14:30:22 | Contact Page | 192.168.1.1 |
| another@example.com | 2025-10-12 15:45:10 | Homepage | 192.168.1.2 |

---

## Managing Subscribers

### View All Subscribers
Simply open your Google Sheet to see all subscribers

### Export to CSV
1. In Google Sheet: **File** > **Download** > **CSV**
2. Use this file with email services like Mailchimp, Constant Contact, etc.

### Remove a Subscriber
Delete the row in your Google Sheet

### Get Subscriber Count
Check the row count in your sheet (minus the header row)

---

## Troubleshooting

### "Newsletter service is not yet configured"
- Make sure you updated the `SCRIPT_URL` in `/assets/js/newsletter.js`
- The URL should start with `https://script.google.com/macros/`

### Subscriptions Not Appearing in Sheet
- Check that your Apps Script is deployed as a **Web app**
- Make sure "Who has access" is set to **Anyone**
- Try redeploying the script

### "Authorization Required" Error
- In Apps Script editor, go to **Deploy** > **Manage deployments**
- Click **✏️ Edit** > **Version** > **New version**
- Click **Deploy**

### Duplicate Prevention Not Working
- Make sure the Email column is Column A
- Check that there are no extra spaces in email addresses

---

## Security Notes

- ✅ The script validates all email addresses
- ✅ Duplicate emails are prevented automatically
- ✅ All data stays in YOUR Google account
- ✅ No third-party services required
- ✅ Free forever (within Google's usage limits)

---

## Next Steps

After setup, you can:

1. **Send Newsletters**: Export the CSV and import into email service
2. **Create Segments**: Use the "Source" column to see where subscribers came from
3. **Track Growth**: See subscription timestamps in the Date column
4. **Add More Forms**: The script automatically handles any newsletter form on your site

---

## Support

If you need help:
1. Check the console for error messages (F12 in browser)
2. Verify your Web App URL is correct
3. Make sure the script is deployed with "Anyone" access
4. Test with different email addresses

---

## File Locations

- Apps Script Code: `/Users/kriskumar/dnc/google-apps-script-newsletter.js`
- Client JavaScript: `/Users/kriskumar/dnc/assets/js/newsletter.js`
- This Guide: `/Users/kriskumar/dnc/NEWSLETTER-SETUP-GUIDE.md`
