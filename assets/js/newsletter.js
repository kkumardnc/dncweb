/**
 * Newsletter Subscription Handler
 * Handles all newsletter form submissions across the site
 */

// IMPORTANT: Replace this with your Google Apps Script Web App URL
// After deploying your Apps Script, paste the URL here
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-2N2QuFjiXnPa9Q_DJo2TnS8wd992_CWevQkWsU9vtQ_P6TUbLNuUnBkOR8_ImGk_/exec';

// Initialize all newsletter forms when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeNewsletterForms();
});

/**
 * Initialize all newsletter forms on the page
 */
function initializeNewsletterForms() {
    // Find all newsletter forms
    const forms = [
        document.getElementById('footerNewsletter'),
        document.getElementById('newsletterForm'),
        document.querySelector('.newsletter-form'),
        document.querySelector('.mini-newsletter')
    ].filter(form => form !== null);

    // Add event listeners to each form
    forms.forEach(form => {
        form.addEventListener('submit', handleNewsletterSubmit);
    });
}

/**
 * Handle newsletter form submission
 */
async function handleNewsletterSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    // Validate email
    if (!email || !isValidEmail(email)) {
        showMessage(form, 'Please enter a valid email address', 'error');
        return;
    }

    // Check if script URL is configured
    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        showMessage(form, 'Newsletter service is not yet configured. Please contact us directly.', 'error');
        console.error('Newsletter script URL not configured. Please update SCRIPT_URL in newsletter.js');
        return;
    }

    // Disable submit button to prevent double submission
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Subscribing...';

    try {
        // Get source page for tracking
        const source = getPageSource();

        // Send subscription request
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                source: source,
                timestamp: new Date().toISOString()
            })
        });

        // Parse the JSON response from Google Apps Script
        const result = await response.json();

        // Show the message from the server
        if (result.success) {
            showMessage(form, result.message, 'success');
            emailInput.value = ''; // Clear input on success
        } else {
            showMessage(form, result.message, 'error');
        }

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        showMessage(form, 'An error occurred. Please try again or contact us directly.', 'error');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Get current page source for tracking
 */
function getPageSource() {
    const path = window.location.pathname;

    if (path.includes('/contact')) return 'Contact Page';
    if (path.includes('/events')) return 'Events Page';
    if (path.includes('/about')) return 'About Page';
    if (path.includes('/programs')) return 'Programs Page';
    if (path.includes('/visit')) return 'Visit Page';
    if (path.includes('/support')) return 'Support Page';
    if (path === '/' || path === '/index.html') return 'Homepage';

    return 'Footer';
}

/**
 * Show success or error message
 */
function showMessage(form, message, type) {
    // Remove any existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.marginTop = '1rem';
    messageDiv.style.padding = '0.75rem';
    messageDiv.style.borderRadius = '6px';
    messageDiv.style.fontSize = '0.9rem';
    messageDiv.style.textAlign = 'center';

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
    } else {
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    }

    // Insert message after form
    form.appendChild(messageDiv);

    // Auto-remove message after 5 seconds
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s ease';
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

/**
 * Alternative: Simple mailto fallback
 * Uncomment this if you want a simple email fallback
 */
/*
function mailtoFallback(email) {
    const subject = encodeURIComponent('Newsletter Subscription');
    const body = encodeURIComponent(`Please add me to your newsletter:\n\nEmail: ${email}`);
    window.location.href = `mailto:info@demarestnaturecenter.org?subject=${subject}&body=${body}`;
}
*/
