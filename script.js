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
        if (!value) error = 'This field is required';
        else if (value.length < 2) error = 'Please enter at least 2 characters';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email';
        break;
      case 'textarea':
        if (!value) error = 'This field is required';
        else if (value.length < 10) error = 'Please provide more details';
        break;
      case 'select-one':
        if (!value) error = 'Please select an option';
        break;
    }
    if (error) { this.setFieldError(field, error); return false; }
    this.clearFieldError(field);
    return true;
  }
  validateForm() {
    let isValid = true;
    this.fields.forEach((field) => {
      if (field.name === '_gotcha') return;
      if (!this.validateField(field)) isValid = false;
    });
    return isValid;
  }
  setFieldError(field, message) {
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = message;
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
    if (!validator.validateForm()) {
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
      return;
    }
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        form.reset();
        if (successMessage) {
          successMessage.classList.add('visible');
          setTimeout(() => successMessage.classList.remove('visible'), 6000);
        }
      } else {
        alert('Error submitting. Please email realltechlabs@gmail.com directly.');
      }
    } catch (error) {
      alert('Network error. Please email realltechlabs@gmail.com directly.');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ============================================================================
// 4. TESTIMONIALS CAROUSEL
// ============================================================================
function initTestimonialsCarousel() {
  const carousel = document.getElementById('testimonials-carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track || slides.length === 0) return;
  
  let currentIndex = 0;
  let slidesPerView = getSlidesPerView();
  const totalSlides = slides.length;
  
  function getSlidesPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }
  
  function createDots() {
    dotsContainer.innerHTML = '';
    const totalDots = Math.ceil(totalSlides / slidesPerView);
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i * slidesPerView));
      dotsContainer.appendChild(dot);
    }
  }
  
  function updateCarousel() {
    const slideWidth = 100 / slidesPerView;
    track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    const activeDotIndex = Math.floor(currentIndex / slidesPerView);
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeDotIndex));
  }
  
  function goToSlide(index) {
    const maxIndex = totalSlides - slidesPerView;
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    updateCarousel();
  }
  
  function nextSlide() { goToSlide(currentIndex + 1); }
  function prevSlide() { goToSlide(currentIndex - 1); }
  
  prevBtn?.addEventListener('click', prevSlide);
  nextBtn?.addEventListener('click', nextSlide);
  
  let autoplayInterval = setInterval(nextSlide, 5000);
  carousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  carousel.addEventListener('mouseleave', () => { autoplayInterval = setInterval(nextSlide, 5000); });
  
  window.addEventListener('resize', () => {
    slidesPerView = getSlidesPerView();
    createDots();
    goToSlide(0);
  });
  
  createDots();
  updateCarousel();
}

// ============================================================================
// 5. CHATBOT WIDGET
// ============================================================================
function initChatbot() {
  const widget = document.getElementById('chatbot-widget');
  const toggle = document.getElementById('chatbot-toggle');
  const container = document.getElementById('chatbot-container');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');
  const quickActions = document.querySelectorAll('.quick-action');
  if (!widget || !toggle || !container) return;
  
  let isOpen = false;
  let conversationHistory = [];
  
  function toggleChat() {
    isOpen = !isOpen;
    widget.classList.toggle('open', isOpen);
    container.setAttribute('aria-hidden', !isOpen);
    if (isOpen) input?.focus();
  }
  
  function addMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatbot-message ${isUser ? 'user-message' : 'bot-message'}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    conversationHistory.push({ role: isUser ? 'user' : 'bot', text });
  }
  
  function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    if (msg.includes('quote') || msg.includes('price') || msg.includes('cost')) {
      return "For a custom quote, please share your project details and I'll connect you with our team. You can also <a href='https://calendly.com/realltechlabs/free-consultation' target='_blank'>book a free consultation</a>.";
    }
    if (msg.includes('service')) {
      return "We offer: Software Development, AI Solutions, Transcription & Captioning, Content Moderation, and Freelancing Mentorship. <a href='services.html'>View all services</a>";
    }
    if (msg.includes('call') || msg.includes('schedule') || msg.includes('meeting')) {
      return "Great! <a href='https://calendly.com/realltechlabs/free-consultation' target='_blank'>Book your free 30-minute consultation here</a>.";
    }
    if (msg.includes('contact') || msg.includes('email')) {
      return "Email us at <a href='mailto:realltechlabs@gmail.com'>realltechlabs@gmail.com</a>. We respond within 24 hours!";
    }
    return "Thanks for your message! For detailed inquiries, please <a href='contact.html'>fill out our contact form</a> or email <a href='mailto:realltechlabs@gmail.com'>realltechlabs@gmail.com</a>. We'll get back to you within 24 hours.";
  }
  
  async function sendToFormspree(message) {
    try {
      await fetch('https://formspree.io/f/mzdpqgzv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          message: message,
          source: 'Chatbot Widget',
          conversation: conversationHistory.map(m => `${m.role}: ${m.text}`).join('\n'),
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) { console.log('Message logged locally'); }
  }
  
  function handleSubmit(message) {
    if (!message.trim()) return;
    addMessage(message, true);
    sendToFormspree(message);
    setTimeout(() => addMessage(getBotResponse(message)), 800);
  }
  
  toggle.addEventListener('click', toggleChat);
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(input.value);
    input.value = '';
  });
  quickActions.forEach(btn => {
    btn.addEventListener('click', () => handleSubmit(btn.dataset.message));
  });
}

// ============================================================================
// 6. INITIALIZATION
// ============================================================================
function init() {
  initCookieConsent();
  initFormHandling();
  initTestimonialsCarousel();
  initChatbot();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
