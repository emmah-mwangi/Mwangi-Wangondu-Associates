/**
 * ============================================================================
 * MWANGI WANGONDU & ASSOCIATES - CORE CLIENT SCRIPT (js/site.js)
 * High-performance, Accessible, Zero-dependency Interactions
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounters();
  initScrollReveal();
  initBackToTop();
  initConsultationForm();
  initContactForm();
  initServiceModals();
});

/**
 * 1. Navbar Scroll Transition & Active Page Detection
 */
function initNavbar() {
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Active page indicator
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const currentPath = window.location.pathname.toLowerCase();
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href')?.toLowerCase() || '';
    const cleanHref = href.replace('.html', '').replace(/^\//, '');
    const cleanPath = currentPath.replace('.html', '').replace(/^\//, '');

    if (
      (cleanPath === '' && (cleanHref === 'index' || cleanHref === '')) ||
      (cleanPath !== '' && cleanHref !== '' && (cleanPath.includes(cleanHref) || cleanHref.includes(cleanPath)))
    ) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Close mobile nav when clicking a link
  const navbarCollapse = document.getElementById('navCollapse');
  if (navbarCollapse) {
    const mobileLinks = navbarCollapse.querySelectorAll('.nav-link, .btn');
    mobileLinks.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap?.Collapse?.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          } else {
            navbarCollapse.classList.remove('show');
          }
        }
      });
    });
  }
}

/**
 * 2. Animated Numerical Counters (IntersectionObserver)
 */
function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetStr = el.getAttribute('data-target');
        const target = parseInt(targetStr, 10);

        if (isNaN(target)) {
          obs.unobserve(el);
          return;
        }

        const duration = 1400;
        const startTime = performance.now();

        const updateCount = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(easeOut * target);

          el.textContent = `${currentVal}+`;

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            el.textContent = `${target}+`;
          }
        };

        requestAnimationFrame(updateCount);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.25 });

  statNumbers.forEach(stat => observer.observe(stat));
}

/**
 * 3. Scroll Reveal Animations
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up');
  if (!revealElements.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 4. Back to Top Button
 */
function initBackToTop() {
  let backBtn = document.getElementById('backToTopBtn');
  if (!backBtn) {
    backBtn = document.createElement('button');
    backBtn.id = 'backToTopBtn';
    backBtn.className = 'back-to-top';
    backBtn.setAttribute('type', 'button');
    backBtn.setAttribute('aria-label', 'Back to top of page');
    backBtn.innerHTML = '<i class="bi bi-chevron-up" aria-hidden="true"></i>';
    document.body.appendChild(backBtn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 5. Consultation Form Receiver (Replaces Google Form)
 */
function initConsultationForm() {
  const form = document.getElementById('consultationBookingForm');
  if (!form) return;

  const feedbackBox = document.getElementById('consultationFeedback');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Set min date for preferred date picker to today
  const datePicker = document.getElementById('preferredDate');
  if (datePicker) {
    const today = new Date().toISOString().split('T')[0];
    datePicker.setAttribute('min', today);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const organization = document.getElementById('organization')?.value.trim() || '';
    const sector = document.getElementById('sector')?.value || '';
    const serviceArea = document.getElementById('serviceArea')?.value || '';
    const consultationMode = document.getElementById('consultationMode')?.value || '';
    const preferredDate = document.getElementById('preferredDate')?.value || '';
    const preferredTimeWindow = document.getElementById('preferredTimeWindow')?.value || '';
    const message = document.getElementById('message')?.value.trim() || '';

    // Validation
    if (!fullName) {
      showFeedback(feedbackBox, 'Please enter your Full Name.', 'error');
      document.getElementById('fullName')?.focus();
      return;
    }
    if (!email || !email.includes('@')) {
      showFeedback(feedbackBox, 'Please enter a valid corporate or personal email address.', 'error');
      document.getElementById('email')?.focus();
      return;
    }
    if (!phone || phone.length < 8) {
      showFeedback(feedbackBox, 'Please provide a valid contact telephone number.', 'error');
      document.getElementById('phone')?.focus();
      return;
    }
    if (!serviceArea) {
      showFeedback(feedbackBox, 'Please select the primary service area you require assistance with.', 'error');
      document.getElementById('serviceArea')?.focus();
      return;
    }

    // Set Loading State
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Submitting Booking...
    `;

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          organization,
          sector,
          serviceArea,
          consultationMode,
          preferredDate,
          preferredTimeWindow,
          message
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const ref = result.referenceCode;
        const summary = result.bookingSummary;

        const successHtml = `
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-check-circle-fill fs-4 text-success"></i>
            <strong class="fs-5">Consultation Request Registered Successfully!</strong>
          </div>
          <p class="mb-2">Thank you, <strong>${escapeHtml(summary.fullName)}</strong>. Your request has been securely dispatched to the Mwangi Wangondu & Associates audit & advisory team.</p>
          
          <div class="receipt-box">
            <div class="row g-2">
              <div class="col-sm-6"><strong>Reference Number:</strong> <span class="badge bg-primary text-white">${ref}</span></div>
              <div class="col-sm-6"><strong>Service Area:</strong> ${escapeHtml(summary.serviceArea)}</div>
              <div class="col-sm-6"><strong>Consultation Mode:</strong> ${escapeHtml(summary.consultationMode)}</div>
              <div class="col-sm-6"><strong>Preferred Schedule:</strong> ${escapeHtml(summary.preferredDate)} (${escapeHtml(summary.preferredTimeWindow)})</div>
            </div>
          </div>
          <div class="mt-3 small text-muted">
            <i class="bi bi-info-circle me-1"></i> A Managing Partner or Senior Associate will reach out to you via <strong>${escapeHtml(email)}</strong> or <strong>${escapeHtml(phone)}</strong> to confirm appointment details.
          </div>
        `;

        showFeedback(feedbackBox, successHtml, 'success', true);
        form.reset();
        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const errText = result.error || 'Unable to submit your booking at this moment. Please try again or reach us at +254 723606653.';
        showFeedback(feedbackBox, errText, 'error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      showFeedback(
        feedbackBox,
        'Network error encountered while contacting the server. Please check your connectivity or reach us directly at admin@mwangiandwangonduassociates.com.',
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });
}

/**
 * 6. Contact Form Receiver
 */
function initContactForm() {
  const form = document.getElementById('contactInquiryForm');
  if (!form) return;

  const feedbackBox = document.getElementById('contactFeedback');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const phone = document.getElementById('contactPhone')?.value.trim() || '';
    const subject = document.getElementById('contactSubject')?.value.trim() || 'General Inquiry';
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!fullName) {
      showFeedback(feedbackBox, 'Please enter your Full Name.', 'error');
      document.getElementById('contactName')?.focus();
      return;
    }
    if (!email || !email.includes('@')) {
      showFeedback(feedbackBox, 'Please enter a valid email address.', 'error');
      document.getElementById('contactEmail')?.focus();
      return;
    }
    if (!message || message.length < 5) {
      showFeedback(feedbackBox, 'Please provide a message with at least 5 characters.', 'error');
      document.getElementById('contactMessage')?.focus();
      return;
    }

    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Transmitting Message...
    `;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, phone, subject, message })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const ref = result.referenceCode;
        const successHtml = `
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-check-circle-fill fs-4 text-success"></i>
            <strong class="fs-5">Inquiry Sent Successfully</strong>
          </div>
          <p class="mb-1">Thank you for reaching out to Mwangi Wangondu & Associates.</p>
          <p class="mb-0 small text-muted">Inquiry Reference: <strong>${ref}</strong>. Our team will review your message and reply promptly.</p>
        `;
        showFeedback(feedbackBox, successHtml, 'success', true);
        form.reset();
        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const errText = result.error || 'Failed to submit inquiry. Please call +254 723606653 or email admin@mwangiandwangonduassociates.com.';
        showFeedback(feedbackBox, errText, 'error');
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      showFeedback(
        feedbackBox,
        'A connection error occurred. Please contact admin@mwangiandwangonduassociates.com or call +254 723606653.',
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });
}

/**
 * 7. Service Detail Modals / Interactive Inspection
 */
function initServiceModals() {
  const serviceDetailTriggers = document.querySelectorAll('[data-service-target]');
  if (!serviceDetailTriggers.length) return;

  serviceDetailTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-service-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetSection.classList.add('highlight-section');
        setTimeout(() => targetSection.classList.remove('highlight-section'), 2000);
      }
    });
  });
}

/**
 * Helper: Feedback Display
 */
function showFeedback(container, message, type, isHtml = false) {
  if (!container) return;
  container.className = `form-feedback-box show ${type}`;
  if (isHtml) {
    container.innerHTML = message;
  } else {
    container.textContent = message;
  }
}

/**
 * Helper: Simple HTML Sanitizer for safe DOM insertion
 */
function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
