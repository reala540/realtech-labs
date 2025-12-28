// ============================================================================
// REALTECH LABS - PRODUCTION JAVASCRIPT
// Form handling, validation, chatbot, carousel, and interactive features
// ============================================================================

'use strict';

// ============================================================================
// 1. COOKIE CONSENT MANAGEMENT
// ============================================================================
function initCookieConsent() {
  const consentBanner = document.getElementById('cookie-consent');
  const acceptBtn = document.getElementById('cookie-accept');

  if (!consentBanner || !acceptBtn) return;

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
      if (field.name === '_gotcha') return;
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
    }
    this.errors.set(field.name, message);
  }

  clearFieldError(field) {
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = '';
      field.setAttribute('aria-invalid', 'false');
    }
    this.errors.delete(field.name);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// ============================================================================
// 3. CONTACT FORM SUBMISSION
// ============================================================================
function initFormHandling() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const validator = new FormValidator(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const successMessage = document.getElementById('form-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validator.validateForm()) {
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
      return;
    }

    if (submitBtn.disabled) return;

    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        form.reset();
        validator.fields.forEach((field) => validator.clearFieldError(field));

        if (successMessage) {
          successMessage.classList.add('visible');
          successMessage.setAttribute('role', 'status');
          setTimeout(() => successMessage.classList.remove('visible'), 6000);
        }

        successMessage?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
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
// 4. CHATBOT WIDGET
// ============================================================================
function initChatbot() {
  const widget = document.getElementById('chatbot-widget');
  const toggle = document.getElementById('chatbot-toggle');
  const window = document.getElementById('chatbot-window');
  const form = document.getElementById('chatbot-form');
  const success = document.getElementById('chatbot-success');
  const messages = document.getElementById('chatbot-messages');

  if (!widget || !toggle || !window) return;

  // Toggle chatbot window
  toggle.addEventListener('click', () => {
    const isOpen = widget.classList.toggle('open');
    window.setAttribute('aria-hidden', !isOpen);
    
    if (isOpen) {
      const firstInput = form.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && widget.classList.contains('open')) {
      widget.classList.remove('open');
      window.setAttribute('aria-hidden', 'true');
      toggle.focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (widget.classList.contains('open') && 
        !widget.contains(e.target)) {
      widget.classList.remove('open');
      window.setAttribute('aria-hidden', 'true');
    }
  });

  // Handle form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('#chatbot-name');
      const emailInput = form.querySelector('#chatbot-email');
      const messageInput = form.querySelector('#chatbot-message');

      // Basic validation
      if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        return;
      }

      const submitBtn = form.querySelector('.chatbot-send');
      submitBtn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          // Show success message
          form.style.display = 'none';
          messages.style.display = 'none';
          success.style.display = 'block';

          // Reset and show form again after 5 seconds
          setTimeout(() => {
            form.reset();
            form.style.display = 'block';
            messages.style.display = 'block';
            success.style.display = 'none';
            widget.classList.remove('open');
            window.setAttribute('aria-hidden', 'true');
          }, 5000);
        } else {
          alert('Failed to send message. Please try again.');
        }
      } catch (error) {
        console.error('Chatbot form error:', error);
        alert('Network error. Please try again or email us directly.');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
}

// ============================================================================
// 5. TESTIMONIALS CAROUSEL
// ============================================================================
function initTestimonialsCarousel() {
  const carousel = document.getElementById('testimonials-carousel');
  if (!carousel) return;

  const track = document.getElementById('carousel-track');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let isAutoPlaying = true;
  let autoPlayInterval;

  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
    dot.setAttribute('role', 'tab');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
      dot.setAttribute('aria-selected', index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    if (currentIndex < 0) currentIndex = slides.length - 1;
    if (currentIndex >= slides.length) currentIndex = 0;
    updateCarousel();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });

  // Keyboard navigation
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prevSlide(); resetAutoPlay(); }
    if (e.key === 'ArrowRight') { nextSlide(); resetAutoPlay(); }
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetAutoPlay();
    }
  }

  // Auto-play
  function startAutoPlay() {
    if (isAutoPlaying) {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  // Pause on hover
  carousel.addEventListener('mouseenter', () => {
    clearInterval(autoPlayInterval);
  });

  carousel.addEventListener('mouseleave', () => {
    if (isAutoPlaying) startAutoPlay();
  });

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(autoPlayInterval);
    } else if (isAutoPlaying) {
      startAutoPlay();
    }
  });

  // Start auto-play
  startAutoPlay();
}

// ============================================================================
// 6. SMOOTH SCROLL BEHAVIOR
// ============================================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;

    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, null, href);
      }
    });
  });
}

// ============================================================================
// 7. ACTIVE NAVIGATION LINK TRACKING
// ============================================================================
function updateActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === currentPage || 
                     (currentPage === '' && href === '/') ||
                     (currentPage === '' && href === 'index.html') ||
                     (currentPage === 'index.html' && href === '/');

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
// 8. ACCESSIBILITY ENHANCEMENTS
// ============================================================================
function initAccessibility() {
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
// 9. LAZY LOADING IMAGES
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
// 10. INITIALIZATION
// ============================================================================
function init() {
  initCookieConsent();
  initFormHandling();
  initChatbot();
  initTestimonialsCarousel();
  initSmoothScroll();
  updateActiveNavLink();
  initAccessibility();
  initLazyLoading();

  // Log page load time for performance monitoring
  if (window.performance && window.performance.timing) {
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
// 11. ERROR HANDLING
// ============================================================================
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
