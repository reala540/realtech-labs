// ============================================================================
// REALTECH LABS - PRODUCTION JAVASCRIPT
// Form handling, validation, and interactive features
// ============================================================================

'use strict';

// ============================================================================
// 1. COOKIE CONSENT MANAGEMENT
// ============================================================================
function initCookieConsent() {
  const consentBanner = document.getElementById('cookie-consent');
  const acceptBtn = document.getElementById('cookie-accept');

  if (!consentBanner || !acceptBtn) return;

  // Check if user has already accepted
  if (localStorage.getItem('realtech-cookies-accepted') === 'true') {
    consentBanner.setAttribute('aria-hidden', 'true');
    consentBanner.style.display = 'none';
  } else {
    consentBanner.setAttribute('aria-hidden', 'false');
  }

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('realtech-cookies-accepted', 'true');
    consentBanner.setAttribute('aria-hidden', 'true');
    consentBanner.style.display = 'none';
  });

  // Allow dismissing with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && consentBanner.getAttribute('aria-hidden') === 'false') {
      acceptBtn.click();
    }
  });
}

// ============================================================================
// 2. FORM VALIDATION
// ============================================================================
class FormValidator {
  constructor(form) {
    this.form = form;
    this.fields = form.querySelectorAll('input, select, textarea');
    this.errors = new Map();
    this.init();
  }

  init() {
    this.fields.forEach((field) => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearFieldError(field));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const name = field.name;
    let error = '';

    switch (field.type) {
      case 'text':
        if (!value) {
          error = 'This field is required';
        } else if (value.length < 2) {
          error = 'Please enter at least 2 characters';
        } else if (value.length > 100) {
          error = 'Please enter no more than 100 characters';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!this.isValidEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'textarea':
        if (!value) {
          error = 'This field is required';
        } else if (value.length < 10) {
          error = 'Please provide more details (at least 10 characters)';
        } else if (value.length > 5000) {
          error = 'Message is too long (max 5000 characters)';
        }
        break;

      case 'select-one':
        if (!value) {
          error = 'Please select an option';
        }
        break;
    }

    if (error) {
      this.setFieldError(field, error);
      return false;
    } else {
      this.clearFieldError(field);
      return true;
    }
  }

  validateForm() {
    let isValid = true;
    this.errors.clear();

    this.fields.forEach((field) => {
      if (field.name === '_gotcha') return; // Skip honeypot
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  setFieldError(field, message) {
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.setAttribute('role', 'alert');
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errorElement);
    }
    this.errors.set(field.name, message);
  }

  clearFieldError(field) {
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = '';
      field.setAttribute('aria-invalid', 'false');
      field.removeAttribute('aria-describedby');
    }
    this.errors.delete(field.name);
  }

  isValidEmail(email) {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// ============================================================================
// 3. FORM SUBMISSION HANDLING
// ============================================================================
function initFormHandling() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const validator = new FormValidator(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const successMessage = document.getElementById('form-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate form
    if (!validator.validateForm()) {
      // Focus on first error field
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    // Prevent double submission
    if (submitBtn.disabled) return;

    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        // Success
        form.reset();
        validator.fields.forEach((field) => {
          validator.clearFieldError(field);
        });

        // Show success message
        if (successMessage) {
          successMessage.classList.add('visible');
          successMessage.setAttribute('role', 'status');
          successMessage.setAttribute('aria-live', 'polite');

          // Hide after 6 seconds
          setTimeout(() => {
            successMessage.classList.remove('visible');
          }, 6000);
        }

        // Scroll to success message
        successMessage?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Error response
        console.error('Form submission failed:', response.status);
        alert('There was an error submitting your message. Please try again or email us directly at realltechlabs@gmail.com.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Network error. Please check your connection or email us at realltechlabs@gmail.com.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// ============================================================================
// 4. SMOOTH SCROLL BEHAVIOR
// ============================================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return; // Skip empty anchors

    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update browser history
        window.history.pushState(null, null, href);
      }
    });
  });
}

// ============================================================================
// 5. ACTIVE NAVIGATION LINK TRACKING
// ============================================================================
function updateActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === currentPage || 
                     (currentPage === '' && href === '') ||
                     (currentPage === '' && href === 'index.html');

    if (isActive) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

// ============================================================================
// 6. KEYBOARD NAVIGATION & ACCESSIBILITY
// ============================================================================
function initAccessibility() {
  // Skip to main content link already in HTML
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Ensure all interactive elements are keyboard accessible
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
  interactiveElements.forEach((el) => {
    if (!el.getAttribute('tabindex') && el.tagName !== 'BUTTON' && el.tagName !== 'INPUT' && el.tagName !== 'SELECT' && el.tagName !== 'TEXTAREA') {
      if (el.href || el.onclick) {
        el.setAttribute('tabindex', '0');
      }
    }
  });

  // Handle Enter key on buttons
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const target = e.target;
      if (target.role === 'button' && !['BUTTON', 'A', 'INPUT'].includes(target.tagName)) {
        target.click();
      }
    }
  });
}

// ============================================================================
// 7. ARIA LIVE REGION ANNOUNCEMENTS
// ============================================================================
function initAriaLiveRegions() {
  // Announce page changes to screen readers
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const statusRegion = document.querySelector('[role="status"]');
        if (statusRegion && statusRegion.textContent.trim()) {
          // Screen reader will announce changes automatically
        }
      }
    });
  });

  const config = {
    childList: true,
    subtree: true,
  };

  document.body && observer.observe(document.body, config);
}

// ============================================================================
// 8. PERFORMANCE: LAZY LOADING IMAGES
// ============================================================================
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
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

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// ============================================================================
// 9. FOCUS TRAP FOR MODALS (Future use)
// ============================================================================
function createFocusTrap(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  return {
    activate: () => {
      element.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      });
    },
  };
}

// ============================================================================
// 10. INITIALIZATION
// ============================================================================
function init() {
  // Initialize all features
  initCookieConsent();
  initFormHandling();
  initSmoothScroll();
  updateActiveNavLink();
  initAccessibility();
  initAriaLiveRegions();
  initLazyLoading();

  // Handle page visibility
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('Page visible - ready for interaction');
    }
  });

  // Report web vitals (optional, for monitoring)
  if (window.performance && window.performance.measure) {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log('Page load time:', pageLoadTime, 'ms');
    });
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ============================================================================
// 11. SERVICE WORKER REGISTRATION (Optional, for PWA)
// ============================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment to enable service worker
    // navigator.serviceWorker.register('/sw.js').then((reg) => {
    //   console.log('Service Worker registered successfully:', reg);
    // }).catch((err) => {
    //   console.log('Service Worker registration failed:', err);
    // });
  });
}

// ============================================================================
// 12. ERROR HANDLING
// ============================================================================
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send error to monitoring service (optional)
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send error to monitoring service (optional)
});
