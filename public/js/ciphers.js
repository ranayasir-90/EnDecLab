// Cipher Laboratory JavaScript

document.addEventListener('DOMContentLoaded', function() {
  if (!document.body.classList.contains('cipher-lab')) return;
  
  // DOM Elements
  const cipherTabs = document.querySelectorAll('.cipher-tab');
  const cipherParams = document.querySelectorAll('.cipher-params');
  const cipherInput = document.getElementById('cipher-input');
  const executeButton = document.getElementById('execute-cipher');
  const cipherResult = document.getElementById('cipher-result');
  const modeButtons = document.querySelectorAll('.mode-button');
  const copyButton = document.getElementById('copy-output');
  const clearButton = document.getElementById('clear-all');
  const caesarShift = document.getElementById('caesar-shift');
  const caesarShiftValue = document.getElementById('caesar-shift-value');
  
  // Current state
  let currentCipher = 'caesar';
  let currentMode = 'encrypt';
  
  // Initialize
  setupEventListeners();
  updateVisualization();
  
  function setupEventListeners() {
    // Cipher tab switching
    cipherTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        cipherTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentCipher = this.dataset.cipher;
        
        // Update parameters display
        cipherParams.forEach(param => {
          param.style.display = param.id === `${currentCipher}-params` ? 'block' : 'none';
        });
        
        // Update visualization display
        document.querySelectorAll('.visualization-content').forEach(viz => {
          viz.style.display = viz.id === `${currentCipher}-visualization` ? 'block' : 'none';
        });
        
        // Update cipher info
        document.querySelectorAll('.info-content').forEach(info => {
          info.style.display = info.id === `${currentCipher}-info` ? 'block' : 'none';
        });
        
        // Update current cipher name
        document.querySelectorAll('#current-cipher-name').forEach(el => {
          el.textContent = this.textContent + ' Cipher';
        });
        
        updateVisualization();
      });
    });
    
    // Mode switching
    modeButtons.forEach(button => {
      button.addEventListener('click', function() {
        modeButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentMode = this.dataset.mode;
        
        // Update Affine cipher formula display
        const encryptFormula = document.getElementById('affine-encrypt-formula');
        const decryptFormula = document.getElementById('affine-decrypt-formula');
        if (encryptFormula && decryptFormula) {
          encryptFormula.style.display = currentMode === 'encrypt' ? 'block' : 'none';
          decryptFormula.style.display = currentMode === 'decrypt' ? 'block' : 'none';
        }
        
        updateVisualization();
      });
    });
    
    // Caesar shift slider
    if (caesarShift && caesarShiftValue) {
      caesarShift.addEventListener('input', function() {
        caesarShiftValue.textContent = this.value;
        updateVisualization();
      });
    }
    
    // Execute cipher
    executeButton.addEventListener('click', executeCipher);
    
    // Copy result
    copyButton.addEventListener('click', function() {
      if (cipherResult.textContent.trim()) {
        navigator.clipboard.writeText(cipherResult.textContent)
          .then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 2000);
          });
      }
    });
    
    // Clear all
    clearButton.addEventListener('click', function() {
      cipherInput.value = '';
      cipherResult.textContent = '';
    });
    
    // Real-time updates for certain ciphers
    cipherInput.addEventListener('input', function() {
      if (currentCipher === 'caesar' || currentCipher === 'railfence') {
        updateVisualization();
      }
    });
  }
  
  function executeCipher() {
    const text = cipherInput.value.trim();
    if (!text) return;
    
    let params = {};
    let result = '';
    
    switch (currentCipher) {
      case 'caesar':
        params.shift = parseInt(caesarShift.value);
        break;
      case 'railfence':
        params.rails = parseInt(document.getElementById('railfence-rails').value);
        break;
      case 'affine':
        params.a = parseInt(document.getElementById('affine-a').value);
        params.b = parseInt(document.getElementById('affine-b').value);
        break;
      case 'transposition':
        const keysInput = document.getElementById('transposition-keys').value;
        const keys = keysInput.split(',').map(k => parseInt(k.trim())).filter(k => !isNaN(k));
        if (keys.length === 0) {
          alert('Please enter valid keys (numbers separated by commas)');
          return;
        }
        result = applyTranspositionCipher(text, keys, currentMode === 'encrypt');
        cipherResult.textContent = result;
        updateVisualization();
        return;
      case 'onetimepad':
        params.key = document.getElementById('otp-key').value.toUpperCase().replace(/[^A-Z]/g, '');
        if (!params.key) {
          alert('Please enter a key for One-Time Pad (letters only)');
          return;
        }
        result = applyOneTimePad(text, params.key, currentMode === 'encrypt');
        cipherResult.textContent = result;
        updateVisualization();
        return;
      case 'rot13':
        result = applyROT13(text);
        cipherResult.textContent = result;
        updateVisualization();
        return;
    }
    
    params.mode = currentMode;
    
    fetch(`/api/${currentCipher}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        ...params
      })
    })
    .then(response => response.json())
    .then(data => {
      cipherResult.textContent = data.result;
      updateVisualization();
    })
    .catch(error => {
      console.error('Error:', error);
      cipherResult.textContent = 'Error processing cipher. Please try again.';
    });
  }
  
  function updateVisualization() {
    const text = cipherInput.value.trim();
    
    // Update parameters display
    document.getElementById('visual-shift-value').textContent = caesarShift.value;
    document.getElementById('visual-rail-count').textContent = 
      document.getElementById('railfence-rails').value;
    document.getElementById('visual-column-count').textContent = 
      document.getElementById('transposition-keys').value;
    document.getElementById('visual-a-value').textContent = 
      document.getElementById('affine-a').value;
    document.getElementById('visual-b-value').textContent = 
      document.getElementById('affine-b').value;
    document.getElementById('visual-otp-key').textContent = 
      document.getElementById('otp-key').value || 'Not specified';

    if (text) {
      switch (currentCipher) {
        case 'caesar':
          updateCaesarVisualization(text);
          break;
        case 'railfence':
          updateRailFenceVisualization(text);
          break;
        case 'transposition':
          updateTranspositionVisualization(text);
          break;
        case 'affine':
          updateAffineVisualization(text);
          break;
        case 'onetimepad':
          updateOTPVisualization(text);
          break;
        case 'rot13':
          updateROT13Visualization(text);
          break;
      }
    } else {
      clearAllVisualizations();
    }
  }
  
  function clearAllVisualizations() {
    const containers = [
      'caesar-letter-grid', 'caesar-final-result',
      'railfence-pattern', 'railfence-final-result',
      'transposition-grid', 'transposition-final-result',
      'affine-transformation', 'affine-final-result',
      'otp-operation', 'otp-final-result',
      'rot13-transformation', 'rot13-final-result'
    ];
    
    containers.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<p class="no-data">Enter text to see transformation steps</p>';
    });
  }
  
  function updateCaesarVisualization(text) {
    const shift = parseInt(caesarShift.value);
    const encrypt = currentMode === 'encrypt';
    const grid = document.getElementById('caesar-letter-grid');
    const resultBox = document.getElementById('caesar-final-result');
    
    let gridHTML = '<div class="letter-row header">';
    gridHTML += '<div>Original</div><div>Operation</div><div>Result</div></div>';
    
    let result = '';
    
    for (let i = 0; i < Math.min(text.length, 20); i++) {
      const char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        const isUpper = code >= 65 && code <= 90;
        const base = isUpper ? 65 : 97;
        const originalPos = code - base;
        const newPos = (originalPos + (encrypt ? shift : -shift) % 26 + 26) % 26;
        const newChar = String.fromCharCode(newPos + base);
        
        gridHTML += `<div class="letter-row">`;
        gridHTML += `<div class="letter-box">${char}</div>`;
        gridHTML += `<div class="op-box">${encrypt ? '+' : '-'}${shift} → ${newChar}</div>`;
        gridHTML += `<div class="letter-box result">${newChar}</div>`;
        gridHTML += `</div>`;
        
        result += newChar;
      } else {
        gridHTML += `<div class="letter-row non-letter">${char} (not shifted)</div>`;
        result += char;
      }
    }
    
    if (text.length > 20) {
      gridHTML += `<div class="letter-row more">... and ${text.length - 20} more characters</div>`;
    }
    
    grid.innerHTML = gridHTML;
    resultBox.innerHTML = `<div class="final-text">${result}</div>`;
  }
  
  function updateRailFenceVisualization(text) {
    const rails = parseInt(document.getElementById('railfence-rails').value);
    const pattern = document.getElementById('railfence-pattern');
    const resultBox = document.getElementById('railfence-final-result');
    const encrypt = currentMode === 'encrypt';
    
    // Build the zigzag grid (2D array)
    let grid = Array.from({ length: rails }, () => Array(text.length).fill(''));
    let result = '';
    let patternHTML = '';
    
    if (encrypt) {
        // Fill grid for encryption
        let rail = 0, direction = 1;
        for (let i = 0; i < text.length; i++) {
            grid[rail][i] = text[i];
            rail += direction;
            if (rail === 0 || rail === rails - 1) direction = -direction;
        }
        // Visualization (same as before)
        patternHTML += '<div class="railfence-header">Writing in zigzag pattern:</div>';
        patternHTML += '<div class="railfence-matrix">';
        for (let r = 0; r < rails; r++) {
            patternHTML += '<div class="railfence-row">';
            for (let c = 0; c < text.length; c++) {
                const char = grid[r][c];
                const cellClass = char ? 'railfence-cell active' : 'railfence-cell';
                patternHTML += `<div class="${cellClass}">${char ? char : ''}</div>`;
            }
            patternHTML += '</div>';
        }
        patternHTML += '</div>';
        // Show reading process (row by row)
        patternHTML += '<div class="railfence-header">Reading row by row:</div>';
        patternHTML += '<div class="railfence-reading">';
        for (let r = 0; r < rails; r++) {
            patternHTML += '<div class="railfence-reading-row">';
            patternHTML += `<div class="railfence-reading-label">Rail ${r + 1}:</div>`;
            patternHTML += '<div class="railfence-reading-content">';
            for (let c = 0; c < text.length; c++) {
                if (grid[r][c]) {
                    patternHTML += `<div class="railfence-reading-cell">${grid[r][c]}</div>`;
                    result += grid[r][c];
                }
            }
            patternHTML += '</div></div>';
        }
        patternHTML += '</div>';
    } else {
        // Decryption: First, mark zigzag positions, then fill them row by row from ciphertext
        // Step 1: Mark zigzag positions with placeholders
        let markGrid = Array.from({ length: rails }, () => Array(text.length).fill(''));
        let rail = 0, direction = 1;
        for (let i = 0; i < text.length; i++) {
            markGrid[rail][i] = '?';
            rail += direction;
            if (rail === 0 || rail === rails - 1) direction = -direction;
        }
        // Step 2: Fill placeholders with ciphertext row by row
        let idx = 0;
        for (let r = 0; r < rails; r++) {
            for (let c = 0; c < text.length; c++) {
                if (markGrid[r][c] === '?' && idx < text.length) {
                    markGrid[r][c] = text[idx++];
                }
            }
        }
        // Visualization
        patternHTML += '<div class="railfence-header">Reconstructing zigzag pattern:</div>';
        patternHTML += '<div class="railfence-matrix">';
        for (let r = 0; r < rails; r++) {
            patternHTML += '<div class="railfence-row">';
            for (let c = 0; c < text.length; c++) {
                const char = markGrid[r][c];
                const cellClass = char ? 'railfence-cell active' : 'railfence-cell';
                patternHTML += `<div class="${cellClass}">${char ? char : ''}</div>`;
            }
            patternHTML += '</div>';
        }
        patternHTML += '</div>';
        // Show reading process (zigzag)
        patternHTML += '<div class="railfence-header">Reading in zigzag order:</div>';
        patternHTML += '<div class="railfence-reading">';
        rail = 0; direction = 1;
        for (let i = 0; i < text.length; i++) {
            if (markGrid[rail][i]) {
                patternHTML += `<div class="railfence-reading-cell">${markGrid[rail][i]}</div>`;
                result += markGrid[rail][i];
            }
            rail += direction;
            if (rail === 0 || rail === rails - 1) direction = -direction;
        }
        patternHTML += '</div>';
    }
    pattern.innerHTML = patternHTML;
    resultBox.innerHTML = `<div class="final-text">${result}</div>`;
  }
  
  function updateTranspositionVisualization(text) {
    const keysInput = document.getElementById('transposition-keys').value;
    const keys = keysInput.split(',').map(k => parseInt(k.trim())).filter(k => !isNaN(k));
    if (keys.length === 0) return;
    
    const encrypt = currentMode === 'encrypt';
    const grid = document.getElementById('transposition-grid');
    const resultBox = document.getElementById('transposition-final-result');
    
    // Update mode indicators
    document.querySelectorAll('#transposition-visualization .mode-indicator').forEach(el => {
      el.textContent = encrypt ? '(Write by rows, read by columns in key order)' : '(Write by columns in key order, read by rows)';
    });
    
    let gridHTML = '';
    let result = '';
    
    // Sort keys to get the correct order
    const sortedKeys = [...keys].sort((a, b) => a - b);
    const keyLength = keys.length;
    
    if (encrypt) {
      // Encryption visualization
      const rows = Math.ceil(text.length / keyLength);
      const gridData = Array(rows).fill().map(() => []);
      
      // Fill grid by rows
      for (let i = 0; i < text.length; i++) {
        const row = Math.floor(i / keyLength);
        gridData[row].push(text[i]);
      }
      
      // Pad if needed
      for (let row = 0; row < rows; row++) {
        while (gridData[row].length < keyLength) {
          gridData[row].push('-');
        }
      }
      
      // Build grid HTML
      gridHTML += '<div class="transposition-header">Writing by rows:</div>';
      gridHTML += '<div class="transposition-matrix">';
      for (let row = 0; row < rows; row++) {
        gridHTML += '<div class="matrix-row">';
        for (let col = 0; col < keyLength; col++) {
          gridHTML += `<div class="matrix-cell">${gridData[row][col]}</div>`;
        }
        gridHTML += '</div>';
      }
      gridHTML += '</div>';
      
      // Build result by reading columns in key order
      gridHTML += '<div class="transposition-header">Reading by columns in key order:</div>';
      gridHTML += '<div class="transposition-reading">';
      for (let key of sortedKeys) {
        const colIndex = keys.indexOf(key);
        gridHTML += '<div class="reading-column">';
        for (let row = 0; row < rows; row++) {
          gridHTML += `<div class="matrix-cell">${gridData[row][colIndex]}</div>`;
          result += gridData[row][colIndex];
        }
        gridHTML += '</div>';
      }
      gridHTML += '</div>';
    } else {
      // Decryption visualization
      const rows = Math.ceil(text.length / keyLength);
      const gridData = Array(rows).fill().map(() => []);
      
      // Fill grid by columns in key order
      let index = 0;
      for (let key of sortedKeys) {
        const colIndex = keys.indexOf(key);
        for (let row = 0; row < rows; row++) {
          if (index < text.length) {
            gridData[row][colIndex] = text[index++];
          } else {
            gridData[row][colIndex] = '-';
          }
        }
      }
      
      // Build grid HTML
      gridHTML += '<div class="transposition-header">Writing by columns in key order:</div>';
      gridHTML += '<div class="transposition-matrix">';
      for (let col = 0; col < keyLength; col++) {
        gridHTML += '<div class="matrix-col">';
        for (let row = 0; row < rows; row++) {
          gridHTML += `<div class="matrix-cell">${gridData[row][col]}</div>`;
        }
        gridHTML += '</div>';
      }
      gridHTML += '</div>';
      
      // Build result by reading rows
      gridHTML += '<div class="transposition-header">Reading by rows:</div>';
      gridHTML += '<div class="transposition-reading">';
      for (let row = 0; row < rows; row++) {
        gridHTML += '<div class="reading-row">';
        for (let col = 0; col < keyLength; col++) {
          gridHTML += `<div class="matrix-cell">${gridData[row][col]}</div>`;
          result += gridData[row][col];
        }
        gridHTML += '</div>';
      }
      gridHTML += '</div>';
      
      // Remove padding
      result = result.replace(/-+$/g, '');
    }
    
    grid.innerHTML = gridHTML;
    resultBox.innerHTML = `<div class="final-text">${result}</div>`;
  }
  
  function updateAffineVisualization(text) {
    const a = parseInt(document.getElementById('affine-a').value);
    const b = parseInt(document.getElementById('affine-b').value);
    const encrypt = currentMode === 'encrypt';
    const transform = document.getElementById('affine-transformation');
    const resultBox = document.getElementById('affine-final-result');
    
    let transformHTML = '<div class="affine-header">';
    transformHTML += `<div>Letter</div><div>Position (x)</div><div>Formula</div><div>Result</div><div>New Letter</div></div>`;
    
    let result = '';
    
    for (let i = 0; i < Math.min(text.length, 20); i++) {
      const char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const isUpper = code >= 65 && code <= 90;
        const base = isUpper ? 65 : 97;
        const x = code - base;
        let calculation, y;
        
        if (encrypt) {
          y = (a * x + b) % 26;
          calculation = `${a}×${x} + ${b} = ${a*x + b} mod 26 = ${y}`;
        } else {
          // Find modular inverse of a
          let aInv = 0;
          for (let i = 1; i < 26; i++) {
            if ((a * i) % 26 === 1) {
              aInv = i;
              break;
            }
          }
          y = (aInv * (x - b + 26)) % 26;
          calculation = `${aInv}×(${x} - ${b} + 26) mod 26 = ${aInv}×${x-b+26} mod 26 = ${y}`;
        }
        
        const newChar = String.fromCharCode(y + base);
        
        transformHTML += `<div class="affine-row">`;
        transformHTML += `<div class="letter-box">${char}</div>`;
        transformHTML += `<div class="num-box">${x}</div>`;
        transformHTML += `<div class="formula-box">${calculation}</div>`;
        transformHTML += `<div class="num-box">${y}</div>`;
        transformHTML += `<div class="letter-box result">${newChar}</div>`;
        transformHTML += `</div>`;
        
        result += newChar;
      } else {
        transformHTML += `<div class="affine-row non-letter">${char} (not transformed)</div>`;
        result += char;
      }
    }
    
    if (text.length > 20) {
      transformHTML += `<div class="affine-row more">... and ${text.length - 20} more characters</div>`;
    }
    
    transform.innerHTML = transformHTML;
    resultBox.innerHTML = `<div class="final-text">${result}</div>`;
  }
  
  function updateOTPVisualization(text) {
    const key = document.getElementById('otp-key').value.toUpperCase().replace(/[^A-Z]/g, '');
    const operation = document.getElementById('otp-operation');
    const resultBox = document.getElementById('otp-final-result');

    if (!key) {
      operation.innerHTML = '<p class="no-data">Please enter a key (letters only)</p>';
      resultBox.innerHTML = '';
      return;
    }

    let operationHTML = '<div class="otp-header">';
    operationHTML += '<div>Text</div><div>Key</div><div>Operation</div><div>Result</div></div>';

    let result = '';
    const encrypt = currentMode === 'encrypt';

    for (let i = 0; i < Math.min(text.length, 20); i++) {
      const char = text[i].toUpperCase();
      const keyChar = key[i % key.length] || '?';

      if (char.match(/[A-Z]/) && keyChar.match(/[A-Z]/)) {
        const textCode = char.charCodeAt(0) - 65;
        const keyCode = keyChar.charCodeAt(0) - 65;
        let resCode, opStr;
        if (encrypt) {
          resCode = (textCode + keyCode) % 26;
          opStr = `(${textCode} + ${keyCode}) mod 26 = ${resCode}`;
        } else {
          resCode = (textCode - keyCode + 26) % 26;
          opStr = `(${textCode} - ${keyCode} + 26) mod 26 = ${resCode}`;
        }
        const resChar = String.fromCharCode(resCode + 65);

        operationHTML += `<div class="otp-row">`;
        operationHTML += `<div class="letter-box">${char} (${textCode})</div>`;
        operationHTML += `<div class="letter-box key">${keyChar} (${keyCode})</div>`;
        operationHTML += `<div class="op-box">${opStr}</div>`;
        operationHTML += `<div class="letter-box result">${resChar} (${resCode})</div>`;
        operationHTML += `</div>`;

        result += resChar;
      } else {
        operationHTML += `<div class="otp-row non-letter">${char} (not transformed)</div>`;
        result += char;
      }
    }

    if (text.length > 20) {
      operationHTML += `<div class="otp-row more">... and ${text.length - 20} more characters</div>`;
    }

    operation.innerHTML = operationHTML;
    resultBox.innerHTML = `<div class="final-text">${result}</div>`;
  }
  
  function updateROT13Visualization(text) {
    const transform = document.getElementById('rot13-transformation');
    const resultBox = document.getElementById('rot13-final-result');
    
    let transformHTML = '<div class="rot13-header">';
    transformHTML += '<div>Letter</div><div>Position</div><div>Operation</div><div>Result</div></div>';
    
    let result = '';
    
    for (let i = 0; i < Math.min(text.length, 20); i++) {
      const char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const isUpper = code >= 65 && code <= 90;
        const base = isUpper ? 65 : 97;
        const x = code - base;
        const y = (x + 13) % 26;
        const newChar = String.fromCharCode(y + base);
        
        transformHTML += `<div class="rot13-row">`;
        transformHTML += `<div class="letter-box">${char}</div>`;
        transformHTML += `<div class="num-box">${x}</div>`;
        transformHTML += `<div class="op-box">(${x} + 13)  = ${y}</div>`;
        transformHTML += `<div class="letter-box result">${newChar}</div>`;
        transformHTML += `</div>`;
        
        result += newChar;
      } else {
        transformHTML += `<div class="rot13-row non-letter">${char} (not rotated)</div>`;
        result += char;
      }
    }
    
    if (text.length > 20) {
      transformHTML += `<div class="rot13-row more">... and ${text.length - 20} more characters</div>`;
    }
    
    transform.innerHTML = transformHTML;
    resultBox.innerHTML = `<div class="final-text">${result}</div>`;
  }
  
  function updateCipherInfo() {
    const cipherNameMap = {
      'caesar': 'Caesar Cipher',
      'railfence': 'Rail Fence Cipher',
      'transposition': 'Transposition Cipher',
      'affine': 'Affine Cipher',
      'onetimepad': 'One-Time Pad',
      'rot13': 'ROT13'
    };
    
    document.getElementById('current-cipher-name').textContent = cipherNameMap[currentCipher] || '';
    
    const infoSections = document.querySelectorAll('.info-content');
    infoSections.forEach(section => {
      section.style.display = section.id === `${currentCipher}-info` ? 'block' : 'none';
    });
  }

  function applyTranspositionCipher(text, keys, encrypt) {
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
      
      // Calculate characters per column
      const charsPerCol = Math.ceil(text.length / keyLength);
      
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
  }

  function applyOneTimePad(text, key, encrypt) {
    if (!text || !key) return '';
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const textChar = text[i].toUpperCase();
      const keyChar = key[i % key.length];
      
      if (textChar.match(/[A-Z]/) && keyChar.match(/[A-Z]/)) {
        const textCode = textChar.charCodeAt(0) - 65;
        const keyCode = keyChar.charCodeAt(0) - 65;
        let resultCode;
        if (encrypt) {
          resultCode = (textCode + keyCode) % 26;
        } else {
          resultCode = (textCode - keyCode + 26) % 26;
        }
        result += String.fromCharCode(resultCode + 65);
      } else {
        result += textChar; // Leave non-alphabetic as is
      }
    }
    
    return result;
  }

  function applyROT13(text) {
    if (!text) return '';
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        let rotated;
        
        if (code >= 65 && code <= 90) { // Uppercase
          rotated = ((code - 65 + 13) % 26) + 65;
        } else if (code >= 97 && code <= 122) { // Lowercase
          rotated = ((code - 97 + 13) % 26) + 97;
        }
        
        result += String.fromCharCode(rotated);
      } else {
        result += char; // Leave non-alphabetic as is
      }
    }
    
    return result;
  }
});