const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const compression = require('compression');
const helmet = require('helmet');
const app = express();

// Set view engine to EJS (direct run ke liye sahi path)
app.set('views', path.join(__dirname, 'views'));

// Performance optimizations
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://formspree.io"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files with caching
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (path.endsWith('.webp') || path.endsWith('.png') || path.endsWith('.jpg')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/cipher-lab', (req, res) => {
  res.render('cipher-lab');
});

app.get('/signature-lab', (req, res) => {
  res.render('signature-lab');
});

app.get('/resources', (req, res) => {
  res.render('resources');
});

// NEW: Documentation Page Route
app.get('/documentation', (req, res) => {
  res.render('documentation');
});

// NEW: Steganography Lab Route
app.get('/steganography-lab', (req, res) => {
  res.render('steganography-lab');
});

app.get('/file-encryption-lab', (req, res) => {
  res.render('file-encryption-lab');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/terms', (req, res) => {
  res.render('terms');
});

app.get('/disclaimer', (req, res) => {
  res.render('disclaimer');
});

app.get('/privacy', (req, res) => {
  res.render('privacy');
});

app.get('/status', (req, res) => {
  res.render('status');
});

app.get('/faq', (req, res) => {
  res.render('faq');
});

// API endpoints for cryptographic operations
app.post('/api/caesar', (req, res) => {
  const { text, shift, mode } = req.body;
  let result = '';

  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (char.match(/[a-z]/i)) {
      const code = text.charCodeAt(i);
      let shiftAmount = mode === 'encrypt' ? shift : -shift;

      if (code >= 65 && code <= 90) {
        char = String.fromCharCode(((code - 65 + shiftAmount + 26) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        char = String.fromCharCode(((code - 97 + shiftAmount + 26) % 26) + 97);
      }
    }
    result += char;
  }

  res.json({ result });
});

app.post('/api/railfence', (req, res) => {
  const { text, rails, mode } = req.body;
  let result = '';

  if (mode === 'encrypt') {
    const fence = [];
    for (let i = 0; i < rails; i++) fence.push([]);

    let rail = 0;
    let direction = 1;

    for (let char of text) {
      fence[rail].push(char);
      rail += direction;

      if (rail === rails - 1 || rail === 0) {
        direction = -direction;
      }
    }

    result = fence.flat().join('');
  } else {
    // Decryption
    const pattern = [];
    for (let i = 0; i < rails; i++) pattern.push([]);

    let rail = 0;
    let direction = 1;

    for (let i = 0; i < text.length; i++) {
      pattern[rail].push(i);
      rail += direction;

      if (rail === rails - 1 || rail === 0) {
        direction = -direction;
      }
    }

    const indices = pattern.flat();
    const chars = text.split('');

    for (let i = 0; i < indices.length; i++) {
      result += chars[indices.indexOf(i)];
    }
  }

  res.json({ result });
});

app.post('/api/affine', (req, res) => {
  const { text, a, b, mode } = req.body;
  let result = '';

  // Modular inverse function
  const modInverse = (a, m) => {
    a = (a % m + m) % m;
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return 1;
  };

  const aInt = parseInt(a);
  const bInt = parseInt(b);

  if (mode === 'encrypt') {
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        let x = code >= 65 && code <= 90 ? code - 65 : code - 97;
        let encrypted = (aInt * x + bInt) % 26;
        encrypted += code >= 65 && code <= 90 ? 65 : 97;
        char = String.fromCharCode(encrypted);
      }
      result += char;
    }
  } else {
    const aInv = modInverse(aInt, 26);
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        let y = code >= 65 && code <= 90 ? code - 65 : code - 97;
        let decrypted = (aInv * (y - bInt + 26)) % 26;
        decrypted += code >= 65 && code <= 90 ? 65 : 97;
        char = String.fromCharCode(decrypted);
      }
      result += char;
    }
  }

  res.json({ result });
});

app.post('/api/generate-keypair', (req, res) => {
  const { modulusLength = 2048 } = req.body;
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  res.json({ publicKey, privateKey });
});

app.post('/api/sign', (req, res) => {
  const { message, privateKey } = req.body;
  const signer = crypto.createSign('SHA256');
  signer.update(message);
  signer.end();
  const signature = signer.sign(privateKey, 'base64');
  res.json({ signature });
});

app.post('/api/verify', (req, res) => {
  const { message, signature, publicKey } = req.body;
  const verifier = crypto.createVerify('SHA256');
  verifier.update(message);
  verifier.end();
  const isValid = verifier.verify(publicKey, signature, 'base64');
  res.json({ isValid });
});

app.post('/api/transposition', (req, res) => {
  const { text, keys, mode } = req.body;

  const applyTransposition = (text, keys, encrypt) => {
    if (!text || !keys || keys.length === 0) return '';

    // Sort keys to get the correct order
    const sortedKeys = [...keys].sort((a, b) => a - b);
    const keyLength = keys.length;

    if (encrypt) {
      // Encryption - write by rows, read by columns in key order
      const rows = Math.ceil(text.length / keyLength);
      const grid = Array(rows).fill().map(() => []);

      // Fill grid by rows
      for (let i = 0; i < text.length; i++) {
        const row = Math.floor(i / keyLength);
        grid[row].push(text[i]);
      }

      // Fill empty spaces if needed
      for (let row = 0; row < grid.length; row++) {
        while (grid[row].length < keyLength) {
          grid[row].push('-'); // Padding character
        }
      }

      // Read by columns in key order
      let result = '';
      for (let key of sortedKeys) {
        const colIndex = keys.indexOf(key);
        for (let row = 0; row < rows; row++) {
          result += grid[row][colIndex];
        }
      }

      return result;
    } else {
      // Decryption - write by columns in key order, read by rows
      const rows = Math.ceil(text.length / keyLength);
      const grid = Array(rows).fill().map(() => []);

      // Fill grid by columns in key order
      let index = 0;
      for (let key of sortedKeys) {
        const colIndex = keys.indexOf(key);
        for (let row = 0; row < rows; row++) {
          if (index < text.length) {
            grid[row][colIndex] = text[index++];
          } else {
            grid[row][colIndex] = '-';
          }
        }
      }

      // Read by rows
      let result = '';
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < keyLength; col++) {
          result += grid[row][col];
        }
      }

      return result.replace(/-+$/g, ''); // Remove padding
    }
  };

  const result = applyTransposition(text, keys, mode === 'encrypt');
  res.json({ result });
});

app.post('/api/onetimepad', (req, res) => {
  const { text, key, mode } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Key is required for One-Time Pad' });
  }

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const textChar = text[i].toUpperCase();
    const keyChar = key[i % key.length].toUpperCase();

    if (textChar.match(/[A-Z]/) && keyChar.match(/[A-Z]/)) {
      const textCode = textChar.charCodeAt(0) - 65;
      const keyCode = keyChar.charCodeAt(0) - 65;
      const resultCode = (textCode ^ keyCode) % 26;
      result += String.fromCharCode(resultCode + 65);
    } else {
      result += textChar; // Leave non-alphabetic as is
    }
  }

  res.json({ result });
});

app.post('/api/rot13', (req, res) => {
  const { text } = req.body;

  let result = '';
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (char.match(/[a-z]/i)) {
      const code = text.charCodeAt(i);
      let rotated;

      if (code >= 65 && code <= 90) { // Uppercase
        rotated = ((code - 65 + 13) % 26) + 65;
      } else if (code >= 97 && code <= 122) { // Lowercase
        rotated = ((code - 97 + 13) % 26) + 97;
      }

      char = String.fromCharCode(rotated);
    }
    result += char;
  }

  res.json({ result });
});

// NEW: Steganography API Endpoints (Client-side implementation will handle most logic)
app.post('/api/stego-embed', (req, res) => {
  // For LSB, most of the work is client-side.
  // This endpoint can be used if you need to save the image to the server
  // or perform more complex server-side image processing.
  res.json({ message: 'LSB embedding simulated on server.' });
});

app.post('/api/stego-extract', (req, res) => {
  // Similar to embed, extraction can largely be client-side.
  res.json({ message: 'LSB extraction simulated on server.' });
});

// Remove or comment out any app.listen() call at the end of the file for Vercel compatibility.
app.listen(3000, () => { console.log('Server running on port 3000'); });