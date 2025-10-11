# Setup and Deployment Guide
## Demarest Nature Center - Static Website

---

## Quick Start

This guide will help you set up and deploy your new static website with carousel, RSS news feed, and Google Apps Script integration.

---

## Prerequisites

- Text editor (VS Code recommended)
- Web browser (Chrome or Firefox recommended)
- Google account (for Google Apps Script)
- GitHub account (for hosting)

---

## Part 1: Local Development Setup

### Step 1: File Structure

Your project should have this structure:

```
dnc/
├── index.html
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── carousel.css
│   │   └── rss-feed.css
│   ├── js/
│   │   ├── carousel.js
│   │   ├── main.js
│   │   ├── events.js
│   │   └── rss-feed.js
│   └── images/
│       ├── logo.png (add your logo)
│       ├── favicon.png (add your favicon)
│       ├── carousel/
│       │   ├── slide1.jpg (add 4 carousel images)
│       │   ├── slide2.jpg
│       │   ├── slide3.jpg
│       │   └── slide4.jpg
│       ├── gallery/
│       │   ├── thumb1.jpg (add 6 gallery thumbnails)
│       │   ├── thumb2.jpg
│       │   ├── thumb3.jpg
│       │   ├── thumb4.jpg
│       │   ├── thumb5.jpg
│       │   └── thumb6.jpg
│       ├── nature-center-exterior.jpg
│       ├── mission-image.jpg
│       └── og-image.jpg (for social sharing)
```

### Step 2: Add Your Images

**Required Images:**

1. **Logo** (`assets/images/logo.png`)
   - Recommended size: 200-300px wide
   - Transparent PNG preferred
   - Should be your nature center logo

2. **Favicon** (`assets/images/favicon.png`)
   - Size: 32x32px or 64x64px
   - PNG format

3. **Carousel Images** (`assets/images/carousel/`)
   - 4 images: slide1.jpg through slide4.jpg
   - Recommended size: 1920x600px or 1600x600px
   - High quality nature/facility photos
   - Subjects:
     - Slide 1: Scenic trail or landscape
     - Slide 2: Educational program in action
     - Slide 3: Wildlife or nature close-up
     - Slide 4: Community event or group activity

4. **Gallery Thumbnails** (`assets/images/gallery/`)
   - 6 images: thumb1.jpg through thumb6.jpg
   - Recommended size: 600x600px (square)
   - Diverse subjects: trails, wildlife, programs, events, nature, seasonal

5. **Content Images**
   - `nature-center-exterior.jpg` - Building/facility exterior
   - `mission-image.jpg` - Mission-related photo (people in nature, education, etc.)
   - `og-image.jpg` - For social media sharing (1200x630px recommended)

**Quick Image Tip:**
Until you have real images, you can use placeholder services:
- https://placehold.co/1920x600 (for carousel)
- https://placehold.co/600x600 (for thumbnails)

### Step 3: Test Locally

**Option A: Python SimpleHTTPServer**
```bash
# Navigate to your project folder
cd /Users/kriskumar/dnc

# Start server (Python 3)
python3 -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000

# Open browser to http://localhost:8000
```

**Option B: VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

**Option C: Node.js http-server**
```bash
# Install globally
npm install -g http-server

# Run in project directory
http-server

# Open browser to http://localhost:8080
```

---

## Part 2: Google Apps Script Setup

### Step 1: Create Contact Form Handler

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Name it "DNC Contact Form"
4. Copy the code from `GOOGLE_APPS_SCRIPT_GUIDE.md` (Contact Form section)
5. Create associated Google Sheet
6. Deploy as Web App:
   - Click **Deploy** → **New deployment**
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Click **Deploy**
   - Copy the Web App URL

### Step 2: Create Events System

1. Create new Apps Script project "DNC Events"
2. Create Google Sheet with these tabs:
   - **Events**: Columns: Event ID, Event Name, Date, Time, Location, Capacity, Price, Status
   - **Registrations**: Columns: Timestamp, Event ID, Event Name, Name, Email, Phone, Attendees, Status
3. Add sample events to test
4. Deploy as Web App
5. Copy the URL

### Step 3: Update JavaScript Files

**Update `assets/js/events.js`:**
```javascript
// Line 7 - Replace with your Events Apps Script URL
const EVENTS_API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

**Update `assets/js/main.js`:**
```javascript
// Line 55 - Replace with your Newsletter Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

---

## Part 3: RSS Feed Configuration

The RSS feed is already configured with default nature news sources. You can customize the feeds in `assets/js/rss-feed.js`:

```javascript
feeds: [
  'https://www.nature.com/nature.rss',
  'https://www.sciencedaily.com/rss/earth_climate/environmental_issues.xml',
  'https://www.ehn.org/feed',
  'https://e360.yale.edu/feed',
  // Add your custom feeds here
],
```

**Note:** The RSS feed uses [rss2json.com](https://rss2json.com) API (free tier: 10,000 requests/day). No configuration needed.

---

## Part 4: Content Customization

### Update Contact Information

**In `index.html` (footer section):**

```html
<!-- Line 360-369 -->
<p>123 Nature Way<br>
Demarest, NJ 07627</p>
<p><strong>Phone:</strong> (555) 123-4567<br>
<strong>Email:</strong> info@demarestnaturecenter.org</p>
<div class="footer-hours">
  <strong>Hours:</strong><br>
  Monday - Friday: 9:00 AM - 5:00 PM<br>
  Saturday - Sunday: 10:00 AM - 4:00 PM
</div>
```

**Replace with your actual:**
- Address
- Phone number
- Email address
- Operating hours

### Update Social Media Links

**In `index.html` (footer section around line 389):**

```html
<a href="https://facebook.com/YOUR_PAGE" ...>
<a href="https://instagram.com/YOUR_PAGE" ...>
<a href="https://twitter.com/YOUR_PAGE" ...>
```

Replace `YOUR_PAGE` with your actual social media handles.

### Customize Colors

**In `assets/css/main.css` (top of file):**

```css
:root {
  --color-primary: #2c5f2d;        /* Main green */
  --color-primary-dark: #1e4620;   /* Darker green */
  --color-secondary: #8b4513;      /* Brown */
  --color-accent: #f4a460;         /* Sandy brown */
  /* ... */
}
```

Adjust these hex color codes to match your branding.

---

## Part 5: GitHub Pages Deployment

### Step 1: Create GitHub Repository

```bash
# Initialize git (if not already done)
cd /Users/kriskumar/dnc
git init
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Initial commit: Static website with carousel and RSS feed"

# Create repository on GitHub
# Then add remote and push
git remote add origin https://github.com/YOUR_USERNAME/dnc-website.git
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** (left sidebar)
4. Under **Source**, select **main** branch
5. Click **Save**
6. Wait 1-2 minutes for deployment
7. Your site will be at: `https://YOUR_USERNAME.github.io/dnc-website/`

### Step 3: Add Custom Domain

1. In GitHub Pages settings, add your custom domain: `demarestnaturecenter.org`
2. Check **Enforce HTTPS**
3. At your domain registrar, add DNS records:

**For root domain (demarestnaturecenter.org):**
```
Type: A
Name: @
Value: 185.199.108.153
```
```
Type: A
Name: @
Value: 185.199.109.153
```
```
Type: A
Name: @
Value: 185.199.110.153
```
```
Type: A
Name: @
Value: 185.199.111.153
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
```

4. Wait 24-48 hours for DNS propagation

---

## Part 6: Testing Checklist

Before going live, test all features:

### Homepage
- [ ] Carousel auto-rotates every 5 seconds
- [ ] Carousel controls (prev/next) work
- [ ] Carousel indicators work
- [ ] Mobile menu toggles properly
- [ ] All images load
- [ ] Newsletter form submits (test with real email)
- [ ] RSS feed ticker scrolls continuously
- [ ] All buttons link to correct pages

### Events Section
- [ ] Events load from Google Sheets
- [ ] Event cards display properly
- [ ] Registration buttons appear for available events
- [ ] "Event Full" shows when capacity reached

### RSS Feed
- [ ] News ticker loads and scrolls
- [ ] Links open in new tab
- [ ] Time stamps show correctly
- [ ] Pause on hover works

### Forms
- [ ] Contact form submits to Google Sheets
- [ ] Email confirmations send
- [ ] Validation works (try invalid email)
- [ ] Success message displays

### Responsive Design
- [ ] Test on phone (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1200px+ width)
- [ ] Mobile menu works
- [ ] Images scale properly
- [ ] Text is readable at all sizes

### Cross-Browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Part 7: Performance Optimization

### Image Optimization

**Before uploading images:**

1. **Resize images:**
   - Carousel: 1920x600px max
   - Thumbnails: 600x600px
   - Content images: 1200px max width

2. **Compress images:**
   - Use [TinyPNG.com](https://tinypng.com)
   - Or [Squoosh.app](https://squoosh.app)
   - Target: Under 200KB per image

3. **Convert to WebP (optional but recommended):**
   - Better compression than JPG
   - Supported by all modern browsers
   - Use online converter or Photoshop

### Performance Testing

1. Go to [PageSpeed Insights](https://pagespeed.web.dev/)
2. Enter your site URL
3. Aim for scores above 90
4. Fix any issues identified

---

## Part 8: SEO Setup

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (domain)
3. Verify ownership (DNS or HTML file)
4. Submit sitemap.xml (create this file)

### Create sitemap.xml

Create `sitemap.xml` in root directory:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://demarestnaturecenter.org/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://demarestnaturecenter.org/about/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://demarestnaturecenter.org/programs/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://demarestnaturecenter.org/events/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Add all pages -->
</urlset>
```

### Google Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Create GA4 property
3. Get tracking code
4. Add before `</head>` in index.html:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Troubleshooting

### Carousel not working
- Check browser console for errors
- Ensure `carousel.js` is loading
- Verify images exist at correct paths

### Events not loading
- Check Apps Script URL in `events.js`
- Verify Apps Script is deployed as Web App
- Check Apps Script permissions (Anyone can access)
- Test API URL directly in browser

### RSS feed not showing
- Check browser console for CORS errors
- Verify `rss-feed.js` is loading
- Check rss2json.com API limits (10k/day free)

### Forms not submitting
- Check Apps Script URL in `main.js`
- Verify Google Sheet permissions
- Check browser console for errors
- Test Apps Script deployment URL

### Images not loading
- Check file paths (case-sensitive)
- Ensure images are in correct folders
- Use browser inspector to check actual paths

---

## Maintenance

### Regular Tasks

**Weekly:**
- Update events in Google Sheet
- Check form submissions
- Review analytics

**Monthly:**
- Update news/blog content
- Add new gallery photos
- Check broken links
- Review SEO rankings

**Quarterly:**
- Update seasonal images
- Refresh program descriptions
- Review and update hours/contact info
- Performance audit

---

## Going Live Checklist

Before switching DNS to new site:

- [ ] All content proofread
- [ ] All images optimized and uploaded
- [ ] All forms tested and working
- [ ] All Apps Script URLs configured
- [ ] Contact information correct
- [ ] Social media links correct
- [ ] Google Analytics installed
- [ ] Tested on mobile devices
- [ ] Tested on all major browsers
- [ ] SSL certificate working (HTTPS)
- [ ] 404 page created
- [ ] Sitemap.xml created
- [ ] Robots.txt created
- [ ] Favicon showing correctly

---

## Support Resources

- **GitHub Pages:** https://docs.github.com/pages
- **Google Apps Script:** https://developers.google.com/apps-script
- **Web Development:** https://developer.mozilla.org/
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Google Search Console:** https://search.google.com/search-console

---

## Next Steps

1. ✅ Add all images to `/assets/images/` folders
2. ✅ Set up Google Apps Script (contact form, events)
3. ✅ Update all URLs in JavaScript files
4. ✅ Update contact information
5. ✅ Test locally
6. ✅ Push to GitHub
7. ✅ Enable GitHub Pages
8. ✅ Configure custom domain
9. ✅ Add Google Analytics
10. ✅ Submit sitemap to Google Search Console

---

**Congratulations!** Your static website is ready to launch! 🚀

For questions, refer to the other documentation files:
- `MIGRATION_PLAN.md` - Overall strategy
- `GOOGLE_APPS_SCRIPT_GUIDE.md` - Backend integration
- `IMPLEMENTATION_ROADMAP.md` - Week-by-week plan
