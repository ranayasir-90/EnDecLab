// Steganography Laboratory JavaScript
// Focuses on LSB (Least Significant Bit) technique for image-based steganography

document.addEventListener('DOMContentLoaded', function() {
    if (!document.body.classList.contains('steganography-lab')) return;

    // DOM Elements for Embedding
    const coverImageInput = document.getElementById('cover-image-input');
    const embedCanvas = document.getElementById('embed-canvas');
    const embedCtx = embedCanvas.getContext('2d');
    const messageToEmbed = document.getElementById('message-to-embed');
    const encryptionPasswordInput = document.getElementById('encryption-password'); // New
    const embedButton = document.getElementById('embed-message-btn');
    const stegoImageDisplay = document.getElementById('stego-image-display');
    const downloadStegoLink = document.getElementById('download-stego-image');
    const embedStatus = document.getElementById('embed-status');

    // DOM Elements for Extraction
    const stegoImageInput = document.getElementById('stego-image-input');
    const extractCanvas = document.getElementById('extract-canvas');
    const extractCtx = extractCanvas.getContext('2d');
    const decryptionPasswordInput = document.getElementById('decryption-password'); // New
    const extractButton = document.getElementById('extract-message-btn');
    const extractedMessageOutput = document.getElementById('extracted-message');
    const extractStatus = document.getElementById('extract-status');

    let currentCoverImage = null; // Stores the loaded cover image object
    let currentStegoImage = null; // Stores the loaded stego image object

    // Initialize event listeners
    setupEventListeners();

    function setupEventListeners() {
        // Handle cover image selection for embedding
        coverImageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                loadImage(file, embedCanvas, embedCtx, function(img) {
                    currentCoverImage = img;
                    messageToEmbed.disabled = false;
                    encryptionPasswordInput.disabled = false; // Enable password input
                    embedButton.disabled = !messageToEmbed.value.trim() || !encryptionPasswordInput.value.trim(); // Check password too
                    embedStatus.textContent = '';
                    stegoImageDisplay.innerHTML = '<canvas id="stego-output-canvas"></canvas>'; // Clear previous stego image
                    downloadStegoLink.style.display = 'none';
                    downloadStegoLink.href = '#';
                });
            }
        });

        // Handle message input for embedding
        messageToEmbed.addEventListener('input', function() {
            embedButton.disabled = !this.value.trim() || !encryptionPasswordInput.value.trim() || !currentCoverImage;
        });

        // Handle encryption password input for embedding
        encryptionPasswordInput.addEventListener('input', function() {
            embedButton.disabled = !this.value.trim() || !messageToEmbed.value.trim() || !currentCoverImage;
        });

        // Handle embed button click
        embedButton.addEventListener('click', embedMessage);

        // Handle stego image selection for extraction
        stegoImageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                loadImage(file, extractCanvas, extractCtx, function(img) {
                    currentStegoImage = img;
                    decryptionPasswordInput.disabled = false; // Enable password input
                    extractButton.disabled = !decryptionPasswordInput.value.trim(); // Check password too
                    extractedMessageOutput.textContent = '';
                    extractStatus.textContent = '';
                });
            }
        });

        // Handle decryption password input for extraction
        decryptionPasswordInput.addEventListener('input', function() {
            extractButton.disabled = !this.value.trim() || !currentStegoImage;
        });

        // Handle extract button click
        extractButton.addEventListener('click', extractMessage);
    }

    /**
     * Loads an image file onto a canvas.
     * @param {File} file - The image file to load.
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
     * @param {function(HTMLImageElement)} callback - Callback function with the loaded image.
     */
    function loadImage(file, canvas, ctx, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Resize image if too large for display/processing
                const maxWidth = 600;
                const maxHeight = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                callback(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Converts a string to its binary representation.
     * Each character becomes 8 bits.
     * @param {string} text - The input string.
     * @returns {string} - Binary string.
     */
    function textToBinary(text) {
        return text.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join('');
    }

    /**
     * Converts a binary string to its text representation.
     * @param {string} binaryString - The input binary string.
     * @returns {string} - Decoded text.
     */
    function binaryToText(binaryString) {
        let text = '';
        for (let i = 0; i < binaryString.length; i += 8) {
            const byte = binaryString.substring(i, i + 8);
            if (byte.length === 8) {
                text += String.fromCharCode(parseInt(byte, 2));
            }
        }
        return text;
    }

    // --- Encryption and Decryption Functions ---

    /**
     * Derives a cryptographic key from a password using PBKDF2.
     * @param {string} password - The password string.
     * @param {Uint8Array} salt - The salt for key derivation.
     * @returns {Promise<CryptoKey>} - The derived cryptographic key.
     */
    async function deriveKey(password, salt) {
        const passwordBuffer = new TextEncoder().encode(password);
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            passwordBuffer,
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000, // High iterations for security
                hash: "SHA-256",
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 }, // AES-256 GCM
            true,
            ["encrypt", "decrypt"]
        );
    }

    /**
     * Encrypts a message using AES-GCM with a derived key.
     * @param {string} message - The plaintext message.
     * @param {string} password - The encryption password.
     * @returns {Promise<{salt: string, iv: string, ciphertext: string}>} - Base64 encoded salt, IV, and ciphertext.
     */
    async function encryptMessage(message, password) {
        const salt = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes salt
        const iv = crypto.getRandomValues(new Uint8Array(12));   // 12 bytes IV for AES-GCM

        const key = await deriveKey(password, salt);

        const encodedMessage = new TextEncoder().encode(message);
        const ciphertextBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encodedMessage
        );

        // Convert ArrayBuffers to Base64 strings for embedding
        return {
            salt: btoa(String.fromCharCode(...salt)),
            iv: btoa(String.fromCharCode(...iv)),
            ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)))
        };
    }

    /**
     * Decrypts a message using AES-GCM with a derived key.
     * @param {string} encryptedDataString - JSON string containing Base64 encoded salt, IV, and ciphertext.
     * @param {string} password - The decryption password.
     * @returns {Promise<string>} - The decrypted plaintext message.
     */
    async function decryptMessage(encryptedDataString, password) {
        const parsedData = JSON.parse(encryptedDataString);

        // Convert Base64 back to Uint8Array
        const salt = Uint8Array.from(atob(parsedData.salt), c => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(parsedData.iv), c => c.charCodeAt(0));
        const ciphertext = Uint8Array.from(atob(parsedData.ciphertext), c => c.charCodeAt(0));

        const key = await deriveKey(password, salt);

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decryptedBuffer);
    }

    /**
     * Embeds a message into the cover image using LSB technique.
     */
    async function embedMessage() { // Made async
        if (!currentCoverImage) {
            embedStatus.textContent = 'Please load a cover image first.';
            embedStatus.style.color = 'var(--error-color)';
            return;
        }

        const message = messageToEmbed.value.trim();
        const password = encryptionPasswordInput.value.trim();

        if (!message) {
            embedStatus.textContent = 'Please enter a message to embed.';
            embedStatus.style.color = 'var(--error-color)';
            return;
        }
        if (!password) {
            embedStatus.textContent = 'Please enter an encryption password.';
            embedStatus.style.color = 'var(--error-color)';
            return;
        }

        embedStatus.textContent = 'Encrypting and embedding message...';
        embedStatus.style.color = 'var(--warning-color)';
        embedButton.disabled = true;

        try {
            // Encrypt the message first
            const encryptedPayload = await encryptMessage(message, password);
            const dataToEmbed = JSON.stringify(encryptedPayload); // Stringify the object

            const binaryMessage = textToBinary(dataToEmbed + '\0'); // Add null terminator
            const imageData = embedCtx.getImageData(0, 0, embedCanvas.width, embedCanvas.height);
            const data = imageData.data; // R, G, B, A values in a flat array

            const maxBits = Math.floor(data.length / 4) * 3; // Each pixel has 3 color channels (R,G,B), each can hold 1 bit

            if (binaryMessage.length > maxBits) {
                embedStatus.textContent = `Message (after encryption) is too long for this image. Max characters: ${Math.floor(maxBits / 8) - 1}`;
                embedStatus.style.color = 'var(--error-color)';
                return; // Will be caught by finally block
            }

            let messageIndex = 0;
            for (let i = 0; i < data.length; i += 4) { // Iterate through pixels (R, G, B, A)
                // Embed into Red channel
                if (messageIndex < binaryMessage.length) {
                    data[i] = (data[i] & 0xFE) | parseInt(binaryMessage[messageIndex++]);
                } else break;
                // Embed into Green channel
                if (messageIndex < binaryMessage.length) {
                    data[i + 1] = (data[i + 1] & 0xFE) | parseInt(binaryMessage[messageIndex++]);
                } else break;
                // Embed into Blue channel
                if (messageIndex < binaryMessage.length) {
                    data[i + 2] = (data[i + 2] & 0xFE) | parseInt(binaryMessage[messageIndex++]);
                } else break;
            }

            // Draw the modified image data to a new canvas for display/download
            const stegoCanvas = document.createElement('canvas');
            stegoCanvas.id = 'stego-output-canvas';
            stegoCanvas.width = embedCanvas.width;
            stegoCanvas.height = embedCanvas.height;
            const stegoCtx = stegoCanvas.getContext('2d');
            stegoCtx.putImageData(imageData, 0, 0);

            stegoImageDisplay.innerHTML = ''; // Clear previous content
            stegoImageDisplay.appendChild(stegoCanvas);

            downloadStegoLink.href = stegoCanvas.toDataURL('image/png');
            downloadStegoLink.download = 'stego_image.png';
            downloadStegoLink.style.display = 'block';

            embedStatus.textContent = 'Message encrypted and embedded successfully!';
            embedStatus.style.color = 'var(--success-color)';

        } catch (error) {
            console.error('Error during encryption or embedding:', error);
            embedStatus.textContent = 'Error: Could not embed message. See console for details.';
            embedStatus.style.color = 'var(--error-color)';
        } finally {
            embedButton.disabled = false;
        }
    }

    /**
     * Extracts a message from the stego image using LSB technique.
     */
    async function extractMessage() { // Made async
        if (!currentStegoImage) {
            extractStatus.textContent = 'Please load a stego image first.';
            extractStatus.style.color = 'var(--error-color)';
            return;
        }

        const password = decryptionPasswordInput.value.trim();
        if (!password) {
            extractStatus.textContent = 'Please enter the decryption password.';
            extractStatus.style.color = 'var(--error-color)';
            return;
        }

        extractStatus.textContent = 'Extracting and decrypting message...';
        extractStatus.style.color = 'var(--warning-color)';
        extractButton.disabled = true;
        extractedMessageOutput.textContent = ''; // Clear previous output

        try {
            const imageData = extractCtx.getImageData(0, 0, extractCanvas.width, extractCanvas.height);
            const data = imageData.data;

            let binaryMessage = '';
            for (let i = 0; i < data.length; i += 4) { // Iterate through pixels
                // Extract from Red, Green, Blue channels
                binaryMessage += (data[i] & 1).toString();
                binaryMessage += (data[i + 1] & 1).toString();
                binaryMessage += (data[i + 2] & 1).toString();
            }

            // Search for null terminator to end message
            const nullTerminator = textToBinary('\0');
            const endIndex = binaryMessage.indexOf(nullTerminator);

            let extractedEncryptedText = '';
            if (endIndex !== -1) {
                extractedEncryptedText = binaryToText(binaryMessage.substring(0, endIndex));
            } else {
                extractStatus.textContent = 'No null terminator found, attempting decryption on all extracted bits.';
                extractStatus.style.color = 'var(--warning-color)';
                extractedEncryptedText = binaryToText(binaryMessage); // Try decoding all
            }
            
            // Decrypt the message
            // Validate if the extracted text looks like a JSON string before parsing
            if (!extractedEncryptedText.startsWith('{') || !extractedEncryptedText.endsWith('}')) {
                 throw new Error("Extracted data does not appear to be encrypted payload (invalid format).");
            }

            const decryptedText = await decryptMessage(extractedEncryptedText, password);
            extractedMessageOutput.textContent = decryptedText;
            extractStatus.textContent = 'Message extracted and decrypted successfully!';
            extractStatus.style.color = 'var(--success-color)';

        } catch (error) {
            console.error('Error during extraction or decryption:', error);
            if (error.name === 'OperationError' || error.message.includes('malformed')) { // Common errors for bad key/data
                extractStatus.textContent = 'Decryption failed: Incorrect password or corrupted stego image.';
            } else {
                extractStatus.textContent = 'Error: Could not extract message. See console for details.';
            }
            extractedMessageOutput.textContent = 'Error: Could not decrypt message. Make sure the password is correct.';
            extractStatus.style.color = 'var(--error-color)';
        } finally {
            extractButton.disabled = false;
        }
    }
});