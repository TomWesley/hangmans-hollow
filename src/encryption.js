/**
 * Simple encryption/decryption utility functions
 * This is a basic implementation for preventing casual cheating
 * It's not meant to be cryptographically secure
 */

// Simple Caesar cipher with a random shift
const encrypt = (text) => {
    if (!text) return '';
    
    // Generate a shift value between 1-25
    const shift = Math.floor(Math.random() * 25) + 1;
    
    // Create a prefix that contains the shift value (encoded)
    const prefix = String.fromCharCode(shift + 65); // A=1, B=2, etc.
    
    // Apply the Caesar cipher
    const encrypted = text.split('').map(char => {
      // Only encrypt uppercase letters
      if (char >= 'A' && char <= 'Z') {
        const code = char.charCodeAt(0);
        // Shift and wrap around the alphabet (A-Z)
        const shiftedCode = ((code - 65 + shift) % 26) + 65;
        return String.fromCharCode(shiftedCode);
      }
      return char;
    }).join('');
    
    // Add a random suffix to further obscure the content
    const randomChars = Array.from({length: 3}, () => 
      String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    ).join('');
    
    // Return prefix + encrypted + random suffix
    return prefix + encrypted + randomChars;
  };
  
  // Decrypt the encrypted text
  const decrypt = (encryptedText) => {
    if (!encryptedText || encryptedText.length < 2) return '';
    
    // Extract the shift value from the prefix
    const shift = encryptedText.charCodeAt(0) - 65;
    
    // Extract the encrypted text (without prefix and random suffix)
    const encrypted = encryptedText.substring(1, encryptedText.length - 3);
    
    // Apply reverse Caesar cipher
    const decrypted = encrypted.split('').map(char => {
      // Only decrypt uppercase letters
      if (char >= 'A' && char <= 'Z') {
        const code = char.charCodeAt(0);
        // Reverse shift and wrap around the alphabet (A-Z)
        const shiftedCode = ((code - 65 - shift + 26) % 26) + 65;
        return String.fromCharCode(shiftedCode);
      }
      return char;
    }).join('');
    
    return decrypted;
  };
// Add these functions to src/encryption.js

/**
 * Encrypts an object before storing in localStorage
 * @param {Object} data - The data to encrypt
 * @returns {string} - Encrypted string
 */
const encryptObject = (data) => {
    if (!data) return '';
    
    try {
      // Convert object to string
      const jsonString = JSON.stringify(data);
      
      // Apply basic obfuscation (XOR with a simple key)
      const key = "HANGMANHOLLOW";
      let obfuscated = '';
      
      for (let i = 0; i < jsonString.length; i++) {
        const charCode = jsonString.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        obfuscated += String.fromCharCode(charCode ^ keyChar);
      }
      
      // Convert to base64 for storage
      return btoa(obfuscated);
      
    } catch (error) {
      console.error('Encryption error:', error);
      return '';
    }
  };
  
  /**
   * Decrypts an object from localStorage
   * @param {string} encryptedData - The encrypted string
   * @returns {Object|null} - Decrypted object or null on failure
   */
  const decryptObject = (encryptedData) => {
    if (!encryptedData) return null;
    
    try {
      // Decode from base64
      const obfuscated = atob(encryptedData);
      
      // Reverse the XOR obfuscation
      const key = "HANGMANHOLLOW";
      let jsonString = '';
      
      for (let i = 0; i < obfuscated.length; i++) {
        const charCode = obfuscated.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        jsonString += String.fromCharCode(charCode ^ keyChar);
      }
      
      // Convert back to object
      return JSON.parse(jsonString);
      
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  };
  
  export { encrypt, decrypt, encryptObject, decryptObject };