// Updated puzzle.js with persistence across navigation

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
  // First check if a game is in progress
  const gameInProgress = isGameInProgress('competitive');
  console.log("Competitive game in progress:", gameInProgress);
  
  // If a game is in progress and we're not explicitly forcing a new puzzle,
  // get the existing puzzle word
  if (gameInProgress && !cacheBuster) {
    const encryptedPuzzle = localStorage.getItem('competitivePuzzleWord');
    if (encryptedPuzzle) {
      try {
        const decrypted = decrypt(encryptedPuzzle);
        lastCompetitivePuzzle = decrypted; // Update memory tracker
        console.log("Retrieved in-progress competitive puzzle:", decrypted);
        return decrypted;
      } catch (e) {
        console.error("Error decrypting in-progress puzzle:", e);
        // Will fall through to create a new puzzle
      }
    }
  }
  
  // Check if we need to generate a new puzzle
  const needNewPuzzle = () => {
    // If cacheBuster is provided, always generate new
    if (cacheBuster) return true;
    
    // If no puzzle exists in localStorage, generate new
    if (!localStorage.getItem('competitivePuzzleWord')) return true;
    
    // Check if puzzle has expired (only relevant for completed games)
    if (!gameInProgress) {
      const timestamp = localStorage.getItem('competitivePuzzleTimestamp');
      if (timestamp) {
        const puzzleTime = parseInt(timestamp, 10);
        const currentTime = Date.now();
        if (currentTime - puzzleTime > PUZZLE_EXPIRATION_TIME) {
          console.log("Competitive puzzle has expired, generating new one");
          return true;
        }
      } else {
        // If no timestamp exists, force regeneration
        return true;
      }
    }
    
    // Check memory tracker
    if (lastCompetitivePuzzle === null) {
      // Try to load from localStorage first
      const encryptedPuzzle = localStorage.getItem('competitivePuzzleWord');
      if (encryptedPuzzle) {
        try {
          lastCompetitivePuzzle = decrypt(encryptedPuzzle);
          console.log("Loaded competitive puzzle from localStorage:", lastCompetitivePuzzle);
        } catch (e) {
          console.error("Error decrypting puzzle, will generate new one:", e);
          return true;
        }
      } else {
        return true;
      }
    }
    
    // No need for a new puzzle
    return false;
  };
  
  if (needNewPuzzle()) {
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
  
  // Otherwise, retrieve the existing puzzle
  const encryptedPuzzle = localStorage.getItem('competitivePuzzleWord');
  if (encryptedPuzzle) {
    try {
      const decrypted = decrypt(encryptedPuzzle);
      lastCompetitivePuzzle = decrypted; // Update memory tracker
      console.log("Loaded existing competitive puzzle:", decrypted);
      return decrypted;
    } catch (e) {
      console.error("Error decrypting puzzle, generating new one:", e);
      return getCompetitivePuzzle(Date.now()); // Force generate with timestamp as cache buster
    }
  }
  
  // Fallback - should never reach here
  console.warn("Fallback puzzle generation needed for competitive mode");
  return generateNewWord();
};

// Get or generate a casual puzzle word with persistence
const getCasualPuzzle = (cacheBuster = null) => {
  // First check if a game is in progress
  const gameInProgress = isGameInProgress('casual');
  console.log("Casual game in progress:", gameInProgress);
  
  // If a game is in progress and we're not explicitly forcing a new puzzle,
  // get the existing puzzle word
  if (gameInProgress && !cacheBuster) {
    const encryptedPuzzle = localStorage.getItem('casualPuzzleWord');
    if (encryptedPuzzle) {
      try {
        const decrypted = decrypt(encryptedPuzzle);
        lastCasualPuzzle = decrypted; // Update memory tracker
        console.log("Retrieved in-progress casual puzzle:", decrypted);
        return decrypted;
      } catch (e) {
        console.error("Error decrypting in-progress puzzle:", e);
        // Will fall through to create a new puzzle
      }
    }
  }
  
  // Check if we need to generate a new puzzle
  const needNewPuzzle = () => {
    // If cacheBuster is provided, always generate new
    if (cacheBuster) return true;
    
    // If no puzzle exists in localStorage, generate new
    if (!localStorage.getItem('casualPuzzleWord')) return true;
    
    // Check if puzzle has expired (only relevant for completed games)
    if (!gameInProgress) {
      const timestamp = localStorage.getItem('casualPuzzleTimestamp');
      if (timestamp) {
        const puzzleTime = parseInt(timestamp, 10);
        const currentTime = Date.now();
        if (currentTime - puzzleTime > PUZZLE_EXPIRATION_TIME) {
          console.log("Casual puzzle has expired, generating new one");
          return true;
        }
      } else {
        // If no timestamp exists, force regeneration
        return true;
      }
    }
    
    // Check memory tracker
    if (lastCasualPuzzle === null) {
      // Try to load from localStorage first
      const encryptedPuzzle = localStorage.getItem('casualPuzzleWord');
      if (encryptedPuzzle) {
        try {
          lastCasualPuzzle = decrypt(encryptedPuzzle);
          console.log("Loaded casual puzzle from localStorage:", lastCasualPuzzle);
        } catch (e) {
          console.error("Error decrypting puzzle, will generate new one:", e);
          return true;
        }
      } else {
        return true;
      }
    }
    
    // No need for a new puzzle
    return false;
  };
  
  if (needNewPuzzle()) {
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
  
  // Otherwise, retrieve the existing puzzle
  const encryptedPuzzle = localStorage.getItem('casualPuzzleWord');
  if (encryptedPuzzle) {
    try {
      const decrypted = decrypt(encryptedPuzzle);
      lastCasualPuzzle = decrypted; // Update memory tracker
      console.log("Loaded existing casual puzzle:", decrypted);
      return decrypted;
    } catch (e) {
      console.error("Error decrypting puzzle, generating new one:", e);
      return getCasualPuzzle(Date.now()); // Force generate with timestamp as cache buster
    }
  }
  
  // Fallback - should never reach here
  console.warn("Fallback puzzle generation needed for casual mode");
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
  // Get the right word based on play mode
  const word = mode === 'competitive' 
    ? getCompetitivePuzzle(cacheBuster) 
    : getCasualPuzzle(cacheBuster);
  
  // For debugging
  console.log(`${mode} puzzle word:`, word);
  
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