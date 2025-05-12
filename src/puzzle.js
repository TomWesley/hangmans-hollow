// src/puzzle.js with improved cache busting and complete reset
import { generate } from 'random-words';
import { encrypt, decrypt } from './encryption';

// Track current puzzles in memory to avoid duplicates
let lastCompetitivePuzzle = null;
let lastCasualPuzzle = null;

// Function to generate a new puzzle word
const generateNewWord = () => {
  // Generate a random word between 5-8 letters
  const word = generate({ minLength: 5, maxLength: 8 });
  return word.toUpperCase();
};

// Get or generate a competitive puzzle word with cache busting
const getCompetitivePuzzle = (cacheBuster = null) => {
  // If we have a cache buster or need to force a refresh, generate a new word
  if (cacheBuster || 
      !localStorage.getItem('competitivePuzzleWord') || 
      lastCompetitivePuzzle === null) {
    
    // Generate a new word - make sure it's different from the last one
    let newWord;
    do {
      newWord = generateNewWord();
    } while (newWord === lastCompetitivePuzzle);
    
    // Store the new word
    lastCompetitivePuzzle = newWord;
    
    // Encrypt and save to localStorage
    const encrypted = encrypt(newWord);
    localStorage.setItem('competitivePuzzleWord', encrypted);
    
    // Add a timestamp to mark this as a fresh puzzle
    localStorage.setItem('competitivePuzzleTimestamp', Date.now().toString());
    
    console.log("Generated new competitive puzzle word:", newWord);
    return newWord;
  }
  
  // Otherwise, retrieve the existing puzzle
  const encryptedPuzzle = localStorage.getItem('competitivePuzzleWord');
  if (encryptedPuzzle) {
    const decrypted = decrypt(encryptedPuzzle);
    lastCompetitivePuzzle = decrypted; // Update memory tracker
    return decrypted;
  }
  
  // Fallback - should never reach here
  return generateNewWord();
};

// Get or generate a casual puzzle word with cache busting
const getCasualPuzzle = (cacheBuster = null) => {
  // If we have a cache buster or need to force a refresh, generate a new word
  if (cacheBuster || 
      !localStorage.getItem('casualPuzzleWord') ||
      lastCasualPuzzle === null) {
    
    // Generate a new word - make sure it's different from the last one
    let newWord;
    do {
      newWord = generateNewWord();
    } while (newWord === lastCasualPuzzle);
    
    // Store the new word
    lastCasualPuzzle = newWord;
    
    // Encrypt and save to localStorage
    const encrypted = encrypt(newWord);
    localStorage.setItem('casualPuzzleWord', encrypted);
    
    // Add a timestamp to mark this as a fresh puzzle
    localStorage.setItem('casualPuzzleTimestamp', Date.now().toString());
    
    console.log("Generated new casual puzzle word:", newWord);
    return newWord;
  }
  
  // Otherwise, retrieve the existing puzzle
  const encryptedPuzzle = localStorage.getItem('casualPuzzleWord');
  if (encryptedPuzzle) {
    const decrypted = decrypt(encryptedPuzzle);
    lastCasualPuzzle = decrypted; // Update memory tracker
    return decrypted;
  }
  
  // Fallback - should never reach here
  return generateNewWord();
};

// Create puzzle array based on the selected word
const createPuzzleArray = (word) => {
  // Verify we have a valid word
  if (!word || typeof word !== 'string' || word.length === 0) {
    console.error("Invalid puzzle word:", word);
    word = generateNewWord();
  }
  
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

// Helper function to completely reset puzzle on reset
export const resetPuzzleWord = (mode = 'both') => {
  if (mode === 'competitive' || mode === 'both') {
    localStorage.removeItem('competitivePuzzleWord');
    localStorage.removeItem('competitivePuzzleLetters');
    localStorage.removeItem('competitivePuzzleTimestamp');
    // Also reset the memory tracker
    lastCompetitivePuzzle = null;
  }
  
  if (mode === 'casual' || mode === 'both') {
    localStorage.removeItem('casualPuzzleWord');
    localStorage.removeItem('casualPuzzleLetters');
    localStorage.removeItem('casualPuzzleTimestamp');
    // Also reset the memory tracker
    lastCasualPuzzle = null;
  }
  
  console.log(`Puzzle words reset for mode: ${mode}`);
};

// Get the appropriate puzzle based on game mode with optional cache busting
export const getPuzzle = (mode, cacheBuster = null) => {
  // Get the right word based on play mode
  const word = mode === 'competitive' 
    ? getCompetitivePuzzle(cacheBuster) 
    : getCasualPuzzle(cacheBuster);
  
  // For debugging
  console.log(`${mode} puzzle word:`, word);
  
  // Create and return puzzle array
  return createPuzzleArray(word);
};

// Function to force generate a new puzzle
export const forceNewPuzzle = (mode) => {
  // Use current timestamp as cache buster
  const cacheBuster = Date.now();
  
  // Reset localStorage for this mode
  if (mode === 'competitive') {
    localStorage.removeItem('competitivePuzzleWord');
    localStorage.removeItem('competitivePuzzleLetters');
    lastCompetitivePuzzle = null;
  } else {
    localStorage.removeItem('casualPuzzleWord');
    localStorage.removeItem('casualPuzzleLetters');
    lastCasualPuzzle = null;
  }
  
  // Generate and return new puzzle
  return getPuzzle(mode, cacheBuster);
};

// Export an empty default puzzle (will be replaced by the appropriate puzzle when mode is known)
export default [];