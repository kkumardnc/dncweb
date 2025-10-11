/**
 * RSS Feed Reader - Scrolling nature news ticker
 * Demarest Nature Center
 */

class RSSFeedReader {
  constructor(options = {}) {
    this.container = options.container || '#rss-feed-ticker';
    this.feeds = options.feeds || [];
    this.maxItems = options.maxItems || 10;
    this.cacheTime = options.cacheTime || 3600000; // 1 hour in milliseconds
    this.scrollSpeed = options.scrollSpeed || 50; // pixels per second

    this.feedItems = [];
    this.init();
  }

  async init() {
    const containerEl = document.querySelector(this.container);
    if (!containerEl) return;

    // Show loading state
    containerEl.innerHTML = '<div class="rss-loading">Loading nature news...</div>';

    try {
      await this.loadFeeds();
      this.renderTicker(containerEl);
      this.startScrolling(containerEl);
    } catch (error) {
      console.error('RSS Feed Error:', error);
      containerEl.innerHTML = '<div class="rss-error">Unable to load news feed</div>';
    }
  }

  /**
   * Load RSS feeds using RSS2JSON API or Google Apps Script proxy
   */
  async loadFeeds() {
    const allItems = [];

    for (const feedUrl of this.feeds) {
      try {
        // Option 1: Use rss2json.com (free tier: 10,000 requests/day)
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

        const response = await fetch(rss2jsonUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items) {
          allItems.push(...data.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: new Date(item.pubDate),
            source: data.feed.title
          })));
        }
      } catch (error) {
        console.error(`Error loading feed ${feedUrl}:`, error);
      }
    }

    // Sort by date (newest first)
    allItems.sort((a, b) => b.pubDate - a.pubDate);

    // Limit items
    this.feedItems = allItems.slice(0, this.maxItems);
  }

  /**
   * Render the ticker HTML
   */
  renderTicker(container) {
    if (this.feedItems.length === 0) {
      container.innerHTML = '<div class="rss-empty">No news items available</div>';
      return;
    }

    const tickerHTML = `
      <div class="rss-ticker-wrapper">
        <div class="rss-ticker-label">
          <span>🌿 Nature News</span>
        </div>
        <div class="rss-ticker-content">
          <div class="rss-ticker-items">
            ${this.feedItems.map(item => this.createTickerItem(item)).join('')}
            ${this.feedItems.map(item => this.createTickerItem(item)).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = tickerHTML;
  }

  /**
   * Create HTML for a single ticker item
   */
  createTickerItem(item) {
    const timeAgo = this.getTimeAgo(item.pubDate);

    return `
      <span class="rss-ticker-item">
        <a href="${item.link}" target="_blank" rel="noopener noreferrer">
          <strong>${item.source}:</strong> ${item.title}
        </a>
        <span class="rss-time">${timeAgo}</span>
        <span class="rss-separator">•</span>
      </span>
    `;
  }

  /**
   * Start the scrolling animation
   */
  startScrolling(container) {
    const tickerItems = container.querySelector('.rss-ticker-items');
    if (!tickerItems) return;

    // CSS animation approach
    const itemsWidth = tickerItems.scrollWidth / 2; // Divided by 2 because we duplicated items
    const duration = itemsWidth / this.scrollSpeed;

    tickerItems.style.animationDuration = `${duration}s`;
  }

  /**
   * Get human-readable time ago
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      if (interval >= 1) {
        return interval === 1 ? `1 ${name} ago` : `${interval} ${name}s ago`;
      }
    }

    return 'Just now';
  }
}

/**
 * Initialize RSS Feed Ticker
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if RSS ticker container exists on page
  if (document.querySelector('#rss-feed-ticker')) {
    new RSSFeedReader({
      container: '#rss-feed-ticker',
      feeds: [
        // Nature and environmental news feeds
        'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml?edition=uk',
        'https://www.theguardian.com/uk/environment/rss',
        'https://e360.yale.edu/feed.xml',
        'https://insideclimatenews.org/feed/',
        'https://www.nature.com/nature.rss',
        'https://www.climatecentral.org/rss',
        'https://news.mongabay.com/feed/',
        'https://grist.org/feed',
        'https://www.greenpeace.org/india/en/tag/forest/feed/'
      ],
      maxItems: 20,  // Increased to show more items from diverse sources
      scrollSpeed: 500  // Much faster scrolling (default: 40, previous: 100)
    });
  }
});

/**
 * Alternative: Google Apps Script Proxy for RSS Feeds
 *
 * If you prefer to use Google Apps Script as a proxy:
 *
 * 1. Create Apps Script function:
 *
 * function doGet(e) {
 *   const feedUrl = e.parameter.feed;
 *   if (!feedUrl) {
 *     return ContentService.createTextOutput(JSON.stringify({error: 'No feed URL provided'}))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *
 *   try {
 *     const response = UrlFetchApp.fetch(feedUrl);
 *     const xml = response.getContentText();
 *     const document = XmlService.parse(xml);
 *     const root = document.getRootElement();
 *
 *     // Parse RSS feed and return JSON
 *     // ... parsing logic ...
 *
 *     return ContentService.createTextOutput(JSON.stringify(items))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } catch (error) {
 *     return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 *
 * 2. Then fetch from your Apps Script URL instead of rss2json
 */
