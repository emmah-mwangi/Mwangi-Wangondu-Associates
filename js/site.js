// js/site.js
// Global site JavaScript for Mwangi Wangondu & Associates
// Features: navbar scroll state, active nav, counters, back-to-top, reveal animations, form validation

document.addEventListener('DOMContentLoaded', function () {
  // Navbar: add solid background on scroll
  function initNavbar() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    const scrolledClass = 'navbar-scrolled';
    function onScroll() {
      if (window.scrollY > 40) nav.classList.add(scrolledClass);
      else nav.classList.remove(scrolledClass);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Active nav item by filename
  function initActiveNav() {
    const links = document.querySelectorAll('.navbar-nav .nav-link');
    if (!links.length) return;
    const path = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.endsWith(path) || (href === 'index.html' && path === '')) {
        link.classList.add('active');
      }
    });
  }

  // Back to top
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    function onScroll() {
      if (window.scrollY > 500) btn.style.display = 'block';
      else btn.style.display = 'none';
    }
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Intersection Observer reveal animations
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
  }

  // Animated counters (runs once when visible)
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;
    const speed = 2000; // duration ms
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target')) || 0;
        if (isNaN(target) || target === 0) {
          el.textContent = el.getAttribute('data-target') || '—';
          obs.unobserve(el);
          return;
        }
        let start = 0;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / speed, 1);
          el.textContent = Math.floor(progress * target);
          if (progress < 1) window.requestAnimationFrame(step);
          else el.textContent = target;
        };
        window.requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });
    counters.forEach(c => observer.observe(c));
  }

  // Simple form validation for pages that include forms
  function initForms() {
    // contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = contactForm.querySelector('#name');
        const email = contactForm.querySelector('#email');
        const message = contactForm.querySelector('#message');
        let valid = true;
        [name, email, message].forEach(field => {
          if (!field) return;
          field.classList.remove('is-invalid');
          const errorId = field.getAttribute('aria-describedby');
          if (errorId) {
            const err = document.getElementById(errorId);
            if (err) err.textContent = '';
          }
        });
        if (!name.value.trim()) { valid = false; name.classList.add('is-invalid'); }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { valid = false; email.classList.add('is-invalid'); }
        if (!message.value.trim() || message.value.trim().length < 10) { valid = false; message.classList.add('is-invalid'); }
        if (!valid) return;
        // No backend configured: show client-side success and reset (explicit messaging)
        const status = document.getElementById('contactStatus');
        if (status) {
          status.classList.remove('d-none', 'alert-danger');
          status.classList.add('alert-success');
          status.textContent = 'This is a frontend demo: your message was validated but not sent. To enable submissions, provide a backend endpoint or a third-party form service.';
        }
        contactForm.reset();
      });
    }

    // consultation booking form demo if present (pages link to Google Form anyway)
    const consultForm = document.getElementById('consultationForm');
    if (consultForm) {
      consultForm.addEventListener('submit', function (e) {
        e.preventDefault();
        // Redirect to Google Form link if button has data-url
        const submitBtn = consultForm.querySelector('button[type="submit"]');
        const gf = submitBtn && submitBtn.getAttribute('data-gf');
        if (gf) window.open(gf, '_blank');
      });
    }
  }

  // Initialize features
  initNavbar();
  initActiveNav();
  initBackToTop();
  initReveal();
  initCounters();
  initForms();
});
