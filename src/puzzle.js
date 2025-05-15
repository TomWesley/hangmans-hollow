// Updated puzzle.js with persistence across navigation and refresh

import { generate } from 'random-words';
import { encrypt, decrypt, encryptObject, decryptObject } from './encryption';

// Track current puzzles in memory to avoid duplicates
let lastCompetitivePuzzle = null;
let lastCasualPuzzle = null;

// Add a timestamp mechanism to prevent stale puzzles
const PUZZLE_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Function to generate a new puzzle word
const generateNewWord = (minLength = 5, maxLength = 8) => {
  // Generate a random word between minLength-maxLength letters
  const word = generate({ minLength, maxLength });
  return word.toUpperCase();
};

// Check if a game is in progress for a specific mode
const isGameInProgress = (mode) => {
  const gameStateKey = mode === 'competitive' ? 'competitiveGameStateCurrent' : 'casualGameStateCurrent';
  const usedLettersKey = mode === 'competitive' ? 'competitiveUsedLetters' : 'casualUsedLetters';
  
  try {
    // Check if we have a game state
    const encryptedGameState = localStorage.getItem(gameStateKey);
    if (!encryptedGameState) return false;
    
    const gameState = decryptObject(encryptedGameState);
    
    // If the game is in "solving" state, it's in progress
    if (gameState && gameState.status === 'solving') {
      // Also check if we have any used letters
      const encryptedUsedLetters = localStorage.getItem(usedLettersKey);
      if (encryptedUsedLetters) {
        const usedLetters = decryptObject(encryptedUsedLetters);
        // If we have used letters, we consider the game in progress
        return Array.isArray(usedLetters) && usedLetters.length > 0;
      }
    }
  } catch (e) {
    console.error(`Error checking if game is in progress for ${mode} mode:`, e);
  }
  
  return false;
};

// Get or generate a competitive puzzle word with persistence
const getCompetitivePuzzle = (cacheBuster = null) => {
  // Check if we already have a stored puzzle
  const encryptedPuzzle = localStorage.getItem('competitivePuzzleWord');
  
  // If we have a stored puzzle, use it regardless of game state
  if (encryptedPuzzle) {
    try {
      const decrypted = decrypt(encryptedPuzzle);
      lastCompetitivePuzzle = decrypted; // Update memory tracker
      console.log("Using existing competitive puzzle:", decrypted);
      return decrypted;
    } catch (e) {
      console.error("Error decrypting puzzle:", e);
      // Will fall through to create a new puzzle only if decryption failed
    }
  }
  
  // Check if we explicitly need to generate a new puzzle with cacheBuster
  // ONLY happens when Play Again is clicked or explicit reset
  if (cacheBuster) {
    console.log("Force generating new competitive puzzle with cache buster:", cacheBuster);
    
    // Generate a new word - make sure it's different from the last one
    let newWord;
    let attempts = 0;
    const maxAttempts = 5;
    
    do {
      newWord = generateNewWord();
      attempts++;
      // Avoid infinite loops by limiting attempts
      if (attempts >= maxAttempts) {
        console.warn(`Exceeded ${maxAttempts} attempts to generate unique puzzle, using latest`);
        break;
      }
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
  
  // If we don't have a stored puzzle, we need to create a first one
  // This should only happen on first visit ever
  console.log("No existing competitive puzzle found, generating initial puzzle");
  const newWord = generateNewWord();
  lastCompetitivePuzzle = newWord;
  
  // Encrypt and save to localStorage
  const encrypted = encrypt(newWord);
  localStorage.setItem('competitivePuzzleWord', encrypted);
  
  // Add a timestamp to mark this as a fresh puzzle
  localStorage.setItem('competitivePuzzleTimestamp', Date.now().toString());
  
  console.log("Generated initial competitive puzzle word:", newWord);
  return newWord;
};

// Get or generate a casual puzzle word with persistence
const getCasualPuzzle = (cacheBuster = null) => {
  // Check if we already have a stored puzzle
  const encryptedPuzzle = localStorage.getItem('casualPuzzleWord');
  
  // If we have a stored puzzle, use it regardless of game state
  if (encryptedPuzzle) {
    try {
      const decrypted = decrypt(encryptedPuzzle);
      lastCasualPuzzle = decrypted; // Update memory tracker
      console.log("Using existing casual puzzle:", decrypted);
      return decrypted;
    } catch (e) {
      console.error("Error decrypting puzzle:", e);
      // Will fall through to create a new puzzle only if decryption failed
    }
  }
  
  // Check if we explicitly need to generate a new puzzle with cacheBuster
  // ONLY happens when Play Again is clicked or explicit reset
  if (cacheBuster) {
    console.log("Force generating new casual puzzle with cache buster:", cacheBuster);
    
    // Generate a new word - make sure it's different from the last one
    let newWord;
    let attempts = 0;
    const maxAttempts = 5;
    
    do {
      newWord = generateNewWord();
      attempts++;
      // Avoid infinite loops by limiting attempts
      if (attempts >= maxAttempts) {
        console.warn(`Exceeded ${maxAttempts} attempts to generate unique puzzle, using latest`);
        break;
      }
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
  
  // If we don't have a stored puzzle, we need to create a first one
  // This should only happen on first visit ever
  console.log("No existing casual puzzle found, generating initial puzzle");
  const newWord = generateNewWord();
  lastCasualPuzzle = newWord;
  
  // Encrypt and save to localStorage
  const encrypted = encrypt(newWord);
  localStorage.setItem('casualPuzzleWord', encrypted);
  
  // Add a timestamp to mark this as a fresh puzzle
  localStorage.setItem('casualPuzzleTimestamp', Date.now().toString());
  
  console.log("Generated initial casual puzzle word:", newWord);
  return newWord;
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
  
  // Check that we're not returning a blank or invalid array
  if (puzzleArray.length === 0) {
    console.error("Created empty puzzle array, forcing fallback");
    const fallbackWord = generateNewWord(6, 6); // Force a 6-letter word
    return createPuzzleArray(fallbackWord);
  }
  
  return puzzleArray;
};

// Helper function to completely reset puzzle on reset - ONLY on game completion
export const resetPuzzleWord = (mode = 'both') => {
  if (mode === 'competitive' || mode === 'both') {
    // Check if the game is completed before resetting
    const encryptedGameState = localStorage.getItem('competitiveGameStateCurrent');
    let shouldReset = true;
    
    if (encryptedGameState) {
      try {
        const gameState = decryptObject(encryptedGameState);
        // Only reset if game is in victory or defeat state
        shouldReset = gameState && (gameState.status === 'victory' || gameState.status === 'defeat');
      } catch (e) {
        console.error("Error checking game state for reset:", e);
      }
    }
    
    if (shouldReset) {
      localStorage.removeItem('competitivePuzzleWord');
      localStorage.removeItem('competitivePuzzleLetters');
      localStorage.removeItem('competitivePuzzleTimestamp');
      // Also reset the memory tracker
      lastCompetitivePuzzle = null;
      console.log('Competitive puzzle reset complete');
    } else {
      console.log('Skipping competitive puzzle reset - game still in progress');
    }
  }
  
  if (mode === 'casual' || mode === 'both') {
    // Check if the game is completed before resetting
    const encryptedGameState = localStorage.getItem('casualGameStateCurrent');
    let shouldReset = true;
    
    if (encryptedGameState) {
      try {
        const gameState = decryptObject(encryptedGameState);
        // Only reset if game is in victory or defeat state
        shouldReset = gameState && (gameState.status === 'victory' || gameState.status === 'defeat');
      } catch (e) {
        console.error("Error checking game state for reset:", e);
      }
    }
    
    if (shouldReset) {
      localStorage.removeItem('casualPuzzleWord');
      localStorage.removeItem('casualPuzzleLetters');
      localStorage.removeItem('casualPuzzleTimestamp');
      // Also reset the memory tracker
      lastCasualPuzzle = null;
      console.log('Casual puzzle reset complete');
    } else {
      console.log('Skipping casual puzzle reset - game still in progress');
    }
  }
};

// Get the appropriate puzzle based on game mode with optional cache busting
export const getPuzzle = (mode, cacheBuster = null) => {
  // IMPORTANT: Only use cacheBuster if explicitly passed by "Play Again" buttons
  // Normal refreshes should never regenerate puzzles
  const forceCacheBuster = cacheBuster ? cacheBuster : null;
  
  // Get the right word based on play mode
  const word = mode === 'competitive' 
    ? getCompetitivePuzzle(forceCacheBuster) 
    : getCasualPuzzle(forceCacheBuster);
  
  // For debugging
  console.log(`${mode} puzzle word:`, word, forceCacheBuster ? "(forced new puzzle)" : "(using stored puzzle)");
  
  // Create and return puzzle array
  const puzzleArray = createPuzzleArray(word);
  
  // Save the puzzle array for this mode
  const storageKey = mode === 'competitive' ? 'competitivePuzzleLetters' : 'casualPuzzleLetters';
  localStorage.setItem(storageKey, encryptObject(puzzleArray));
  
  return puzzleArray;
};

// Function to verify an existing puzzle matches the word in localStorage
export const verifyPuzzleMatchesWord = (mode) => {
  const storageKey = mode === 'competitive' ? 'competitivePuzzleLetters' : 'casualPuzzleLetters';
  const wordKey = mode === 'competitive' ? 'competitivePuzzleWord' : 'casualPuzzleWord';
  
  // Get existing puzzle array
  const encryptedPuzzleArray = localStorage.getItem(storageKey);
  const encryptedWord = localStorage.getItem(wordKey);
  
  if (!encryptedPuzzleArray || !encryptedWord) {
    console.log(`No existing puzzle or word found for ${mode} mode`);
    return false;
  }
  
  try {
    // Decrypt both
    const puzzleArray = decryptObject(encryptedPuzzleArray);
    const word = decrypt(encryptedWord);
    
    // Extract word from puzzle array
    const puzzleWord = puzzleArray.map(letter => letter.name).join('');
    
    // Compare
    const matches = puzzleWord === word;
    console.log(`Puzzle verification for ${mode}: ${matches ? 'MATCH' : 'MISMATCH'}`);
    console.log(`- Stored word: ${word}`);
    console.log(`- Puzzle word: ${puzzleWord}`);
    
    if (!matches) {
      // If there's a mismatch, update the stored word to match the puzzle array
      // This ensures the game uses a consistent word
      console.log(`Fixing mismatch by updating stored word to ${puzzleWord}`);
      const encrypted = encrypt(puzzleWord);
      localStorage.setItem(wordKey, encrypted);
      return true; // Return true because we've fixed the mismatch
    }
    
    return matches;
  } catch (e) {
    console.error(`Error verifying puzzle for ${mode} mode:`, e);
    return false;
  }
};

// Function to FORCE generate a new puzzle - ONLY called after game completion
export const forceNewPuzzle = (mode) => {
  // Check if the game is completed before resetting
  const gameStateKey = mode === 'competitive' ? 'competitiveGameStateCurrent' : 'casualGameStateCurrent';
  const encryptedGameState = localStorage.getItem(gameStateKey);
  let shouldGenerateNew = true;
  
  if (encryptedGameState) {
    try {
      const gameState = decryptObject(encryptedGameState);
      // Only generate new if game is in victory or defeat state
      shouldGenerateNew = gameState && (gameState.status === 'victory' || gameState.status === 'defeat');
      
      if (!shouldGenerateNew) {
        console.log(`Skipping new puzzle generation - ${mode} game still in progress`);
      }
    } catch (e) {
      console.error("Error checking game state for reset:", e);
    }
  }
  
  if (shouldGenerateNew) {
    // Use current timestamp as cache buster
    const cacheBuster = Date.now();
    
    // Reset localStorage for this mode
    if (mode === 'competitive') {
      localStorage.removeItem('competitivePuzzleWord');
      localStorage.removeItem('competitivePuzzleLetters');
      localStorage.removeItem('competitivePuzzleTimestamp');
      lastCompetitivePuzzle = null;
    } else {
      localStorage.removeItem('casualPuzzleWord');
      localStorage.removeItem('casualPuzzleLetters');
      localStorage.removeItem('casualPuzzleTimestamp');
      lastCasualPuzzle = null;
    }
    
    // Generate and return new puzzle
    return getPuzzle(mode, cacheBuster);
  } else {
    // Return the existing puzzle instead
    return getPuzzle(mode);
  }
};

// Export an empty default puzzle (will be replaced by the appropriate puzzle when mode is known)
export default [];