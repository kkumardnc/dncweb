/**
 * Main JavaScript - Global functionality
 * Demarest Nature Center
 */

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mainNav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
      }
    });

    // Close mobile menu when clicking a link (but not dropdown parent links)
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Don't close menu if this is a dropdown parent link on mobile
        const parentLi = link.parentElement;
        const isDropdownParent = parentLi && parentLi.classList.contains('has-dropdown');
        const isMobile = window.innerWidth <= 768;

        if (isDropdownParent && isMobile) {
          // Let the dropdown.js handle this
          return;
        }

        // For regular links, close the menu
        mainNav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
      });
    });
  }
});

// Newsletter Form Handler
document.addEventListener('DOMContentLoaded', () => {
  const newsletterForm = document.getElementById('newsletterForm');
  const footerNewsletter = document.getElementById('footerNewsletter');

  // Main newsletter form
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleNewsletterSubmit(newsletterForm, 'newsletter-message');
    });
  }

  // Footer newsletter form
  if (footerNewsletter) {
    footerNewsletter.addEventListener('submit', async (e) => {
      e.preventDefault();
      const messageDiv = document.createElement('div');
      messageDiv.className = 'form-message';
      footerNewsletter.appendChild(messageDiv);
      await handleNewsletterSubmit(footerNewsletter, messageDiv);
    });
  }
});

/**
 * Handle newsletter form submission
 */
async function handleNewsletterSubmit(form, messageDivId) {
  const messageDiv = typeof messageDivId === 'string'
    ? document.getElementById(messageDivId)
    : messageDivId;

  const emailInput = form.querySelector('input[type="email"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const email = emailInput.value;

  // Disable form during submission
  submitButton.disabled = true;
  submitButton.textContent = 'Subscribing...';

  // Replace with your actual Google Apps Script URL
  const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'subscribe',
        email: email
      })
    });

    const result = await response.json();

    if (result.success) {
      showMessage(messageDiv, 'Thank you for subscribing!', 'success');
      form.reset();
    } else {
      showMessage(messageDiv, result.message || 'Subscription failed. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    showMessage(messageDiv, 'An error occurred. Please try again later.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Subscribe';
  }
}

/**
 * Show message to user
 */
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `form-message ${type}`;
  element.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}

/**
 * Smooth scroll for anchor links
 */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

/**
 * Lazy load images
 */
document.addEventListener('DOMContentLoaded', () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
});

/**
 * Add animation on scroll
 */
document.addEventListener('DOMContentLoaded', () => {
  if ('IntersectionObserver' in window) {
    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1
    });

    // Observe elements with .animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      animateOnScroll.observe(el);
    });
  }
});

/**
 * Header scroll effect
 */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
});

/**
 * Print current year in footer
 */
document.addEventListener('DOMContentLoaded', () => {
  const yearElements = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });
});

/**
 * Utility function to format date
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}

/**
 * Utility function to format time
 */
function formatTime(timeString) {
  // Assumes time in format "HH:MM" or "HH:MM AM/PM"
  return timeString;
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
