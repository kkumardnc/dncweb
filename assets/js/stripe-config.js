// Stripe Configuration for Demarest Nature Center
// Replace with your actual Stripe publishable key
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';

// Initialize Stripe
const stripe = window.Stripe ? window.Stripe(STRIPE_PUBLIC_KEY) : null;

// Stripe Price IDs - Replace these with your actual Price IDs from Stripe Dashboard
const DONATION_PRICES = {
  25: 'price_donation_25',
  50: 'price_donation_50',
  100: 'price_donation_100',
  250: 'price_donation_250',
  500: 'price_donation_500',
  1000: 'price_donation_1000'
};

const MEMBERSHIP_PRICES = {
  individual: 'price_membership_individual',
  family: 'price_membership_family',
  student: 'price_membership_student',
  senior: 'price_membership_senior',
  patron: 'price_membership_patron',
  benefactor: 'price_membership_benefactor'
};

// Redirect to Stripe Checkout
async function redirectToCheckout(priceId, mode = 'payment') {
  if (!stripe) {
    alert('Stripe is not loaded. Please refresh the page and try again.');
    return;
  }

  try {
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: mode, // 'payment' for one-time, 'subscription' for recurring
      successUrl: window.location.origin + '/thank-you.html?session_id={CHECKOUT_SESSION_ID}',
      cancelUrl: window.location.href,
      customerEmail: document.getElementById('email')?.value || undefined,
      billingAddressCollection: 'auto',
    });

    if (error) {
      console.error('Stripe error:', error);
      alert('Payment error: ' + error.message);
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('An error occurred. Please try again.');
  }
}

// Create custom amount checkout
async function createCustomCheckout(amount, isRecurring = false) {
  if (!stripe) {
    alert('Stripe is not loaded. Please refresh the page and try again.');
    return;
  }

  // For custom amounts, you'll need to create a server endpoint
  // that creates a Checkout Session with the custom amount
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount,
      isRecurring: isRecurring,
      email: document.getElementById('email')?.value,
      metadata: {
        source: 'website_donation',
        type: isRecurring ? 'recurring' : 'one-time'
      }
    }),
  });

  const session = await response.json();

  if (session.error) {
    alert('Error: ' + session.error);
    return;
  }

  // Redirect to Checkout
  const { error } = await stripe.redirectToCheckout({
    sessionId: session.id,
  });

  if (error) {
    alert('Payment error: ' + error.message);
  }
}

// Handle donation form submission
function handleDonationSubmit(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const donationType = document.querySelector('input[name="donation_type"]:checked').value;

  if (!amount || amount < 1) {
    alert('Please enter a valid donation amount');
    return;
  }

  // Check if we have a preset price ID for this amount
  const priceId = DONATION_PRICES[amount];

  if (priceId) {
    // Use preset price
    const mode = donationType === 'monthly' ? 'subscription' : 'payment';
    redirectToCheckout(priceId, mode);
  } else {
    // Use custom amount (requires server endpoint)
    const isRecurring = donationType === 'monthly';
    createCustomCheckout(amount * 100, isRecurring); // Convert to cents
  }
}

// Handle membership form submission
function handleMembershipSubmit(event) {
  event.preventDefault();

  const membershipType = document.querySelector('input[name="membership_type"]:checked')?.value;

  if (!membershipType) {
    alert('Please select a membership level');
    return;
  }

  const priceId = MEMBERSHIP_PRICES[membershipType];

  if (priceId) {
    redirectToCheckout(priceId, 'subscription');
  } else {
    alert('Invalid membership type selected');
  }
}

// Export functions for use in HTML
window.stripeCheckout = {
  redirectToCheckout,
  createCustomCheckout,
  handleDonationSubmit,
  handleMembershipSubmit
};
