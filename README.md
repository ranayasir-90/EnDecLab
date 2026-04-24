# 🔐 EnDecLab — Interactive Cryptography Learning Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Template%20Engine-orange?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**A full-featured, interactive web platform to learn and experiment with classical & modern cryptographic algorithms.**

[🚀 Live Demo](https://www.endeclab.xyz)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Routes](#️-available-routes)
- [API Endpoints](#-api-endpoints)
- [Performance Optimizations](#-performance-optimizations)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About The Project

**EnDecLab** (Encryption/Decryption Laboratory) is an interactive cryptography learning platform built for students, educators, and security enthusiasts. It provides hands-on experience with a wide range of classical and modern cryptographic techniques — all from the browser, with no setup required for the end user.

Whether you're learning about Caesar Cipher for the first time or exploring RSA digital signatures, EnDecLab gives you an intuitive, real-time environment to experiment and understand.

---

## ✨ Features

### 🔢 Cipher Lab
| Algorithm | Encrypt | Decrypt |
|-----------|---------|---------|
| Caesar Cipher | ✅ | ✅ |
| Rail Fence Cipher | ✅ | ✅ |
| Affine Cipher | ✅ | ✅ |
| Transposition Cipher | ✅ | ✅ |
| One-Time Pad (OTP) | ✅ | ✅ |
| ROT-13 | ✅ | ✅ |

### 🖊️ Signature Lab
- RSA **Key Pair Generation** (2048-bit)
- **Digital Signing** with SHA-256
- **Signature Verification**

### 🖼️ Steganography Lab
- **LSB (Least Significant Bit)** image steganography
- Hide secret messages inside images
- Extract hidden messages from images

### 📁 File Encryption Lab
- Client-side **file encryption & decryption**
- Secure, browser-based processing

### 📚 Additional Pages
- 📖 **Documentation** — Algorithm explanations
- 📦 **Resources** — Learning materials & references
- ❓ **FAQ** — Frequently Asked Questions
- 📊 **Status** — Server/platform status
- 📬 **Contact** — Get in touch

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js v4 |
| **Templating** | EJS (Embedded JavaScript) |
| **Styling** | Vanilla CSS (PurgeCSS optimized) |
| **Security** | Helmet.js (CSP, HSTS, etc.) |
| **Compression** | gzip via `compression` middleware |
| **Dev Server** | Nodemon |
| **Crypto** | Node.js built-in `crypto` module |

---

## 📁 Project Structure

```
EnDecLab-main/
│
├── app.js                    # Main Express server & all API routes
├── package.json              # Project metadata & dependencies
├── purgecss.config.js        # PurgeCSS configuration
├── PERFORMANCE_OPTIMIZATION.md  # Performance notes
│
├── views/                    # EJS templates
│   ├── index.ejs             # Home page
│   ├── cipher-lab.ejs        # Cipher Lab (all classical ciphers)
│   ├── signature-lab.ejs     # Digital Signature Lab
│   ├── steganography-lab.ejs # Steganography Lab
│   ├── file-encryption-lab.ejs  # File Encryption Lab
│   ├── documentation.ejs     # Algorithm documentation
│   ├── resources.ejs         # Learning resources
│   ├── about.ejs             # About page
│   ├── contact.ejs           # Contact page
│   ├── faq.ejs               # FAQ page
│   ├── status.ejs            # Status page
│   ├── privacy.ejs           # Privacy policy
│   ├── terms.ejs             # Terms of service
│   ├── disclaimer.ejs        # Disclaimer
│   ├── layouts/              # Shared layout templates
│   └── partials/             # Reusable EJS partials
│
└── public/                   # Static assets
    ├── css/                  # Stylesheets
    ├── js/                   # Client-side JavaScript
    ├── images/               # WebP optimized images
    ├── robots.txt            # SEO robots file
    └── sitemap.xml           # XML sitemap
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher → [Download](https://nodejs.org)
- **npm** v8 or higher (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/EnDecLab.git

# 2. Navigate to the project directory
cd EnDecLab-main

# 3. Install dependencies
npm install
```

### Running the App

```bash
# Development mode (with auto-restart on file changes)
npm run dev

# Production mode
npm start
```

### Access

Open your browser and visit:

```
http://localhost:3000
```

---

## 🗺️ Available Routes

| Route | Description |
|-------|-------------|
| `GET /` | Home Page |
| `GET /cipher-lab` | Classical Cipher Lab |
| `GET /signature-lab` | Digital Signature Lab |
| `GET /steganography-lab` | Steganography Lab |
| `GET /file-encryption-lab` | File Encryption Lab |
| `GET /documentation` | Algorithm Documentation |
| `GET /resources` | Learning Resources |
| `GET /about` | About the Platform |
| `GET /contact` | Contact Page |
| `GET /faq` | FAQ |
| `GET /status` | Platform Status |
| `GET /privacy` | Privacy Policy |
| `GET /terms` | Terms of Service |
| `GET /disclaimer` | Disclaimer |

---

## 📡 API Endpoints

All API endpoints accept and return **JSON**.

### Cipher APIs

| Method | Endpoint | Body Parameters | Description |
|--------|----------|-----------------|-------------|
| `POST` | `/api/caesar` | `text`, `shift`, `mode` | Caesar cipher |
| `POST` | `/api/railfence` | `text`, `rails`, `mode` | Rail Fence cipher |
| `POST` | `/api/affine` | `text`, `a`, `b`, `mode` | Affine cipher |
| `POST` | `/api/transposition` | `text`, `keys`, `mode` | Columnar Transposition |
| `POST` | `/api/onetimepad` | `text`, `key`, `mode` | One-Time Pad |
| `POST` | `/api/rot13` | `text` | ROT-13 (symmetric) |

> `mode` field accepts: `"encrypt"` or `"decrypt"`

### Signature APIs

| Method | Endpoint | Body Parameters | Description |
|--------|----------|-----------------|-------------|
| `POST` | `/api/generate-keypair` | `modulusLength` (optional, default: 2048) | Generate RSA key pair |
| `POST` | `/api/sign` | `message`, `privateKey` | Sign a message |
| `POST` | `/api/verify` | `message`, `signature`, `publicKey` | Verify a signature |

### Example Request

```bash
curl -X POST http://localhost:3000/api/caesar \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World", "shift": 3, "mode": "encrypt"}'
```

**Response:**
```json
{
  "result": "Khoor Zruog"
}
```

---

## ⚡ Performance Optimizations

This project includes several production-grade performance improvements:

| Optimization | Details |
|---|---|
| 🗜️ **gzip Compression** | All HTTP responses are compressed |
| 🔒 **Helmet Security** | CSP, HSTS, X-Frame-Options headers |
| 📦 **Static Caching** | 1-year cache for CSS, JS, and images |
| 🧹 **PurgeCSS** | Removed ~1,002 unused CSS rules (11.4% smaller) |
| 🖼️ **WebP Images** | ~30% smaller than JPG/PNG |
| 🦥 **Lazy Loading** | Images and non-critical JS loaded on demand |
| ⏩ **Resource Hints** | DNS prefetch & preload for critical assets |

### Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.8s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Speed Index | < 3.4s |
| Cumulative Layout Shift (CLS) | < 0.1 |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

⭐ **If you find this project useful, please give it a star!** ⭐

</div>
