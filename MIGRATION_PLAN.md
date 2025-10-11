# WordPress to Static Site Migration Plan
## Demarest Nature Center

---

## Overview

**Goal:** Migrate demarestnaturecenter.org from WordPress to a modern static site (HTML/CSS/JS) with Google Apps Script/Workspace integration for dynamic features.

**Benefits:**
- ✅ Improved performance and load times
- ✅ Enhanced security (no server-side vulnerabilities)
- ✅ Reduced hosting costs
- ✅ Better reliability and uptime
- ✅ Easier version control with Git
- ✅ Free hosting options (GitHub Pages, Netlify, Vercel)

---

## Phase 1: Content Audit & Export

### 1.1 WordPress Content Export
**Tools:** WordPress Export, WP All Export plugin, or custom scripts

**Content to Extract:**
- ✅ All pages (About, Mission, Programs, Events, Contact, etc.)
- ✅ Blog posts/news articles
- ✅ Media library (images, PDFs, videos)
- ✅ Custom post types (events, programs, etc.)
- ✅ Navigation menus
- ✅ Widgets and sidebar content
- ✅ Footer content
- ✅ Contact information

**Export Methods:**
1. **Standard WordPress Export:** Tools → Export → All content
2. **WP All Export Plugin:** For structured data export (CSV/JSON)
3. **Media Download:** Use plugins like All-in-One WP Migration or manual FTP
4. **Database Export:** For complete backup (phpMyAdmin)

### 1.2 Content Inventory
Create spreadsheet documenting:
- Page hierarchy
- Content types
- URL structure
- Meta information (titles, descriptions)
- Required redirects

---

## Phase 2: Static Site Architecture

### 2.1 Technology Stack

**Frontend Framework Options:**

**Option A: Vanilla HTML/CSS/JS** (Recommended for simplicity)
- Pure HTML5, CSS3, JavaScript
- No build process required
- Easy to maintain
- Lightweight and fast

**Option B: Static Site Generator**
- **Jekyll** (GitHub Pages native)
- **Hugo** (fastest builds)
- **Eleventy** (flexible, JavaScript-based)
- **Astro** (modern, component-based)

**Option C: Modern Framework with SSG**
- **Next.js** (React-based, excellent SEO)
- **Nuxt.js** (Vue-based)
- **SvelteKit** (Svelte-based)

**Recommendation:** Start with **Vanilla HTML/CSS/JS** or **Eleventy** for balance of simplicity and features.

### 2.2 CSS Framework

**Options:**
- **Tailwind CSS** - Utility-first, highly customizable
- **Bootstrap 5** - Component-based, familiar
- **Custom CSS** - Full control, lighter weight

**Recommendation:** **Tailwind CSS** for modern, maintainable styling

### 2.3 JavaScript Libraries

**Essential:**
- **No jQuery** - Use modern vanilla JS
- **Alpine.js** - For interactive components (lightweight, 15kb)
- **DayJS** - Date formatting and manipulation
- **PhotoSwipe** - Image gallery/lightbox

**Optional:**
- **AOS (Animate On Scroll)** - Scroll animations
- **Swiper** - Carousels/sliders
- **FullCalendar** - Event calendar display

### 2.4 Site Structure

```
/
├── index.html                 # Homepage
├── about/
│   ├── index.html            # About/Mission
│   ├── our-team.html         # Staff & Board
│   └── history.html          # History
├── programs/
│   ├── index.html            # Programs overview
│   ├── education.html        # Educational programs
│   └── camps.html            # Summer camps
├── events/
│   ├── index.html            # Events calendar
│   └── past-events.html      # Archives
├── visit/
│   ├── index.html            # Visitor info
│   ├── hours.html            # Hours & admission
│   └── directions.html       # Location
├── support/
│   ├── index.html            # Ways to support
│   ├── donate.html           # Donation page
│   ├── membership.html       # Membership
│   └── volunteer.html        # Volunteer
├── gallery/
│   └── index.html            # Photo galleries
├── contact/
│   └── index.html            # Contact form
├── news/
│   └── index.html            # Blog/news
├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── documents/
└── data/
    └── events.json           # Event data for calendar
```

---

## Phase 3: Google Apps Script Integration

### 3.1 Google Workspace Setup

**Required:**
- Google Account (existing or new for organization)
- Google Sheets for data storage
- Google Forms (optional, for simple forms)
- Google Apps Script projects

### 3.2 Integration Points

#### A. Contact Form
**Flow:**
1. User fills form on website (HTML form)
2. JavaScript submits to Google Apps Script Web App
3. Apps Script saves to Google Sheet
4. Apps Script sends email notification
5. Apps Script returns success/error to website

**Google Sheet Columns:**
- Timestamp
- Name
- Email
- Subject
- Message
- Status

**Apps Script Functions:**
- `doPost()` - Handle form submissions
- `sendEmail()` - Email notifications
- `logToSheet()` - Save to spreadsheet

#### B. Event Registration
**Google Sheets:**
- **Events Sheet:** Event details, capacity, dates
- **Registrations Sheet:** Registration records
- **Waitlist Sheet:** Waitlist entries

**Features:**
- Check event capacity
- Auto-waitlist when full
- Send confirmation emails
- Track attendee information
- Export for check-in

**Apps Script Functions:**
- `getEvents()` - Fetch upcoming events
- `registerForEvent()` - Process registration
- `checkCapacity()` - Verify availability
- `sendConfirmation()` - Email confirmation
- `addToWaitlist()` - Manage waitlist

#### C. Membership Application
**Google Sheet Columns:**
- Application Date
- Member Name
- Email
- Phone
- Address
- Membership Type
- Payment Status
- Start Date
- Expiration Date
- Status

**Apps Script Functions:**
- `submitMembership()` - Process application
- `sendWelcomeEmail()` - New member welcome
- `trackRenewals()` - Monitor expiration
- `sendRenewalReminder()` - Automated reminders (Time-driven trigger)

#### D. Donation Processing
**Note:** For actual payment processing, integrate with:
- **Stripe** (recommended)
- **PayPal**
- **Donorbox**
- **GiveWP alternative**

**Google Sheet Tracking:**
- Donor Name
- Email
- Amount
- Date
- Donation Type (one-time/recurring)
- Payment Status
- Thank You Sent

**Apps Script:**
- Log donations
- Send thank you emails
- Generate annual summaries
- Donor reporting

#### E. Newsletter Signup
**Google Sheet:**
- Email addresses
- Name (optional)
- Signup Date
- Status (active/unsubscribed)
- Source (which page)

**Integration with:**
- Mailchimp API (via Apps Script)
- SendGrid API
- Or manual export for email service

**Apps Script:**
- `addSubscriber()` - Add to list
- `syncToMailchimp()` - Sync with email service
- `exportList()` - Export subscribers

#### F. Volunteer Opportunities
**Google Sheets:**
- **Opportunities Sheet:** Available positions
- **Applications Sheet:** Volunteer applications
- **Hours Sheet:** Volunteer hour tracking

**Apps Script:**
- `getOpportunities()` - List openings
- `submitApplication()` - Apply for position
- `logHours()` - Track volunteer hours
- `generateReports()` - Volunteer reports

#### G. Facility Rental Requests
**Google Sheet:**
- Request Date
- Event Date
- Name & Contact
- Event Type
- Facility Requested
- Estimated Attendance
- Status (pending/approved/denied)
- Notes

**Apps Script:**
- `checkAvailability()` - Verify date availability
- `submitRequest()` - Log rental request
- `sendConfirmation()` - Notify requester
- `notifyStaff()` - Alert staff of new request

#### H. Event Calendar Display
**Google Sheet as CMS:**
- Event Name
- Date & Time
- Location
- Description
- Category
- Registration Required
- Status (active/cancelled)
- Image URL

**Apps Script:**
- `doGet()` - Web app endpoint
- `getUpcomingEvents()` - Return JSON of events
- CORS headers for cross-origin requests

**Frontend:**
- Fetch events via AJAX
- Display in calendar component
- Filter by category/date
- Link to registration

#### I. Dynamic Content Management
**Google Sheets as Simple CMS:**
- Announcements
- Emergency alerts
- Quick updates
- Featured content

**Apps Script:**
- Serve JSON endpoint
- Cache for performance
- Update website content without deployment

### 3.3 Apps Script Web App Setup

**Deployment Steps:**
1. Create new Apps Script project
2. Write `doGet()` and/or `doPost()` functions
3. Deploy as Web App
4. Set permissions: "Anyone" or "Anyone with link"
5. Copy Web App URL
6. Use URL in website fetch/AJAX calls

**Security Considerations:**
- Implement simple authentication tokens
- Validate all inputs
- Rate limiting (via PropertiesService)
- CORS headers
- Sanitize data before saving

**Example Apps Script Structure:**
```javascript
// Handle GET requests (retrieve data)
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getEvents') {
    return getEvents();
  }

  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle POST requests (submit data)
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  if (action === 'submitContact') {
    return handleContactForm(data);
  }

  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Phase 4: Feature Implementation

### 4.1 Core Pages

#### Homepage
- Hero section with rotating images or video
- Mission statement
- Upcoming events (dynamic via Apps Script)
- Recent news/blog posts
- Photo gallery preview
- Quick links (Visit, Support, Programs)
- Newsletter signup

#### About Pages
- Mission & vision
- History
- Staff & board members
- Annual reports (PDF downloads)
- Testimonials

#### Programs Pages
- Program catalog with filtering
- Age group categorization
- Seasonal programs
- School group information
- Registration links

#### Events Calendar
- Monthly/weekly/list view
- Category filtering
- Search functionality
- Past event archives
- Registration integration

#### Support Pages
- Donation form (Stripe integration)
- Membership levels & benefits
- Volunteer opportunities
- Ways to give (planned giving, etc.)
- Donor recognition

#### Contact Page
- Contact form (Apps Script)
- Location map (Google Maps embed)
- Hours of operation
- Directions
- Social media links

### 4.2 Interactive Features

#### Image Gallery
**Implementation:**
- Organize images by category/event
- Use PhotoSwipe or similar lightbox
- Lazy loading for performance
- Image optimization (WebP format)

**Options:**
- Static JSON file with image metadata
- Google Photos API integration
- Cloudinary or ImageKit for hosting

#### Search Functionality
**Options:**
1. **Client-side search (Lunr.js, Pagefind)**
   - Pre-build search index
   - Fast, no server needed
   - Works offline

2. **Google Custom Search Engine**
   - Free tier available
   - Easy integration
   - Hosted by Google

3. **Algolia** (if budget allows)
   - Powerful search
   - Free tier for nonprofits
   - Excellent UX

#### Blog/News Section
**Options:**
1. **Static markdown files** (with SSG)
2. **Google Sheets as CMS** (via Apps Script)
3. **Headless CMS:**
   - Contentful (free tier)
   - Sanity.io (free tier)
   - Strapi (self-hosted)

**Recommendation:** Markdown files with SSG for simplicity

---

## Phase 5: Hosting & Deployment

### 5.1 Hosting Options

#### Option A: GitHub Pages (Recommended)
**Pros:**
- Free hosting
- Custom domain support
- Built-in CI/CD
- Version control
- SSL certificate included
- Jekyll native support

**Setup:**
1. Create GitHub repository
2. Push code to `main` or `gh-pages` branch
3. Enable GitHub Pages in settings
4. Add custom domain (CNAME)

#### Option B: Netlify
**Pros:**
- Free tier (100GB/month)
- Automatic deployments
- Form handling (100 submissions/month free)
- Functions (serverless)
- Split testing
- Deploy previews

**Setup:**
1. Connect GitHub repository
2. Configure build settings
3. Deploy automatically on push

#### Option C: Vercel
**Pros:**
- Free for personal projects
- Excellent performance
- Serverless functions
- Analytics
- Preview deployments

#### Option D: Cloudflare Pages
**Pros:**
- Free unlimited bandwidth
- Fast global CDN
- Free SSL
- Great performance

### 5.2 Domain Configuration

**Steps:**
1. Update DNS records at domain registrar
2. Point to hosting provider:
   - **GitHub Pages:** A records to GitHub IPs + CNAME
   - **Netlify/Vercel:** CNAME or A record
3. Enable SSL/HTTPS (automatic with most hosts)
4. Configure www redirect (optional)

### 5.3 CI/CD Pipeline

**Using GitHub Actions:**
```yaml
name: Deploy Site

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Phase 6: Migration Execution

### 6.1 Pre-Migration Checklist
- [ ] Complete content audit
- [ ] Export all WordPress content
- [ ] Download all media files
- [ ] Document current URL structure
- [ ] Set up Google Workspace account
- [ ] Create Google Sheets for data
- [ ] Test Apps Script functions
- [ ] Set up hosting account
- [ ] Configure domain DNS (prepare, don't activate)

### 6.2 Development Phase
- [ ] Build static site structure
- [ ] Convert WordPress content to HTML
- [ ] Implement responsive design
- [ ] Create reusable components
- [ ] Build Google Apps Script integrations
- [ ] Test all forms and interactive features
- [ ] Optimize images and assets
- [ ] Implement SEO (meta tags, structured data)
- [ ] Create sitemap.xml
- [ ] Set up analytics (Google Analytics 4)

### 6.3 Testing Phase
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness testing
- [ ] Form submission testing
- [ ] Apps Script integration testing
- [ ] Performance testing (PageSpeed Insights)
- [ ] Accessibility testing (WAVE, axe)
- [ ] Link validation
- [ ] SEO audit
- [ ] User acceptance testing

### 6.4 Migration Day
- [ ] Final backup of WordPress site
- [ ] Deploy static site to staging URL
- [ ] Final testing on staging
- [ ] Update DNS to point to new host
- [ ] Verify new site is live
- [ ] Submit updated sitemap to Google Search Console
- [ ] Monitor for issues
- [ ] Keep WordPress site accessible (read-only) for 30 days

### 6.5 Post-Migration
- [ ] Set up redirects (if URL structure changed)
- [ ] Update social media profile links
- [ ] Update email signatures
- [ ] Update printed materials (if applicable)
- [ ] Monitor analytics for traffic patterns
- [ ] Monitor Google Search Console for crawl errors
- [ ] Train staff on updating content
- [ ] Document update procedures
- [ ] Archive WordPress site

---

## Phase 7: Content Management Strategy

### 7.1 Updating Static Content

**Option A: Direct GitHub Editing**
- Edit files directly on GitHub web interface
- Commit changes trigger automatic deployment
- Non-technical staff can make simple edits

**Option B: Local Development**
- Clone repository locally
- Use VS Code or similar editor
- Push changes to deploy

**Option C: Netlify CMS / Decap CMS**
- Admin interface for non-technical users
- Markdown-based
- Git-backed
- Free and open source

**Option D: Forestry.io / Tina CMS**
- User-friendly interface
- Git-based
- Real-time preview

**Recommendation:** **Netlify CMS (Decap CMS)** for staff-friendly editing

### 7.2 Event Management Workflow
1. Add event to Google Sheet (Events)
2. Website automatically fetches and displays
3. Registration form links to Apps Script
4. Confirmations sent automatically
5. Track registrations in Google Sheet
6. Export attendee list for event day

### 7.3 Blog Post Workflow
**With Static Site Generator:**
1. Create markdown file in `/posts/` folder
2. Add frontmatter (title, date, author, etc.)
3. Commit to repository
4. Site automatically rebuilds and deploys

**With Decap CMS:**
1. Log into CMS admin
2. Click "New Post"
3. Fill in form fields
4. Upload images
5. Publish (automatic deployment)

---

## Timeline Estimate

### Small Site (5-15 pages, basic features)
- **Planning:** 1 week
- **Development:** 3-4 weeks
- **Testing:** 1 week
- **Migration:** 1 day
- **Total:** 5-6 weeks

### Medium Site (15-30 pages, moderate features)
- **Planning:** 2 weeks
- **Development:** 6-8 weeks
- **Testing:** 2 weeks
- **Migration:** 1-2 days
- **Total:** 10-12 weeks

### Large Site (30+ pages, complex features)
- **Planning:** 3 weeks
- **Development:** 10-12 weeks
- **Testing:** 3 weeks
- **Migration:** 2-3 days
- **Total:** 16-18 weeks

---

## Cost Breakdown

### Free Tier Options (Recommended for Nonprofit)
- **Hosting:** $0 (GitHub Pages, Netlify, or Vercel free tier)
- **Domain:** $10-15/year (existing)
- **SSL Certificate:** $0 (included with hosting)
- **Google Workspace:** $0 (using personal account) or $6/user/month
- **Email Service:** $0-20/month (Mailchimp free tier or SendGrid)
- **Payment Processing:** 2.9% + $0.30 per transaction (Stripe)
- **Total Monthly:** $0-26/month

### Paid Options (Enhanced Features)
- **Hosting:** $0-20/month (premium tier for analytics, etc.)
- **Headless CMS:** $0-29/month (Contentful, Sanity free tiers)
- **Search:** $0/month (Algolia nonprofit plan)
- **CDN:** $0/month (included with hosting)
- **Form Service:** $0-19/month (Netlify forms or Formspree)
- **Monitoring:** $0/month (UptimeRobot free tier)
- **Total Monthly:** $0-68/month

### One-Time Costs
- **Development:** DIY or $3,000-15,000 (if hiring)
- **Design:** DIY or $1,000-5,000 (if hiring)
- **Migration:** DIY or $500-2,000 (if hiring)

---

## Risk Mitigation

### Potential Risks
1. **Data Loss:** Regular backups, version control
2. **Downtime:** Staging environment, DNS propagation planning
3. **Broken Links:** Redirect mapping, link validation
4. **SEO Impact:** Maintain URLs, submit sitemap, monitor rankings
5. **Feature Gaps:** Thorough requirements gathering upfront
6. **Learning Curve:** Documentation, training sessions

### Contingency Plan
- Keep WordPress site accessible (read-only) for 30-60 days
- DNS can be reverted if critical issues arise
- Have backup plan for critical forms (Google Forms as fallback)

---

## Success Metrics

### Performance
- Page load time < 2 seconds
- Lighthouse score > 90
- Mobile-friendly (Google test)
- Core Web Vitals passing

### Functionality
- 100% of forms working correctly
- All content migrated accurately
- Email notifications functioning
- Analytics tracking properly

### Cost Savings
- Hosting costs reduced by X%
- Maintenance time reduced
- No ongoing plugin/theme costs

### User Experience
- Improved mobile experience
- Faster page loads
- Simplified navigation
- Better accessibility score

---

## Recommended Next Steps

1. **Review and Approve Plan** - Stakeholder sign-off
2. **Set Up Development Environment** - GitHub, local tools
3. **Create Google Workspace Setup** - Sheets, Apps Script
4. **Start Content Export** - WordPress export tools
5. **Design Mockups** - Homepage, key templates
6. **Begin Development** - Start with core pages
7. **Implement Apps Script** - Contact form first
8. **Iterative Testing** - Test as you build
9. **Staging Deployment** - Preview before going live
10. **Go Live** - Execute migration plan

---

## Support & Maintenance

### Ongoing Tasks
- Content updates (news, events)
- Image gallery updates
- Security monitoring (GitHub Dependabot)
- Performance monitoring
- Analytics review
- Backup verification
- Form testing

### Documentation Needed
- Content update guide
- Apps Script management
- Emergency rollback procedure
- Form troubleshooting
- Analytics dashboard guide

---

## Conclusion

Migrating to a static site with Google Apps Script integration offers significant benefits:
- **Cost savings** on hosting and maintenance
- **Improved performance** for better user experience
- **Enhanced security** with no server-side vulnerabilities
- **Simplified workflow** with Google Workspace integration
- **Scalability** to handle traffic spikes
- **Version control** for all site changes

The combination of static HTML/CSS/JS with Google Apps Script provides the perfect balance of simplicity, performance, and dynamic functionality for a nature center website.

**Recommended Approach:** Start with a vanilla HTML/CSS/JS site or Eleventy, implement core features first, and iterate based on user feedback.
