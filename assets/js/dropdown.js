// Dropdown Navigation JavaScript
// Script runs immediately since it's loaded at end of body

// Mobile dropdown toggle functionality
const dropdownToggles = document.querySelectorAll('#mainNav .has-dropdown > a');

dropdownToggles.forEach(toggle => {
  // Prevent click on mobile - use capturing phase to ensure we catch it first
  toggle.addEventListener('click', function(e) {
    // Only prevent default and toggle on mobile
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      const parentLi = this.parentElement;

      // Close all other dropdowns
      document.querySelectorAll('#mainNav .has-dropdown').forEach(item => {
        if (item !== parentLi) {
          item.classList.remove('mobile-open');
        }
      });

      // Toggle current dropdown
      parentLi.classList.toggle('mobile-open');
    }
  }, true); // Use capture phase

  // Also handle touch events for better mobile support
  toggle.addEventListener('touchstart', function(e) {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      const parentLi = this.parentElement;

      // Close all other dropdowns
      document.querySelectorAll('#mainNav .has-dropdown').forEach(item => {
        if (item !== parentLi) {
          item.classList.remove('mobile-open');
        }
      });

      // Toggle current dropdown
      parentLi.classList.toggle('mobile-open');
    }
  }, { passive: false });
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('#mainNav')) {
    document.querySelectorAll('#mainNav .has-dropdown').forEach(item => {
      item.classList.remove('mobile-open');
    });
  }
});

// Handle window resize - close mobile dropdowns when switching to desktop
let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    if (window.innerWidth > 768) {
      document.querySelectorAll('#mainNav .has-dropdown').forEach(item => {
        item.classList.remove('mobile-open');
      });
    }
  }, 250);
});
