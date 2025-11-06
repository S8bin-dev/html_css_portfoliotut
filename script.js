// ========================================
// PORTFOLIO - JAVASCRIPT
// ========================================

// Toggle Menu
function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// ========================================
// DARK MODE TOGGLE
// ========================================
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
  body.classList.add('dark-mode');
}

darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  
  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});

// ========================================
// MODAL FUNCTIONS
// ========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === "Escape") {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (modal.style.display === "block") {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    });
  }
});

// ========================================
// BACK TO TOP BUTTON
// ========================================
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', function() {
  if (window.pageYOffset > 300) {
    backToTopButton.classList.add('show');
  } else {
    backToTopButton.classList.remove('show');
  }
});

backToTopButton.addEventListener('click', function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ========================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', function() {
  const fadeElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
  fadeElements.forEach(el => {
    observer.observe(el);
  });
});

// ========================================
// TYPING EFFECT FOR NAME
// ========================================
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

// ========================================
// CONTACT FORM HANDLING
// ========================================
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Basic validation
    if (name && email && message) {
      // Hide form and show success message
      contactForm.style.display = 'none';
      formSuccess.classList.add('show');
      
      // Here you would normally send the form data to a server
      // For now, we'll just log it
      console.log('Form submitted:', { name, email, message });
      
      // Reset form after 5 seconds
      setTimeout(() => {
        contactForm.reset();
        contactForm.style.display = 'flex';
        formSuccess.classList.remove('show');
      }, 5000);
    }
  });
}

// ========================================
// RIPPLE EFFECT ON BUTTONS
// ========================================
document.querySelectorAll('.ripple').forEach(button => {
  button.addEventListener('click', function(e) {
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
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// ========================================
// PROJECT STATS COUNTER ANIMATION
// ========================================
const statNumbers = document.querySelectorAll('.stat-number');

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = entry.target;
      const finalValue = target.textContent;
      
      // Only animate numbers, not text with %
      if (finalValue.includes('%')) {
        const numValue = parseInt(finalValue);
        animateCounter(target, 0, numValue, 1500, '%');
      } else if (finalValue.includes('+')) {
        const numValue = parseInt(finalValue);
        animateCounter(target, 0, numValue, 1500, '+');
      } else if (finalValue.includes('$')) {
        const numValue = parseInt(finalValue.replace('$', ''));
        animateCounter(target, 0, numValue, 1500, '$', '+');
      }
      
      statsObserver.unobserve(target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
  statsObserver.observe(stat);
});

function animateCounter(element, start, end, duration, suffix = '', prefix = '') {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (end - start) * easeOutQuart);
    
    element.textContent = prefix + current + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = prefix + end + suffix;
    }
  }
  
  requestAnimationFrame(update);
}

// ========================================
// LIGHTBOX GALLERY FUNCTIONALITY
// ========================================
let currentImageIndex = 0;
const galleryImages = [
  {
    src: './assets/1.5 by 1.5 thinfilmholderwithlid.png',
    caption: '1.5" × 1.5" Thin Film Holder with Lid'
  },
  {
    src: './assets/2 by 1 2 by 2thinflmhh.png',
    caption: '2" × 1" and 2" × 2" Thin Film Holders'
  },
  {
    src: './assets/Loadcellcover.png',
    caption: 'Load Cell Protective Cover'
  },
  {
    src: './assets/loadcellmount1.png',
    caption: 'Load Cell Mount - Design 1'
  },
  {
    src: './assets/loadcellmount2.png',
    caption: 'Load Cell Mount - Design 2'
  },
  {
    src: './assets/pipetteholder1.png',
    caption: 'Pipette Holder - Fume Hood Design'
  },
  {
    src: './assets/pipetteholder2.png',
    caption: 'Pipette Holder - Lab Bench Design'
  },
  {
    src: './assets/robosoccerbot.png',
    caption: 'Robo Soccer Bot - Optimized Ball Handler'
  },
  {
    src: './assets/Vileholer.png',
    caption: 'Custom Vial Holder System'
  }
];

function openLightbox(index) {
  currentImageIndex = index;
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  
  lightbox.classList.add('active');
  lightboxImg.src = galleryImages[index].src;
  lightboxCaption.textContent = galleryImages[index].caption;
  lightboxCounter.textContent = `${index + 1} / ${galleryImages.length}`;
  
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function navigateLightbox(direction) {
  currentImageIndex += direction;
  
  // Loop around
  if (currentImageIndex < 0) {
    currentImageIndex = galleryImages.length - 1;
  } else if (currentImageIndex >= galleryImages.length) {
    currentImageIndex = 0;
  }
  
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  
  // Fade out
  lightboxImg.style.opacity = '0';
  
  setTimeout(() => {
    lightboxImg.src = galleryImages[currentImageIndex].src;
    lightboxCaption.textContent = galleryImages[currentImageIndex].caption;
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
    
    // Fade in
    lightboxImg.style.opacity = '1';
  }, 150);
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', function(event) {
  const lightbox = document.getElementById('lightbox');
  
  if (lightbox.classList.contains('active')) {
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      navigateLightbox(-1);
    } else if (event.key === 'ArrowRight') {
      navigateLightbox(1);
    }
  }
});

// ========================================
// CONSOLE MESSAGE (Easter Egg)
// ========================================
console.log('%c👋 Hello Fellow Developer!', 'font-size: 20px; font-weight: bold; color: #2563eb;');
console.log('%c🎨 Like what you see? This portfolio was built with passion and pure vanilla JavaScript!', 'font-size: 14px; color: #666;');
console.log('%c📧 Feel free to reach out: Sabin.Baral@usm.edu', 'font-size: 12px; color: #999;');
console.log('%c🚀 Keep building awesome things!', 'font-size: 12px; font-style: italic; color: #2563eb;');

// ========================================
// PERFORMANCE MONITORING
// ========================================
if ('PerformanceObserver' in window) {
  const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.renderTime || entry.loadTime);
      }
    }
  });
  
  try {
    perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Observer not supported
  }
}

// ========================================
// INITIALIZE ALL FEATURES
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎉 Portfolio fully loaded and initialized!');
  
  // Add smooth reveal to all sections
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.style.opacity = '0';
    setTimeout(() => {
      section.style.transition = 'opacity 0.6s ease';
      section.style.opacity = '1';
    }, index * 100);
  });
});