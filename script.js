
// ========================================
// PORTFOLIO - JAVASCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initNavigation();
  initScrollEffects();
  initTypingEffect();
  initContactForm();
  initRippleEffect();
  initProjectStats();
  initLightbox();

  // Reveal sections
  revealSections();

  console.log('🎉 Portfolio fully loaded and initialized!');
});


// ========================================
// DARK MODE
// ========================================
function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;

  const savedMode = localStorage.getItem('darkMode');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Enable dark mode if saved as 'enabled' OR (not saved AND system prefers dark)
  if (savedMode === 'enabled' || (!savedMode && systemPrefersDark)) {
    body.classList.add('dark-mode');
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
      } else {
        localStorage.setItem('darkMode', 'disabled');
      }
    });
  }
}

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
  // Hamburger Menu
  window.toggleMenu = function () {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
  };
}

// ========================================
// SCROLL EFFECTS
// ========================================
function initScrollEffects() {
  // Back to Top
  const backToTopButton = document.getElementById('backToTop');
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Intersection Observer for Fade In
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.style.animation = 'none'; // Stop CSS animation to allow manual control if needed
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
  fadeElements.forEach(el => observer.observe(el));
}

// ========================================
// TYPING EFFECT
// ========================================
function initTypingEffect() {
  const titleElement = document.querySelector('.typing-effect');
  if (titleElement) {
    const text = titleElement.textContent;
    titleElement.textContent = '';
    titleElement.style.opacity = '1';

    let i = 0;
    function typeWriter() {
      if (i < text.length) {
        titleElement.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      }
    }
    setTimeout(typeWriter, 500);
  }
}

// ========================================
// CONTACT FORM
// ========================================
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://formspree.io/f/xqarlrdl', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          contactForm.style.display = 'none';
          if (formSuccess) formSuccess.classList.add('show');
          contactForm.reset();

          // Reset form view after delay
          setTimeout(() => {
            contactForm.style.display = 'flex';
            if (formSuccess) formSuccess.classList.remove('show');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
          }, 5000);
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Oops! There was a problem submitting your form. Please try again or email me directly.');
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }
}

// ========================================
// RIPPLE EFFECT
// ========================================
function initRippleEffect() {
  document.querySelectorAll('.ripple').forEach(button => {
    button.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple-effect');

      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ========================================
// PROJECT STATS
// ========================================
function initProjectStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const finalValue = target.textContent;

        if (finalValue.includes('%')) {
          animateCounter(target, 0, parseInt(finalValue), 1500, '%');
        } else if (finalValue.includes('+')) {
          animateCounter(target, 0, parseInt(finalValue), 1500, '+');
        } else if (finalValue.includes('$')) {
          animateCounter(target, 0, parseInt(finalValue.replace('$', '')), 1500, '$', '+');
        }
        statsObserver.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => statsObserver.observe(stat));
}

function animateCounter(element, start, end, duration, suffix = '', prefix = '') {
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (end - start) * easeOutQuart);
    element.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else element.textContent = prefix + end + suffix;
  }
  requestAnimationFrame(update);
}

// ========================================
// LIGHTBOX GALLERY
// ========================================
function initLightbox() {
  // Expose functions to global scope for onclick handlers
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  };

  // Close modal when clicking outside
  window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = "none";
      document.body.style.overflow = "auto";
    }
  };

  // Escape key for modals
  document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll('.modal').forEach(modal => {
        if (modal.style.display === "block") {
          modal.style.display = "none";
          document.body.style.overflow = "auto";
        }
      });
      closeLightbox();
    }
  });

  // Gallery Data
  const galleryImages = [
    { src: './assets/1.5 by 1.5 thinfilmholderwithlid.png', caption: '1.5" × 1.5" Thin Film Holder with Lid' },
    { src: './assets/2 by 1 2 by 2thinflmhh.png', caption: '2" × 1" and 2" × 2" Thin Film Holders' },
    { src: './assets/Loadcellcover.png', caption: 'Load Cell Protective Cover' },
    { src: './assets/loadcellmount1.png', caption: 'Load Cell Mount - Design 1' },
    { src: './assets/loadcellmount2.png', caption: 'Load Cell Mount - Design 2' },
    { src: './assets/pipetteholder1.png', caption: 'Pipette Holder - Fume Hood Design' },
    { src: './assets/pipetteholder2.png', caption: 'Pipette Holder - Lab Bench Design' },
    { src: './assets/robosoccerbot.png', caption: 'Robo Soccer Bot - Optimized Ball Handler' },
    { src: './assets/Vileholer.png', caption: 'Custom Vial Holder System' }
  ];

  let currentImageIndex = 0;

  window.openLightbox = function (index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');

    if (lightbox && lightboxImg) {
      lightbox.classList.add('active');
      lightboxImg.src = galleryImages[index].src;
      lightboxCaption.textContent = galleryImages[index].caption;
      lightboxCounter.textContent = `${index + 1} / ${galleryImages.length}`;
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeLightbox = function () {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  };

  window.navigateLightbox = function (direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = galleryImages.length - 1;
    else if (currentImageIndex >= galleryImages.length) currentImageIndex = 0;

    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');

    if (lightboxImg) {
      lightboxImg.style.opacity = '0';
      setTimeout(() => {
        lightboxImg.src = galleryImages[currentImageIndex].src;
        lightboxCaption.textContent = galleryImages[currentImageIndex].caption;
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
        lightboxImg.style.opacity = '1';
      }, 150);
    }
  };

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (event) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
      if (event.key === 'ArrowLeft') window.navigateLightbox(-1);
      else if (event.key === 'ArrowRight') window.navigateLightbox(1);
    }
  });
}

function revealSections() {
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.style.opacity = '0';
    setTimeout(() => {
      section.style.transition = 'opacity 0.6s ease';
      section.style.opacity = '1';
    }, index * 100);
  });
}