import { generate } from 'random-words';
import { encrypt, decrypt } from './encryption';

// Check if we already have an encrypted puzzle word in localStorage
const encryptedPuzzle = localStorage.getItem('puzzleWord');
let w;

if (!encryptedPuzzle) {
  // First time play or reset - generate a new word
  w = generate({ minLength: 5, maxLength: 8 });
  w = w.toUpperCase();
  
  // Encrypt and store the word in localStorage
  const encrypted = encrypt(w);
  localStorage.setItem('puzzleWord', encrypted);
} else {
  // Decrypt the existing word
  w = decrypt(encryptedPuzzle);
}

// Log the word for debugging (you can remove this in production)
console.log('Current puzzle word:', w);

// Convert the word to an array of characters
const word = Array.from(w);

// Create the puzzle object array
let puz = [];
for (let i = 0; i < word.length; i++) {
  puz.push({
    id: i + 1,
    name: word[i],
    isHidden: true
  });
}

// Helper function to clear puzzle on reset (used by ResetGame function)
export const resetPuzzleWord = () => {
  localStorage.removeItem('puzzleWord');
};

export default puz;