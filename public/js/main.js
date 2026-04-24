// Main JavaScript file for common functionality across all pages

document.addEventListener('DOMContentLoaded', function() {
  // Initialize binary background animation
  initBinaryBackground();
  
  // Set up event listeners for navigation
  setupNavigation();
  
  // Page-specific initializations
  if (document.body.classList.contains('homepage')) {
    initHomepage();
  } else if (document.body.classList.contains('dashboard')) {
    initDashboard();
  } else if (document.body.classList.contains('cipher-lab')) {
    initCipherLab();
  } else if (document.body.classList.contains('signature-lab')) {
    initSignatureLab();
  } else if (document.body.classList.contains('steganography-lab')) { // NEW
    initSteganographyLab(); // NEW
  } else if (document.body.classList.contains('resources')) {
    initResources();
  }

  const hamburger = document.getElementById('hamburger-menu');
  const nav = document.getElementById('main-nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function() {
      nav.classList.toggle('active');
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
    });
  }
});

function initBinaryBackground() {
  const binaryBackground = document.querySelector('.binary-background');
  if (!binaryBackground) return;

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

  setInterval(drawMatrix, 80);

  // Add CSS for glowing and glitchy effect
  const style = document.createElement('style');
  style.textContent = `
    .binary-background {
      background: #0a0a1a !important;
      z-index: -2;
      overflow: hidden;
    }
    .matrix-canvas {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: -1;
      display: block;
    }
    .matrix-glow {
      color: #00bfff;
      text-shadow: 0 0 8px #00bfff, 0 0 16px #00bfff, 0 0 2px #fff;
      animation: glitch 1.2s infinite linear alternate;
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
}

function setupNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.main-nav a');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Highlight Labs dropdown if on any lab page
  const labPaths = ['/cipher-lab', '/signature-lab', '/steganography-lab', '/file-encryption-lab'];
  if (labPaths.includes(currentPath)) {
    const labsDropBtn = document.querySelector('.dropbtn');
    if (labsDropBtn) labsDropBtn.classList.add('active');
  }
}

function initHomepage() {
  // Homepage-specific initializations
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/';
    });
  }
}

function initDashboard() {
  // Dashboard-specific initializations
  const dashboardCards = document.querySelectorAll('.dashboard-card');
  
  dashboardCards.forEach(card => {
    card.addEventListener('click', function() {
      const link = card.querySelector('a');
      if (link) {
        window.location.href = link.getAttribute('href');
      }
    });
  });
}

function initCipherLab() {
  // Cipher lab initializations are in ciphers.js
}

function initSignatureLab() {
  // Signature lab initializations are in signatures.js
}

function initSteganographyLab() { // NEW: Placeholder for Steganography Lab
  // Steganography lab initializations are in steganography.js
  // This function will likely be empty, as steganography.js handles its own DOMContentLoaded
}

function initResources() {
  // Resources page initializations
  const modal = document.getElementById('resource-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  const closeModal = document.querySelector('.close-modal');
  const resourceLinks = document.querySelectorAll('.resource-link');

  // Resource content data
  const resourceData = {
    'caesar': {
      title: 'The Caesar Cipher',
      content: `
        <p>One of the earliest known ciphers, used by Julius Caesar (100-44 BC) for military communications. A type of substitution cipher where each letter is shifted by a fixed number down the alphabet.</p>
        
        <h3>Technical Details:</h3>
        <ul>
            <li><strong>Shift Value (Key):</strong> Typically 3 (A→D, B→E), but any 1-25 works</li>
            <li><strong>Mathematical Formula:</strong> E(x) = (x + n) mod 26</li>
            <li><strong>Weakness:</strong> Vulnerable to brute-force (only 25 possible keys)</li>
        </ul>
        
        <h3>Historical Fact:</h3>
        <p>Caesar reportedly used it with shift 3 to protect messages of military significance.</p>
        
        <div class="example">
            <strong>Example:</strong> "HELLO" → "KHOOR" (shift 3)
        </div>
        
        <p class="highlight">Try it in our <a href="#cipher-lab" style="color: #ff6b6b;">Cipher Lab</a>!</p>
    `
},
'vigenere': {
    title: 'The Vigenère Cipher',
    content: `
        <p>Developed in the 16th century by Blaise de Vigenère, this polyalphabetic cipher was considered "unbreakable" for 300 years until Charles Babbage cracked it in the 19th century.</p>
        
        <h3>How It Works:</h3>
        <ul>
            <li><strong>Keyword-Based:</strong> Each letter of the keyword determines a shift (A=0, B=1, etc.)</li>
            <li><strong>Formula:</strong> C_i = (P_i + K_(i mod len(key))) mod 26</li>
            <li><strong>Security:</strong> Resists frequency analysis (unlike Caesar)</li>
        </ul>
        
        <h3>Famous Use:</h3>
        <p>Confederate forces used a variant during the American Civil War.</p>
        
        <div class="example">
            <strong>Example:</strong> "ATTACKATDAWN" with key "LEMON" → "LXFOPVEFRNHR"
        </div>
        
        <p class="highlight">Experiment with it in our <a href="#cipher-lab" style="color: #ff6b6b;">Cipher Lab</a>!</p>
    `
},
'enigma': {
    title: 'The Enigma Machine',
    content: `
        <p>An electromechanical rotor cipher machine used by Nazi Germany (1920s-1945). Broken by Alan Turing's team at Bletchley Park, shortening WWII by an estimated 2 years.</p>
        
        <h3>Technical Breakdown:</h3>
        <ul>
            <li><strong>Rotors:</strong> 3-5 rotating disks (each permuting letters differently)</li>
            <li><strong>Plugboard:</strong> Added 10+ letter swaps (e.g., A↔Z)</li>
            <li><strong>Key Space:</strong> ~10^114 possible settings (but flawed by message indicators)</li>
        </ul>
        
        <h3>Historical Impact:</h3>
        <p>Ultra intelligence (decrypted Enigma messages) was pivotal in the Battle of the Atlantic.</p>
        
        <div class="example">
            <strong>Fun Fact:</strong> The Polish Cipher Bureau first broke Enigma in 1932 using "bomba" machines.
        </div>
        
        <p class="highlight">Simulate it in our <a href="#enigma-simulator" style="color: #ff6b6b;">Enigma Simulator</a>!</p>
    `
},
'public-key': {
    title: 'Public Key Cryptography',
    content: `
        <p>Revolutionized in 1976 by Diffie-Hellman (later RSA). Uses asymmetric keys: public key encrypts, private key decrypts.</p>
        
        <h3>Core Algorithms:</h3>
        <ul>
            <li><strong>RSA:</strong> Based on integer factorization (p × q = n)</li>
            <li><strong>Elliptic Curve (ECC):</strong> Uses algebraic curves (smaller keys than RSA)</li>
            <li><strong>Diffie-Hellman:</strong> Secure key exchange over public channels</li>
        </ul>
        
        <h3>Real-World Uses:</h3>
        <ul>
            <li>SSL/TLS (HTTPS)</li>
            <li>SSH logins</li>
            <li>PGP email encryption</li>
        </ul>
        
        <div class="example">
            <strong>Example:</strong> Your browser uses RSA to establish secure connections to websites.
        </div>
    `
},
'digital-signatures': {
    title: 'Digital Signatures',
    content: `
        <p>Provides authenticity (sender verification), integrity (no tampering), and non-repudiation (sender can't deny sending).</p>
        
        <h3>How It Works:</h3>
        <ol>
            <li>Sender hashes the message (SHA-256)</li>
            <li>Encrypts the hash with their private key → signature</li>
            <li>Receiver verifies by decrypting with sender's public key</li>
        </ol>
        
        <h3>Common Standards:</h3>
        <ul>
            <li><strong>RSA-PSS:</strong> Probabilistic signature scheme</li>
            <li><strong>ECDSA:</strong> Elliptic Curve variant (used in Bitcoin)</li>
            <li><strong>EdDSA:</strong> Faster than ECDSA (used in TLS 1.3)</li>
        </ul>
        
        <p class="highlight">Try signing a message in our <a href="#signature-lab" style="color: #ff6b6b;">Signature Lab</a>!</p>
    `
},
'hash-functions': {
    title: 'Cryptographic Hash Functions',
    content: `
        <p>Converts arbitrary data to fixed-size output (e.g., SHA-256 → 256 bits). Ideal hashes are irreversible and collision-resistant.</p>
        
        <h3>Properties:</h3>
        <ul>
            <li><strong>Avalanche Effect:</strong> Tiny input change → completely different hash</li>
            <li><strong>Preimage Resistance:</strong> Can't reverse H(x) → x</li>
            <li><strong>Deterministic:</strong> Same input always gives same output</li>
        </ul>
        
        <h3>Common Algorithms:</h3>
        <table class="hash-table">
            <tr><th>Algorithm</th><th>Output Size</th><th>Use Case</th></tr>
            <tr><td>SHA-256</td><td>256-bit</td><td>Bitcoin, TLS</td></tr>
            <tr><td>BLAKE3</td><td>Variable</td><td>High-speed hashing</td></tr>
            <tr><td>MD5</td><td>128-bit</td><td><span style="color:red">Broken (deprecated)</span></td></tr>
        </table>
        
        <p class="highlight">Explore hashing in our <a href="#hash-lab" style="color: #ff6b6b;">Hash Generator</a>!</p>
    `
},
    
    'code-book': {
    title: 'The Code Book by Simon Singh',
    content: `
        <p>A comprehensive history of cryptography from ancient Egypt to quantum cryptography. This book makes complex concepts accessible to everyone.</p>
        <h3>Key topics:</h3>
        <ul>
            <li>Historical ciphers</li>
            <li>Code breaking during wars</li>
            <li>Modern encryption</li>
            <li>Future of cryptography</li>
        </ul>
        <p class="highlight">A must-read for cryptography enthusiasts!</p>
    `
},
'applied-crypto': {
    title: 'Applied Cryptography by Bruce Schneier',
    content: `
        <p>A practical guide to modern cryptographic algorithms and protocols. This book is considered a classic in the field of cryptography.</p>
        <h3>Coverage:</h3>
        <ul>
            <li>Cryptographic algorithms</li>
            <li>Protocols and standards</li>
            <li>Implementation details</li>
            <li>Real-world applications</li>
        </ul>
        <p class="highlight">Essential reading for practitioners!</p>
    `
},
'crypto-engineering': {
    title: 'Cryptography Engineering by Niels Ferguson',
    content: `
        <p>Focuses on the practical aspects of designing and implementing secure systems. Learn how to build cryptographic systems that are both secure and usable.</p>
        <h3>Key aspects:</h3>
        <ul>
            <li>System design</li>
            <li>Implementation security</li>
            <li>Common pitfalls</li>
            <li>Best practices</li>
        </ul>
        <p class="highlight">Master the art of secure system design!</p>
    `
},
'steganography': { // NEW: Steganography Resource
    title: 'Steganography: Hiding in Plain Sight',
    content: `
        <p>Steganography is the art and science of hiding communication in plain sight. Unlike cryptography, which scrambles a message to make it unreadable, steganography conceals the very existence of the message.</p>
        <h3>Least Significant Bit (LSB) Technique:</h3>
        <p>LSB is a common image-based steganography technique. It works by replacing the least significant bit of each pixel's color value (Red, Green, Blue) with bits of the secret message. This change is usually imperceptible to the human eye.</p>
        <h4>How LSB Embedding Works:</h4>
        <ol>
            <li>Convert the secret message into binary data.</li>
            <li>For each bit of the message, take one pixel from the cover image.</li>
            <li>Modify the least significant bit of one of the color channels (e.g., the Blue channel) of that pixel to match the message bit.</li>
            <li>Repeat until all message bits are embedded.</li>
        </ol>
        <h4>How LSB Extraction Works:</h4>
        <ol>
            <li>Read the least significant bit from the chosen color channel of each pixel in the stego image.</li>
            <li>Collect these bits to reconstruct the binary message.</li>
            <li>Convert the binary message back to text.</li>
        </ol>
        <h3>Limitations:</h3>
        <ul>
            <li><strong>Capacity:</strong> Limited by the size of the cover image.</li>
            <li><strong>Fragility:</strong> The hidden message can be easily destroyed by image compression, resizing, or other image manipulations.</li>
            <li><strong>Detectability:</strong> While imperceptible to the human eye, statistical analysis can sometimes detect LSB steganography.</li>
        </ul>
        <p class="highlight">Explore LSB Steganography in our <a href="/steganography-lab" style="color: #ff6b6b;">Steganography Lab</a>!</p>
    `
}
  };

  // Handle resource link clicks
  resourceLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const resourceId = this.dataset.resource;
      const resource = resourceData[resourceId];
      
      if (resource) {
        modalTitle.textContent = resource.title;
        modalContent.innerHTML = resource.content;
        modal.style.display = 'block';
      }
    });
  });

  // Close modal when clicking the close button
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });
}

window.addEventListener('scroll', function() {
  const header = document.querySelector('.main-header');
  if (window.scrollY > 10) {
    header.classList.add('scrolled'); // Adds shadow when scrolled
  } else {
    header.classList.remove('scrolled'); // Removes shadow at top
  }
});