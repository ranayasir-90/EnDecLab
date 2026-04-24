// Optimized Main JavaScript - Performance Focused
(function() {
  'use strict';
  
  // Critical functionality only
  const init = () => {
    initBinaryBackground();
    setupNavigation();
    setupMobileMenu();
    setupIntersectionObserver();
    
    // Page-specific init
    const bodyClass = document.body.className;
    if (bodyClass.includes('dashboard')) initDashboard();
    else if (bodyClass.includes('cipher-lab')) initCipherLab();
    else if (bodyClass.includes('signature-lab')) initSignatureLab();
    else if (bodyClass.includes('steganography-lab')) initSteganographyLab();
    else if (bodyClass.includes('resources')) initResources();
  };

  // Optimized navigation setup
  const setupNavigation = () => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    const labPaths = ['/cipher-lab', '/signature-lab', '/steganography-lab', '/file-encryption-lab'];
    
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === currentPath);
    });
    
    if (labPaths.includes(currentPath)) {
      const labsDropBtn = document.querySelector('.dropbtn');
      if (labsDropBtn) labsDropBtn.classList.add('active');
    }
  };

  // Optimized mobile menu
  const setupMobileMenu = () => {
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('main-nav');
    
    console.log('Setting up mobile menu...');
    console.log('Hamburger element:', hamburger);
    console.log('Nav element:', nav);
    
    if (hamburger && nav) {
      console.log('Both elements found, adding event listener...');
      hamburger.addEventListener('click', () => {
        console.log('Hamburger clicked!');
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        console.log('Current expanded state:', isExpanded);
        hamburger.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('active');
        console.log('Nav active class toggled. Current classes:', nav.className);
      });
      console.log('Event listener added successfully');
    } else {
      console.error('Mobile menu setup failed: hamburger or nav element not found');
    }
  };

  // Binary background animation
  const initBinaryBackground = () => {
    const binaryBackground = document.querySelector('.binary-background');
    if (!binaryBackground) {
      console.log('Binary background element not found');
      return;
    }
    
    console.log('Binary background found, initializing animation...');

    // Set dark background
    binaryBackground.style.background = '#0a0a1a';
    binaryBackground.innerHTML = '';

    // Matrix rain parameters
    const columns = Math.floor(window.innerWidth / 22);
    const drops = Array(columns).fill(1);

    // Add canvas for smooth animation
    let canvas = document.createElement('canvas');
    canvas.className = 'matrix-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    binaryBackground.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    
    console.log('Canvas created with dimensions:', canvas.width, 'x', canvas.height);

    // Matrix characters
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    function drawMatrix() {
      // Black BG with slight opacity for trailing effect
      ctx.fillStyle = 'rgba(10,10,26,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '18px "Roboto Mono", monospace';
      for (let i = 0; i < drops.length; i++) {
        // Glitch: randomize char, sometimes blank
        let char = Math.random() > 0.05 ? matrixChars[Math.floor(Math.random() * matrixChars.length)] : '';
        ctx.shadowColor = '#00bfff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#00bfff';
        ctx.globalAlpha = 0.88 + Math.random() * 0.12;
        ctx.fillText(char, i * 22, drops[i] * 22);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        // Glitch: sometimes jump drop
        if (Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
        if (drops[i] * 22 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      }
    }
    
    console.log('Starting matrix animation...');

    setInterval(drawMatrix, 80);

    // Add CSS for glowing and glitchy effect
    const style = document.createElement('style');
    style.textContent = `
      .binary-background {
        background: #0a0a1a !important;
        z-index: -2 !important;
        overflow: hidden !important;
        opacity: 1 !important;
      }
      .matrix-canvas {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: -1 !important;
        display: block !important;
      }
      .matrix-glow {
        color: #00bfff !important;
        text-shadow: 0 0 8px #00bfff, 0 0 16px #00bfff, 0 0 2px #fff !important;
        animation: glitch 1.2s infinite linear alternate !important;
      }
      @keyframes glitch {
        0% { filter: blur(0.5px) brightness(1.1); }
        10% { filter: blur(1.5px) brightness(1.2); transform: translateX(-1px); }
        20% { filter: blur(0.5px) brightness(1.1); transform: translateX(1px); }
        30% { filter: blur(1.5px) brightness(1.2); }
        40% { filter: blur(0.5px) brightness(1.1); }
        100% { filter: blur(0.5px) brightness(1.1); }
      }
    `;
    document.head.appendChild(style);
  };

  // Optimized intersection observer
  const setupIntersectionObserver = () => {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    // Observe all animatable elements
    const animatableElements = document.querySelectorAll(
      '.dashboard-card, .why-point, .feature-mini, .creator-card, .cipher-card-modern, .signature-card, .steg-card, .file-card'
    );
    
    animatableElements.forEach(el => observer.observe(el));
  };

  // Page-specific initializations
  const initDashboard = () => {
    // Lazy load testimonial slider
    const testimonialSlider = document.getElementById('testimonial-slider');
    if (testimonialSlider) {
      setTimeout(() => {
        initTestimonialSlider();
      }, 100);
    }
  };

  const initCipherLab = () => {
    // Cipher lab functionality is in ciphers.js
    // This is just a placeholder
  };

  const initSignatureLab = () => {
    // Signature lab functionality is in signatures.js
    // This is just a placeholder
  };

  const initSteganographyLab = () => {
    // Steganography lab functionality is in steganography.js
    // This is just a placeholder
  };

  const initResources = () => {
    // Lazy load resource modal
    const resourceLinks = document.querySelectorAll('.resource-link');
    if (resourceLinks.length > 0) {
      setTimeout(() => {
        initResourceModal();
      }, 200);
    }
  };

  // Lazy loaded testimonial slider
  const initTestimonialSlider = () => {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    
    if (!slides.length) return;
    
    let current = 0;
    let autoSlideInterval = null;
    
    const showSlide = (idx) => {
      slides.forEach((slide, i) => {
        slide.style.display = i === idx ? 'block' : 'none';
        slide.style.opacity = i === idx ? '1' : '0';
      });
      
      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
          const dot = document.createElement('span');
          dot.style.cssText = `
            display: inline-block;
            width: 10px;
            height: 10px;
            margin: 0 5px;
            border-radius: 50%;
            background: ${i === idx ? 'var(--primary-color)' : 'var(--dark-text)'};
            cursor: pointer;
          `;
          dot.onclick = () => { current = i; showSlide(current); startAutoSlide(); };
          dotsContainer.appendChild(dot);
        });
      }
    };
    
    const startAutoSlide = () => {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(() => {
        current = (current + 1) % slides.length;
        showSlide(current);
      }, 5000);
    };
    
    if (prevBtn) {
      prevBtn.onclick = () => {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
        startAutoSlide();
      };
    }
    
    if (nextBtn) {
      nextBtn.onclick = () => {
        current = (current + 1) % slides.length;
        showSlide(current);
        startAutoSlide();
      };
    }
    
    showSlide(0);
    startAutoSlide();
  };

  // Lazy loaded resource modal
  const initResourceModal = () => {
    const modal = document.getElementById('resource-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.querySelector('.close-modal');
    const resourceLinks = document.querySelectorAll('.resource-link');
    
    if (!modal || !resourceLinks.length) return;
    
    const resourceData = {
      'caesar': {
        title: 'The Caesar Cipher',
        content: '<p>One of the earliest known ciphers, used by Julius Caesar...</p>'
      },
      'vigenere': {
        title: 'The Vigenère Cipher',
        content: '<p>A polyalphabetic substitution cipher that uses a keyword...</p>'
      }
      // Add more resource data as needed
    };
    
    resourceLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const resourceType = link.getAttribute('data-resource');
        const data = resourceData[resourceType];
        
        if (data) {
          modalTitle.textContent = data.title;
          modalContent.innerHTML = data.content;
          modal.style.display = 'flex';
        }
      });
    });
    
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 