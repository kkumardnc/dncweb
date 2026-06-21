/**
 * Hero Carousel - Automatic image slider
 * Demarest Nature Center
 */

class Carousel {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.slides = this.container.querySelectorAll('.carousel-slide');
    this.indicators = this.container.querySelectorAll('.carousel-indicators button');
    this.prevButton = this.container.querySelector('.carousel-control.prev');
    this.nextButton = this.container.querySelector('.carousel-control.next');

    this.currentIndex = 0;
    this.autoPlayTimer = null;
    this.isPlaying = false;
    this.autoPlayDelay = 5000;  // 5 seconds for image slides
    this.videoMaxDwell = 30000; // safety cap if a video can't report 'ended'

    this.init();
  }

  init() {
    // Set up event listeners
    this.prevButton?.addEventListener('click', () => this.prev());
    this.nextButton?.addEventListener('click', () => this.next());

    // Set up indicator clicks
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.container.addEventListener('mouseleave', () => this.startAutoPlay());

    // Touch/swipe support
    this.setupTouchEvents();

    // Start autoplay
    this.startAutoPlay();
  }

  goToSlide(index) {
    // Pause/reset the outgoing slide's video, if any
    const prevVideo = this.slides[this.currentIndex].querySelector('video');
    if (prevVideo) {
      prevVideo.pause();
      prevVideo.currentTime = 0;
    }

    // Remove active class from current slide and indicator
    this.slides[this.currentIndex].classList.remove('active');
    this.indicators[this.currentIndex]?.classList.remove('active');

    // Update index
    this.currentIndex = index;

    // Add active class to new slide and indicator
    this.slides[this.currentIndex].classList.add('active');
    this.indicators[this.currentIndex]?.classList.add('active');

    // Restart playback if the incoming slide carries a video
    const video = this.slides[this.currentIndex].querySelector('video');
    if (video) {
      video.currentTime = 0;
      // Autoplay may be blocked by the browser; the dwell timer still advances.
      video.play()?.catch(() => {});
    }

    // Re-arm the advance timer for the new slide while autoplaying
    if (this.isPlaying) this.scheduleNext();
  }

  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prev() {
    const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  scheduleNext() {
    clearTimeout(this.autoPlayTimer);
    const video = this.slides[this.currentIndex].querySelector('video');
    if (video) {
      // Advance when the clip ends; cap the wait in case 'ended' never fires
      // (e.g. an unsupported format that can't play at all).
      video.addEventListener('ended', () => this.next(), { once: true });
      this.autoPlayTimer = setTimeout(() => this.next(), this.videoMaxDwell);
    } else {
      this.autoPlayTimer = setTimeout(() => this.next(), this.autoPlayDelay);
    }
  }

  startAutoPlay() {
    this.isPlaying = true;
    const video = this.slides[this.currentIndex].querySelector('video');
    if (video) video.play()?.catch(() => {});
    this.scheduleNext();
  }

  stopAutoPlay() {
    this.isPlaying = false;
    clearTimeout(this.autoPlayTimer);
    const video = this.slides[this.currentIndex].querySelector('video');
    if (video) video.pause();
  }

  setupTouchEvents() {
    let touchStartX = 0;
    let touchEndX = 0;

    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, { passive: true });
  }

  handleSwipe(startX, endX) {
    const swipeThreshold = 50; // Minimum distance for swipe
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next slide
        this.next();
      } else {
        // Swipe right - previous slide
        this.prev();
      }
    }
  }
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Carousel('.hero-carousel');
});
