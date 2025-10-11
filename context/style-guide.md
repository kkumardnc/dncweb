# Demarest Nature Center - Style Guide

## Brand Overview
This style guide is based on the visual design of demarestnaturecenter.org and provides comprehensive guidelines for maintaining consistent design across HTML/CSS/JS implementations.

---

## Color Palette

### Primary Colors
```css
/* Forest Green - Primary brand color */
--color-primary: #2d5016;
--color-primary-light: #4a7a2c;
--color-primary-dark: #1d3a0e;

/* Earth Brown - Secondary accent */
--color-secondary: #8b6f47;
--color-secondary-light: #a38a68;
--color-secondary-dark: #6d5636;

/* Natural Tan/Beige */
--color-tertiary: #d4c5b0;
--color-tertiary-light: #e5dac9;
--color-tertiary-dark: #b8a990;
```

### Neutral Colors
```css
/* Background and text colors */
--color-white: #ffffff;
--color-off-white: #f9f8f6;
--color-light-gray: #e8e6e3;
--color-gray: #858585;
--color-dark-gray: #4a4a4a;
--color-black: #1a1a1a;
```

### Accent Colors
```css
/* Nature-inspired accents */
--color-sky-blue: #87CEEB;
--color-leaf-green: #6fa86f;
--color-sunset-orange: #d97847;
```

### Semantic Colors
```css
/* UI feedback colors */
--color-success: #4caf50;
--color-warning: #ff9800;
--color-error: #f44336;
--color-info: #2196f3;
```

---

## Typography

### Font Families
```css
/* Primary font stack */
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                "Helvetica Neue", Arial, sans-serif;

/* Headings font (if custom) */
--font-headings: "Georgia", "Times New Roman", serif;

/* Monospace for code */
--font-mono: "Courier New", Courier, monospace;
```

### Font Sizes
```css
/* Base size */
--font-size-base: 16px;

/* Scale */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-md: 1rem;       /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
```

### Headings
```css
h1 {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-primary-dark);
  margin-bottom: 1.5rem;
}

h2 {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-primary);
  margin-bottom: 1.25rem;
}

h3 {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

h4 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-dark-gray);
  margin-bottom: 0.75rem;
}

h5 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

h6 {
  font-size: var(--font-size-md);
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}
```

### Body Text
```css
body {
  font-family: var(--font-primary);
  font-size: var(--font-size-md);
  line-height: 1.6;
  color: var(--color-dark-gray);
  background-color: var(--color-white);
}

p {
  margin-bottom: 1.25rem;
  line-height: 1.6;
}

.lead {
  font-size: var(--font-size-lg);
  line-height: 1.7;
  color: var(--color-gray);
}

small {
  font-size: var(--font-size-sm);
}
```

---

## Spacing System

### Spacing Scale
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
--spacing-4xl: 6rem;     /* 96px */
--spacing-5xl: 8rem;     /* 128px */
```

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1440px;

.container {
  width: 100%;
  max-width: var(--container-xl);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
}
```

---

## Buttons

### Primary Button
```css
.btn-primary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: var(--font-size-md);
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  color: var(--color-white);
  background-color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(45, 80, 22, 0.2);
}

.btn-primary:active {
  transform: translateY(0);
}
```

### Secondary Button
```css
.btn-secondary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: var(--font-size-md);
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  color: var(--color-primary);
  background-color: transparent;
  border: 2px solid var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  color: var(--color-white);
  background-color: var(--color-primary);
}
```

### Button Sizes
```css
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: var(--font-size-sm);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: var(--font-size-lg);
}
```

---

## Navigation

### Header/Navigation Bar
```css
.header {
  background-color: var(--color-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.nav-logo img {
  height: 60px;
  width: auto;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-link {
  color: var(--color-dark-gray);
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-md);
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link.active {
  color: var(--color-primary);
  font-weight: 600;
}
```

---

## Cards & Components

### Card Component
```css
.card {
  background-color: var(--color-white);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.card-text {
  color: var(--color-gray);
  line-height: 1.6;
  margin-bottom: 1rem;
}
```

### Section Patterns
```css
.section {
  padding: var(--spacing-4xl) 0;
}

.section-alt {
  background-color: var(--color-off-white);
}

.section-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.section-title {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-md);
}

.section-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-gray);
}
```

---

## Forms

### Input Fields
```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-dark-gray);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: var(--font-size-md);
  font-family: var(--font-primary);
  color: var(--color-dark-gray);
  background-color: var(--color-white);
  border: 2px solid var(--color-light-gray);
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  font-size: var(--font-size-md);
  color: var(--color-dark-gray);
  background-color: var(--color-white);
  border: 2px solid var(--color-light-gray);
  border-radius: 4px;
  cursor: pointer;
}
```

---

## Images

### Image Styles
```css
.img-responsive {
  max-width: 100%;
  height: auto;
  display: block;
}

.img-rounded {
  border-radius: 8px;
}

.img-circle {
  border-radius: 50%;
}

.img-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-contain {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

### Hero Section
```css
.hero {
  position: relative;
  min-height: 500px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(45, 80, 22, 0.5);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  padding: 2rem;
}

.hero-title {
  font-size: var(--font-size-5xl);
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
```

---

## Grid System

### Flexbox Grid
```css
.row {
  display: flex;
  flex-wrap: wrap;
  margin-left: calc(var(--spacing-lg) * -1);
  margin-right: calc(var(--spacing-lg) * -1);
}

.col {
  flex: 1;
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
}

.col-1 { flex: 0 0 8.333333%; }
.col-2 { flex: 0 0 16.666667%; }
.col-3 { flex: 0 0 25%; }
.col-4 { flex: 0 0 33.333333%; }
.col-6 { flex: 0 0 50%; }
.col-8 { flex: 0 0 66.666667%; }
.col-12 { flex: 0 0 100%; }
```

---

## Utility Classes

### Display
```css
.d-none { display: none; }
.d-block { display: block; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }
.d-flex { display: flex; }
```

### Text Alignment
```css
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
```

### Margin & Padding Utilities
```css
/* Margin */
.m-0 { margin: 0; }
.m-auto { margin: auto; }
.mt-1 { margin-top: var(--spacing-sm); }
.mt-2 { margin-top: var(--spacing-md); }
.mt-3 { margin-top: var(--spacing-lg); }
.mb-1 { margin-bottom: var(--spacing-sm); }
.mb-2 { margin-bottom: var(--spacing-md); }
.mb-3 { margin-bottom: var(--spacing-lg); }

/* Padding */
.p-0 { padding: 0; }
.pt-1 { padding-top: var(--spacing-sm); }
.pt-2 { padding-top: var(--spacing-md); }
.pt-3 { padding-top: var(--spacing-lg); }
.pb-1 { padding-bottom: var(--spacing-sm); }
.pb-2 { padding-bottom: var(--spacing-md); }
.pb-3 { padding-bottom: var(--spacing-lg); }
```

---

## Animations & Transitions

### Common Transitions
```css
/* Smooth transitions */
.transition-all {
  transition: all 0.3s ease;
}

.transition-fast {
  transition: all 0.15s ease;
}

.transition-slow {
  transition: all 0.5s ease;
}
```

### Hover Effects
```css
.hover-lift {
  transition: transform 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
}

.hover-shadow {
  transition: box-shadow 0.3s ease;
}

.hover-shadow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Fade In Animation
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}
```

---

## Responsive Design

### Breakpoints
```css
/* Mobile first approach */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1440px;
```

### Media Queries
```css
/* Small devices (landscape phones, 640px and up) */
@media (min-width: 640px) {
  .container {
    max-width: var(--container-sm);
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .container {
    max-width: var(--container-md);
  }
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  .container {
    max-width: var(--container-lg);
  }
}

/* Extra large devices (large desktops, 1280px and up) */
@media (min-width: 1280px) {
  .container {
    max-width: var(--container-xl);
  }
}
```

### Responsive Utilities
```css
/* Hide on mobile */
@media (max-width: 767px) {
  .hide-mobile {
    display: none !important;
  }
}

/* Hide on desktop */
@media (min-width: 768px) {
  .hide-desktop {
    display: none !important;
  }
}
```

---

## Footer

### Footer Styles
```css
.footer {
  background-color: var(--color-primary-dark);
  color: var(--color-white);
  padding: var(--spacing-3xl) 0 var(--spacing-xl);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.footer-section h4 {
  color: var(--color-white);
  margin-bottom: var(--spacing-md);
}

.footer-link {
  color: var(--color-light-gray);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--color-white);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: var(--spacing-lg);
  text-align: center;
  color: var(--color-light-gray);
  font-size: var(--font-size-sm);
}
```

---

## Accessibility

### Focus States
```css
a:focus,
button:focus,
input:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: var(--color-white);
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-to-content:focus {
  top: 0;
}
```

---

## Icons & SVG

### Icon Sizing
```css
.icon-sm {
  width: 16px;
  height: 16px;
}

.icon-md {
  width: 24px;
  height: 24px;
}

.icon-lg {
  width: 32px;
  height: 32px;
}

.icon-xl {
  width: 48px;
  height: 48px;
}
```

---

## Best Practices

### CSS Organization
1. Use CSS Custom Properties (variables) for consistent theming
2. Follow mobile-first responsive design approach
3. Use semantic class names (BEM methodology recommended)
4. Keep specificity low, avoid !important unless necessary
5. Group related styles together
6. Add comments for complex sections

### HTML Best Practices
1. Use semantic HTML5 elements (header, nav, main, article, section, footer)
2. Include proper meta tags for responsiveness
3. Use alt attributes for all images
4. Maintain proper heading hierarchy (h1 → h2 → h3)
5. Include ARIA labels where appropriate

### JavaScript Integration
1. Use data attributes for JS hooks (data-toggle, data-target)
2. Separate behavior from presentation
3. Use event delegation for dynamic content
4. Ensure progressive enhancement

---

## Example Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demarest Nature Center</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a href="#main-content" class="skip-to-content">Skip to main content</a>

  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="nav-logo">
          <img src="logo.png" alt="Demarest Nature Center Logo">
        </div>
        <ul class="nav-menu">
          <li><a href="#" class="nav-link active">Home</a></li>
          <li><a href="#" class="nav-link">About</a></li>
          <li><a href="#" class="nav-link">Programs</a></li>
          <li><a href="#" class="nav-link">Visit</a></li>
          <li><a href="#" class="nav-link">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <section class="hero" style="background-image: url('hero.jpg')">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to Nature</h1>
        <p class="hero-subtitle">Discover, Learn, Explore</p>
        <a href="#" class="btn-primary btn-lg">Plan Your Visit</a>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Our Programs</h2>
          <p class="section-subtitle">Educational experiences for all ages</p>
        </div>
        <div class="row">
          <div class="col col-4">
            <div class="card">
              <img src="program1.jpg" alt="Program 1" class="card-image">
              <div class="card-content">
                <h3 class="card-title">Nature Walks</h3>
                <p class="card-text">Join our guided nature walks...</p>
                <a href="#" class="btn-secondary">Learn More</a>
              </div>
            </div>
          </div>
          <!-- More cards... -->
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>About Us</h4>
          <p>Demarest Nature Center...</p>
        </div>
        <!-- More footer sections... -->
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Demarest Nature Center. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

---

## Notes

- This style guide is based on visual analysis of demarestnaturecenter.org
- All CSS custom properties can be adjusted to match exact brand colors
- Use this guide as a foundation and refine as needed
- Always test for cross-browser compatibility and accessibility
- Keep the nature-focused, professional aesthetic consistent across all pages
