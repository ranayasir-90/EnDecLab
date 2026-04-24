document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const browseButton = document.getElementById('browseButton');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const clearButton = document.getElementById('clearButton');
    const actionType = document.getElementById('actionType');
    const password = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const processButton = document.getElementById('processButton');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const downloadArea = document.getElementById('downloadArea');
    const downloadButton = document.getElementById('downloadButton');
    const alertContainer = document.getElementById('alertContainer');

    // File variables
    let selectedFile = null;
    let processedFileBlob = null;
    let processedFileName = '';

    // Add ripple effect to buttons (same as before)
    const buttons = document.querySelectorAll('.browse-button, .process-button, .download-button, .new-file-button, .back-button, .toggle-password, .clear-button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // ... ripple effect code ...
        });
    });

    // Toggle password visibility (same as before)
    togglePassword.addEventListener('click', function() {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Drag and drop handlers (same as before)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('active');
    }

    function unhighlight() {
        dropZone.classList.remove('active');
    }

    // Handle file drop (same as before)
    dropZone.addEventListener('drop', handleDrop, false);
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle file selection via browse button (same as before)
    browseButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Process selected files (same as before)
    function handleFiles(files) {
        if (files.length > 1) {
            showAlert('Please upload only one file at a time', 'error');
            return;
        }
        selectedFile = files[0];
        updateFilePreview(selectedFile);
    }

    // Update file preview (same as before)
    function updateFilePreview(file) {
        if (!file) return;
        const fileIcon = getFileIcon(file.type);
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        filePreview.style.display = 'block';
        filePreview.querySelector('.file-icon i').className = fileIcon;
        updateProcessButtonText();
    }

    // Get file icon (same as before)
    function getFileIcon(fileType) {
        const iconMap = {
            'image/': 'fas fa-image',
            'video/': 'fas fa-video',
            'audio/': 'fas fa-music',
            'application/pdf': 'fas fa-file-pdf',
            'application/msword': 'fas fa-file-word',
            'application/vnd.ms-excel': 'fas fa-file-excel',
            'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
            'application/zip': 'fas fa-file-archive',
            'text/': 'fas fa-file-alt'
        };
        for (const [prefix, icon] of Object.entries(iconMap)) {
            if (fileType.startsWith(prefix)) return icon;
        }
        return 'fas fa-file';
    }

    // Format file size (same as before)
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Clear selected file (same as before)
    clearButton.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        filePreview.style.display = 'none';
        downloadArea.style.display = 'none';
        progressContainer.style.display = 'none';
    });

    // Update process button text (same as before)
    actionType.addEventListener('change', updateProcessButtonText);
    function updateProcessButtonText() {
        const action = actionType.value;
        const buttonText = processButton.querySelector('.button-text');
        buttonText.textContent = selectedFile ? 
            (action === 'encrypt' ? 'Encrypt File' : 'Decrypt File') : 
            (action === 'encrypt' ? 'Select File to Encrypt' : 'Select File to Decrypt');
    }

    // Process file with actual encryption/decryption
    processButton.addEventListener('click', async () => {
        if (!selectedFile) {
            showAlert('Please select a file first', 'error');
            return;
        }

        if (!password.value) {
            showAlert('Please enter a password', 'error');
            return;
        }

        try {
            // Show progress
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            processButton.disabled = true;

            // Read the file
            const fileData = await readFileAsArrayBuffer(selectedFile);
            updateProgress(10);

            // Process the file
            const action = actionType.value;
            let result;
            if (action === 'encrypt') {
                result = await encryptData(fileData, password.value);
                processedFileName = selectedFile.name + '.enc';
            } else {
                result = await decryptData(fileData, password.value);
                processedFileName = selectedFile.name.replace(/\.enc$/, '');
            }
            updateProgress(90);

            // Create blob from processed data
            processedFileBlob = new Blob([result], { type: 'application/octet-stream' });
            updateProgress(100);

            // Show download area
            downloadArea.style.display = 'block';
            downloadArea.scrollIntoView({ behavior: 'smooth' });
            
            showAlert(`File ${action}ed successfully!`, 'success');
        } catch (error) {
            console.error('Error processing file:', error);
            showAlert(error.message || 'Error processing file', 'error');
        } finally {
            processButton.disabled = false;
        }
    });

    // Read file as ArrayBuffer
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // Update progress bar
    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
    }

    // Encrypt data using Web Crypto API (AES-GCM)
    async function encryptData(data, password) {
        try {
            // Derive key from password
            const keyMaterial = await getKeyMaterial(password);
            const key = await deriveKey(keyMaterial);
            
            // Generate IV (Initialization Vector)
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Encrypt the data
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );
            
            // Combine IV and encrypted data
            const result = new Uint8Array(iv.length + encryptedData.byteLength);
            result.set(iv, 0);
            result.set(new Uint8Array(encryptedData), iv.length);
            
            return result;
        } catch (error) {
            throw new Error('Encryption failed: ' + error.message);
        }
    }

    // Decrypt data using Web Crypto API (AES-GCM)
    async function decryptData(data, password) {
        try {
            // Extract IV from the data (first 12 bytes)
            const iv = new Uint8Array(data, 0, 12);
            const encryptedData = new Uint8Array(data, 12);
            
            // Derive key from password
            const keyMaterial = await getKeyMaterial(password);
            const key = await deriveKey(keyMaterial);
            
            // Decrypt the data
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                encryptedData
            );
            
            return decryptedData;
        } catch (error) {
            throw new Error('Decryption failed. Wrong password or corrupted file.');
        }
    }

    // Get key material from password
    async function getKeyMaterial(password) {
        const encoder = new TextEncoder();
        return await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
    }

    // Derive key from key material
    async function deriveKey(keyMaterial) {
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: new TextEncoder().encode('SecureVaultSalt'), // Should be unique per user in production
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Download processed file
    downloadButton.addEventListener('click', () => {
        if (!processedFileBlob) {
            showAlert('No file available to download', 'error');
            return;
        }

        const url = URL.createObjectURL(processedFileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = processedFileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        showAlert('Download started', 'success');
    });

    // Show alert message (same as before)
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'times-circle' : 'exclamation-circle';
        
        alert.innerHTML = `
            <i class="fas fa-${icon} alert-icon"></i>
            <span>${message}</span>
            <button class="alert-close"><i class="fas fa-times"></i></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.style.animation = 'slideIn 0.5s ease reverse forwards';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
        
        // Close button
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.style.animation = 'slideIn 0.5s ease reverse forwards';
            setTimeout(() => alert.remove(), 500);
        });
    }
});