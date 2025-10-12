# Setup Summary - Demarest Nature Center Website

## Recent Changes

### 1. ✅ Stripe Donation Button Added
**File**: `/support/donate.html`
- Added prominent "Donate Now with Stripe" button in hero section
- **ACTION REQUIRED**: Replace `YOUR_STRIPE_PAYMENT_LINK_HERE` with your actual Stripe Payment Link URL
- Fixed panel title styling (white text on dark green background)

### 2. ✅ Contact Page Fixed
**File**: `/contact/index.html`
- Removed broken icon SVG references (404 errors fixed)
- Removed contact form as requested
- Updated Instagram link: `https://www.instagram.com/demarestnaturectr/`
- Updated Instagram handle: `@demarestnaturectr`
- Updated Facebook link (currently using share link - may need actual page URL)

### 3. ✅ Events Page Fixed
**File**: `/events/index.html`
- Removed broken Google Calendar embed
- Removed "Unable to load events" message
- Cleaned up JavaScript references

### 4. ✅ Newsletter Subscription System Created
**Files Created**:
- `/google-apps-script-newsletter.js` - Server-side code for Google Sheets
- `/assets/js/newsletter.js` - Client-side form handler
- `/NEWSLETTER-SETUP-GUIDE.md` - Complete setup instructions

**Files Updated**:
- `/contact/index.html` - Added newsletter script
- `/events/index.html` - Added newsletter script
- Other pages with newsletter forms

---

## Action Items for You

### High Priority

#### 1. Set Up Stripe Donation Button
**File to Edit**: `/support/donate.html` (Line 342)

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/payment-links
2. Create a new Payment Link for donations
3. Copy the link
4. Replace in the file:
   ```html
   <a href="YOUR_STRIPE_PAYMENT_LINK_HERE" ...>
   ```
   With:
   ```html
   <a href="https://donate.stripe.com/YOUR_ACTUAL_LINK" ...>
   ```

#### 2. Set Up Newsletter Subscription
**Follow Guide**: `/NEWSLETTER-SETUP-GUIDE.md`

Quick Steps:
1. Create Google Sheet named "DNC Newsletter Subscriptions"
2. Add Apps Script code from `/google-apps-script-newsletter.js`
3. Deploy as Web App
4. Copy the Web App URL
5. Update `/assets/js/newsletter.js` line 8 with your URL:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_URL/exec';
   ```

#### 3. Update Social Media Links (If Needed)
**Facebook**: Currently using a share link. If you have a Facebook page, update:
- All pages' footer links
- Contact page social section

---

## Working Features

✅ Navigation with dropdown menus
✅ EcoExplorer pages with local images
✅ Board of Trustees page
✅ Volunteer, Membership, Donate pages
✅ Privacy Policy and Terms pages
✅ Contact page with contact methods
✅ Events page with event types
✅ All image paths fixed
✅ Favicon added to all pages
✅ Newsletter forms ready (pending Google setup)

---

## Testing Checklist

After completing the action items above:

### Stripe Donation
- [ ] Visit `/support/donate.html`
- [ ] Click "Donate Now with Stripe" button
- [ ] Confirm it opens Stripe payment page

### Newsletter Subscription
- [ ] Open any page with newsletter form (footer)
- [ ] Enter test email
- [ ] Click Subscribe
- [ ] Check Google Sheet for new entry
- [ ] Confirm success message displays

### Contact Page
- [ ] No 404 errors in browser console
- [ ] Form is removed
- [ ] Social media links work

### Events Page
- [ ] No calendar errors
- [ ] Content displays properly

---

## Files Reference

### Configuration Files
- `/NEWSLETTER-SETUP-GUIDE.md` - Newsletter setup instructions
- `/google-apps-script-newsletter.js` - Apps Script code
- `/assets/js/newsletter.js` - Client-side newsletter handler

### Key Pages
- `/support/donate.html` - Needs Stripe URL
- `/contact/index.html` - Contact information
- `/events/index.html` - Events page
- `/eco0/index.html` - EcoExplorer landing

### Assets
- `/assets/js/` - JavaScript files
- `/assets/css/` - Stylesheets
- `/assets/images/` - Images and favicon

---

## Questions?

If you run into issues:
1. Check browser console for errors (F12)
2. Verify all URLs are updated correctly
3. Test in incognito/private browsing mode
4. Clear browser cache if changes don't appear

---

## Next Steps

1. Complete Stripe setup
2. Complete Newsletter setup
3. Test all forms
4. Add content/events when ready
5. Update social media links if needed
