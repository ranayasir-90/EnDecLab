// Digital Signature Laboratory JavaScript

document.addEventListener('DOMContentLoaded', function() {
  if (!document.body.classList.contains('signature-lab')) return;
  
  // DOM Elements
  const generateKeysButton = document.getElementById('generate-keys');
  const publicKeyTextarea = document.getElementById('public-key');
  const privateKeyTextarea = document.getElementById('private-key');
  const copyPublicButton = document.getElementById('copy-public');
  const copyPrivateButton = document.getElementById('copy-private');
  const signMessageButton = document.getElementById('sign-message');
  const messageToSign = document.getElementById('message-to-sign');
  const signatureOutput = document.getElementById('signature-output');
  const copySignatureButton = document.getElementById('copy-signature');
  const verifySignatureButton = document.getElementById('verify-signature');
  const messageToVerify = document.getElementById('message-to-verify');
  const signatureToVerify = document.getElementById('signature-to-verify');
  const verificationResult = document.getElementById('verification-result');
  
  // Initialize
  setupEventListeners();
  
  function setupEventListeners() {
    // Generate key pair
    generateKeysButton.addEventListener('click', generateKeyPair);
    
    // Copy buttons
    copyPublicButton.addEventListener('click', () => copyToClipboard(publicKeyTextarea));
    copyPrivateButton.addEventListener('click', () => copyToClipboard(privateKeyTextarea));
    copySignatureButton.addEventListener('click', () => copyToClipboard(signatureOutput));
    
    // Sign message
    signMessageButton.addEventListener('click', signMessage);
    
    // Verify signature
    verifySignatureButton.addEventListener('click', verifySignature);
    
    // Enable/disable sign button based on input
    messageToSign.addEventListener('input', function() {
      signMessageButton.disabled = !this.value.trim() || !privateKeyTextarea.value.trim();
    });
    
    privateKeyTextarea.addEventListener('input', function() {
      signMessageButton.disabled = !this.value.trim() || !messageToSign.value.trim();
    });
  }
  
  function generateKeyPair() {
    generateKeysButton.disabled = true;
    generateKeysButton.textContent = 'Generating...';
    
    fetch('/api/generate-keypair', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modulusLength: 2048
      })
    })
    .then(response => response.json())
    .then(data => {
      publicKeyTextarea.value = data.publicKey;
      privateKeyTextarea.value = data.privateKey;
      signMessageButton.disabled = !messageToSign.value.trim();
      
      // Update visualization
      updateVisualization('keygen');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error generating key pair. Please try again.');
    })
    .finally(() => {
      generateKeysButton.disabled = false;
      generateKeysButton.textContent = 'Generate Key Pair';
    });
  }
  
  function signMessage() {
    const message = messageToSign.value.trim();
    const privateKey = privateKeyTextarea.value.trim();
    
    if (!message || !privateKey) return;
    
    signMessageButton.disabled = true;
    signMessageButton.textContent = 'Signing...';
    
    fetch('/api/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        privateKey
      })
    })
    .then(response => response.json())
    .then(data => {
      signatureOutput.value = data.signature;
      
      // Update visualization
      updateVisualization('sign', message, data.signature);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error signing message. Please try again.');
    })
    .finally(() => {
      signMessageButton.disabled = false;
      signMessageButton.textContent = 'Sign Message';
    });
  }
  
  function verifySignature() {
    const message = messageToVerify.value.trim();
    const signature = signatureToVerify.value.trim();
    const publicKey = publicKeyTextarea.value.trim();
    
    if (!message || !signature || !publicKey) {
      alert('Please provide message, signature, and public key for verification.');
      return;
    }
    
    verifySignatureButton.disabled = true;
    verifySignatureButton.textContent = 'Verifying...';
    
    fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        signature,
        publicKey
      })
    })
    .then(response => response.json())
    .then(data => {
      verificationResult.className = 'verification-result ' + (data.isValid ? 'valid' : 'invalid');
      verificationResult.querySelector('.result-text').textContent = 
        data.isValid ? 'Signature is valid!' : 'Signature is invalid!';
      
      // Update visualization
      updateVisualization('verify', message, signature, data.isValid);
    })
    .catch(error => {
      console.error('Error:', error);
      verificationResult.className = 'verification-result invalid';
      verificationResult.querySelector('.result-text').textContent = 'Error during verification';
    })
    .finally(() => {
      verifySignatureButton.disabled = false;
      verifySignatureButton.textContent = 'Verify Signature';
    });
  }
  
  function copyToClipboard(element) {
    if (!element.value.trim()) return;
    
    navigator.clipboard.writeText(element.value)
      .then(() => {
        const originalText = element.previousElementSibling.textContent;
        element.previousElementSibling.textContent = 'Copied!';
        setTimeout(() => {
          element.previousElementSibling.textContent = originalText;
        }, 2000);
      });
  }
  
  function updateVisualization(action, message, signature, isValid) {
    switch (action) {
      case 'keygen':
        document.getElementById('original-message-box').textContent = '';
        document.getElementById('hash-box').textContent = '';
        document.getElementById('signature-box').textContent = '';
        document.getElementById('received-message-box').textContent = '';
        document.getElementById('received-hash-box').textContent = '';
        document.getElementById('decrypted-hash-box').textContent = '';
        document.getElementById('comparison-result-box').textContent = '';
        break;
        
      case 'sign':
        if (message) {
          document.getElementById('original-message-box').textContent = message.substring(0, 20) + (message.length > 20 ? '...' : '');
          
          // Simulate hash
          const hash = sha256(message).substring(0, 16) + '...';
          document.getElementById('hash-box').textContent = hash;
          
          if (signature) {
            document.getElementById('signature-box').textContent = signature.substring(0, 20) + '...';
          }
        }
        break;
        
      case 'verify':
        if (message) {
          document.getElementById('received-message-box').textContent = message.substring(0, 20) + (message.length > 20 ? '...' : '');
          
          // Simulate hash
          const hash = sha256(message).substring(0, 16) + '...';
          document.getElementById('received-hash-box').textContent = hash;
          
          if (signature) {
            // Simulate decrypted hash
            const decryptedHash = sha256(signature).substring(0, 16) + '...';
            document.getElementById('decrypted-hash-box').textContent = decryptedHash;
            
            document.getElementById('comparison-result-box').textContent = 
              isValid ? 'Hashes Match ✓' : 'Hashes Differ ✗';
          }
        }
        break;
    }
  }
  
  // Simple SHA-256 simulation for visualization purposes
  function sha256(input) {
    // In a real implementation, this would use the Web Crypto API
    // This is just for visualization
    const hash = Array.from(input).reduce((hash, char) => {
      const code = char.charCodeAt(0);
      return hash + code.toString(16);
    }, '');
    
    return hash.substring(0, 64); // Return a 64-char string to simulate SHA-256
  }
});