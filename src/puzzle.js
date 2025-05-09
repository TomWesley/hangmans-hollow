// src/puzzle.js with enhanced separation for casual and competitive play
import { generate } from 'random-words';
import { encrypt, decrypt } from './encryption';

// Function to generate a new puzzle word
const generateNewWord = () => {
  const word = generate({ minLength: 5, maxLength: 8 });
  return word.toUpperCase();
};

// Check if we have an encrypted competitive puzzle word in localStorage
const getCompetitivePuzzle = () => {
  const encryptedPuzzle = localStorage.getItem('competitivePuzzleWord');
  
  if (!encryptedPuzzle) {
    // First time competitive play - generate a new word
    const newWord = generateNewWord();
    
    // Encrypt and store the word in localStorage
    const encrypted = encrypt(newWord);
    localStorage.setItem('competitivePuzzleWord', encrypted);
    
    return newWord;
  } else {
    // Decrypt the existing competitive word
    return decrypt(encryptedPuzzle);
  }
};

// Get or generate a casual puzzle word
const getCasualPuzzle = () => {
  const encryptedPuzzle = localStorage.getItem('casualPuzzleWord');
  
  if (!encryptedPuzzle) {
    // First time casual play - generate a new word
    const newWord = generateNewWord();
    
    // Encrypt and store the word in localStorage
    const encrypted = encrypt(newWord);
    localStorage.setItem('casualPuzzleWord', encrypted);
    
    return newWord;
  } else {
    // Decrypt the existing casual word
    return decrypt(encryptedPuzzle);
  }
};

// Create puzzle array based on the selected word
const createPuzzleArray = (word) => {
  // Convert the word to an array of characters
  const characters = Array.from(word);
  
  // Create the puzzle object array
  let puzzleArray = [];
  for (let i = 0; i < characters.length; i++) {
    puzzleArray.push({
      id: i + 1,
      name: characters[i],
      isHidden: true
    });
  }
  
  return puzzleArray;
};

// Helper function to reset puzzle on reset
export const resetPuzzleWord = (mode = 'both') => {
  if (mode === 'competitive' || mode === 'both') {
    localStorage.removeItem('competitivePuzzleWord');
    localStorage.removeItem('competitivePuzzleLetters');
    localStorage.removeItem('competitiveGameStateCurrent');
    localStorage.removeItem('competitiveFinalChosenLetters');
    localStorage.removeItem('competitiveUsedLetters');
    localStorage.removeItem('competitiveLetters');
  }
  
  if (mode === 'casual' || mode === 'both') {
    localStorage.removeItem('casualPuzzleWord');
    localStorage.removeItem('casualPuzzleLetters');
    localStorage.removeItem('casualGameStateCurrent');
    localStorage.removeItem('casualFinalChosenLetters');
    localStorage.removeItem('casualUsedLetters');
    localStorage.removeItem('casualLetters');
  }
  
  // For backward compatibility
  if (mode === 'both') {
    localStorage.removeItem('letters');
    localStorage.removeItem('preselected');
  }
};

// Get the appropriate puzzle based on game mode
export const getPuzzle = (mode) => {
  // Get the right word based on play mode
  const word = mode === 'competitive' ? getCompetitivePuzzle() : getCasualPuzzle();
  
  // For debugging
  console.log(`${mode} puzzle word:`, word);
  
  // Create and return puzzle array
  return createPuzzleArray(word);
};

// Force refresh a puzzle (for testing or debugging)
export const refreshPuzzle = (mode) => {
  if (mode === 'competitive' || mode === 'both') {
    localStorage.removeItem('competitivePuzzleWord');
  }
  
  if (mode === 'casual' || mode === 'both') {
    localStorage.removeItem('casualPuzzleWord');
  }
  
  // Return a new puzzle for the specified mode
  if (mode === 'competitive') {
    return getPuzzle('competitive');
  } else if (mode === 'casual') {
    return getPuzzle('casual');
  } else {
    // If 'both', default to competitive
    return getPuzzle('competitive');
  }
};

// Export an empty default puzzle (will be replaced by the appropriate puzzle when mode is known)
export default [];