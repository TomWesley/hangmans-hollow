// Updated Letters.js with mode synchronization fixes
import React from 'react'
import Letter from './Letter'
import { useState, useEffect, useRef } from 'react'
import data from './data'
import AnswerLetters from './AnswerLetters'
import { getPuzzle, resetPuzzleWord, forceNewPuzzle } from './puzzle';
import gamestate from './gamestate'
import BatMeter from './BatMeter'
import LetterCarousel from './LetterCarousel'
import { encrypt, decrypt, encryptObject, decryptObject } from './encryption'
import { updateUserStats, getUserStats } from './userManagement'

// Helper function to check if a game result has already been logged to database
const hasGameResultBeenLogged = (casualMode) => {
  const key = casualMode ? 'casualGameLogged' : 'competitiveGameLogged';
  const encryptedValue = localStorage.getItem(key);
  
  if (encryptedValue) {
    try {
      const decrypted = decryptObject(encryptedValue);
      return decrypted === true;
    } catch (e) {
      console.error("Error decrypting game logged status:", e);
    }
  }
  
  return false;
};

// Helper function to mark a game result as logged
const markGameResultAsLogged = (casualMode) => {
  const key = casualMode ? 'casualGameLogged' : 'competitiveGameLogged';
  localStorage.setItem(key, encryptObject(true));
  console.log(`Marked ${casualMode ? 'casual' : 'competitive'} game as logged to database`);
};

// Enhanced ResetGame function
const ResetGame = (mode = 'both', shouldReload = true) => {
  console.log(`Resetting game for mode: ${mode}, shouldReload: ${shouldReload}`);
  
  // Reset the appropriate localStorage items
  if (mode === 'competitive' || mode === 'both') {
    console.log('Clearing competitive mode data');
    // Make sure to clear ALL competitive localStorage items
    localStorage.removeItem('competitiveGameStateCurrent');
    localStorage.removeItem('competitivePuzzleLetters');
    localStorage.removeItem('competitiveFinalChosenLetters');
    localStorage.removeItem('competitiveUsedLetters');
    localStorage.removeItem('competitiveLetters');
    localStorage.removeItem('competitivePuzzleWord');
    localStorage.removeItem('competitivePuzzleTimestamp');
    localStorage.removeItem('competitiveGameLogged'); // Clear the game logged flag
  }
  
  if (mode === 'casual' || mode === 'both') {
    console.log('Clearing casual mode data');
    // Make sure to clear ALL casual localStorage items
    localStorage.removeItem('casualGameStateCurrent');
    localStorage.removeItem('casualPuzzleLetters');
    localStorage.removeItem('casualFinalChosenLetters');
    localStorage.removeItem('casualUsedLetters');
    localStorage.removeItem('casualLetters');
    localStorage.removeItem('casualPuzzleWord');
    localStorage.removeItem('casualPuzzleTimestamp');
    localStorage.removeItem('casualGameLogged'); // Clear the game logged flag
  }
  
  // Always reset these shared state items
  localStorage.removeItem('preselected');
  localStorage.removeItem('letters'); // Clear the legacy letters item too
  localStorage.removeItem('currentGameMode'); // Clear the current game mode
  
  // Reset the puzzle word(s)
  resetPuzzleWord(mode);
  
  // If shouldReload is true, refresh the page
  // Otherwise, we'll handle the reset in the component
  if (shouldReload) {
    console.log('Reloading page...');
    window.location.reload(false);
  } else {
    console.log('Page reload skipped, handling reset in component');
  }
};

// Local storage helper functions
const getLocalStorageUsedLetters = (casualMode) => {
  const key = casualMode ? 'casualUsedLetters' : 'competitiveUsedLetters';
  const encryptedUsedLetters = localStorage.getItem(key);
  if (encryptedUsedLetters) {
    try {
      const decrypted = decryptObject(encryptedUsedLetters);
      if (decrypted) {
        return decrypted;
      }
    } catch (e) {
      console.error("Error decrypting used letters:", e);
    }
  }
  return [];
};

const getLocalStorageGameState = (casualMode) => {
  const key = casualMode ? 'casualGameStateCurrent' : 'competitiveGameStateCurrent';
  const encryptedGameState = localStorage.getItem(key);
  if (encryptedGameState) {
    try {
      const decrypted = decryptObject(encryptedGameState);
      if (decrypted) {
        return decrypted;
      }
    } catch (e) {
      console.error("Error decrypting game state:", e);
    }
  }
  return {...gamestate}; // Return a fresh copy
};

const getLocalStorageFinalChosenLetters = (casualMode) => {
  const key = casualMode ? 'casualFinalChosenLetters' : 'competitiveFinalChosenLetters';
  const encryptedFinalLetters = localStorage.getItem(key);
  if (encryptedFinalLetters) {
    try {
      const decrypted = decryptObject(encryptedFinalLetters);
      if (decrypted) {
        return decrypted;
      }
    } catch (e) {
      console.error("Error decrypting final chosen letters:", e);
    }
  }
  return [];
};

// Updated to use mode-specific letters
const getLocalStorageLetters = (casualMode) => {
  // Get the correct mode-specific key
  const modeKey = casualMode ? 'casualLetters' : 'competitiveLetters';
  const encryptedModeLetters = localStorage.getItem(modeKey);
  
  // If we have mode-specific letters stored, use those
  if (encryptedModeLetters) {
    try {
      const decrypted = decryptObject(encryptedModeLetters);
      if (decrypted && Array.isArray(decrypted)) {
        return decrypted;
      }
    } catch (e) {
      console.error("Error decrypting mode-specific letters:", e);
    }
  }
  
  // If we reach here, we don't have valid mode-specific letters
  // Return a fresh copy of the letters data
  return JSON.parse(JSON.stringify(data));
};

const getLocalStoragePreselected = () => {
  const encryptedPreselected = localStorage.getItem('preselected')
  if (encryptedPreselected) {
    try {
      const decrypted = decryptObject(encryptedPreselected);
      if (decrypted) {
        return decrypted;
      }
    } catch (e) {
      console.error("Error decrypting preselected:", e);
    }
  }
  
  return {
    status: false,
    value: '',
    key: '',
  };
}

// New function to ensure correct current game mode is stored
const setCurrentGameMode = (casualMode) => {
  localStorage.setItem('currentGameMode', encryptObject(casualMode));
  console.log(`Set current game mode to: ${casualMode ? 'casual' : 'competitive'}`);
};

// New function to get current game mode
const getCurrentGameMode = () => {
  const encryptedMode = localStorage.getItem('currentGameMode');
  if (encryptedMode) {
    try {
      return decryptObject(encryptedMode);
    } catch (e) {
      console.error("Error decrypting current game mode:", e);
    }
  }
  
  // Check for casualPlayerState as fallback for determining mode
  const encryptedCasualState = localStorage.getItem('casualPlayerState');
  if (encryptedCasualState) {
    try {
      const isCasual = decryptObject(encryptedCasualState);
      if (isCasual === true) {
        console.log("Detected casual mode from casualPlayerState");
        return true; // true = casual mode
      }
    } catch (e) {
      console.error("Error decrypting casual player state:", e);
    }
  }
  
  return false; // Default to competitive mode if cannot determine
};

var scoreInc = 0

const Letters = ({ casualMode = false, username = '' }) => {
  // Add a version counter to force re-renders when needed
  const [puzzleVersion, setPuzzleVersion] = useState(1);
  console.log(`Rendering Letters component with casualMode: ${casualMode}, username: ${username}`);
  
  // IMPORTANT: Ensure local state matches props by checking casualPlayerState
  const forcedCasualMode = (() => {
    if (casualMode) return true; // If props say casual, use casual
    
    // Otherwise check localStorage
    const encryptedCasualState = localStorage.getItem('casualPlayerState');
    if (encryptedCasualState) {
      try {
        const isCasual = decryptObject(encryptedCasualState);
        return isCasual === true;
      } catch (e) {
        console.error("Error checking casualPlayerState:", e);
      }
    }
    return false; // Default to competitive (matching props)
  })();
  
  // Track mode changes using a ref to detect when casualMode prop changes
  const lastModeRef = useRef(forcedCasualMode);
  
  // Track if we've loaded a fresh puzzle for this render cycle
  const freshPuzzleLoadedRef = useRef(false);
  
  // Store the actual mode used for data retrieval - may differ from prop
  // if there's an issue with sync
  const [effectiveMode, setEffectiveMode] = useState(forcedCasualMode);
  
  // Get the mode as a string for easier referencing
  const mode = effectiveMode ? 'casual' : 'competitive';
  
  // Track whether we should force a new puzzle
  const [forceNewPuzzleFlag, setForceNewPuzzleFlag] = useState(false);
  
  // Update localStorage with current game mode whenever it changes
  useEffect(() => {
    // Update localStorage with current game mode
    setCurrentGameMode(forcedCasualMode);
    
    // Check if mode has changed from previous render
    if (lastModeRef.current !== forcedCasualMode) {
      console.log(`MODE SWITCH DETECTED: from ${lastModeRef.current ? 'casual' : 'competitive'} to ${forcedCasualMode ? 'casual' : 'competitive'}`);
      
      // Update the ref to track the new mode
      lastModeRef.current = forcedCasualMode;
      
      // Update effective mode state
      setEffectiveMode(forcedCasualMode);
      
      // Force a reload of the correct puzzle immediately
      const modeString = forcedCasualMode ? 'casual' : 'competitive';
      console.log(`Loading puzzle for new mode: ${modeString}`);
      
      // Get the puzzle for the new mode without timestamp (to avoid generating new puzzle)
      const newPuzzle = getPuzzle(modeString);
      setPuzzle(newPuzzle);
      
      // Reset game state to ensure it's using the correct puzzle
      // Load state for the new mode
      setGameStateCurrent(getLocalStorageGameState(forcedCasualMode));
      setfinalChosenLetters(getLocalStorageFinalChosenLetters(forcedCasualMode));
      setLetters(getLocalStorageLetters(forcedCasualMode));
      setUsedLetters(getLocalStorageUsedLetters(forcedCasualMode));
      
      // Reset freshPuzzleLoaded flag
      freshPuzzleLoadedRef.current = true;
      
      // Log the loaded puzzle for debugging
      const puzzleWord = newPuzzle.map(l => l.name).join('');
      console.log(`Successfully switched to ${modeString} mode with puzzle: ${puzzleWord}`);
    }
  }, [forcedCasualMode]);
  
  // Initialize puzzle state with a function to ensure it's always the latest
  // This is critical for syncing with the correct mode
  const [puzzle, setPuzzle] = useState(() => {
    // Force a new puzzle when first rendering if needed
    const storedMode = getCurrentGameMode();
    
    // Make sure we use the correct mode for initialization
    const initMode = storedMode !== undefined ? storedMode : forcedCasualMode;
    const modeString = initMode ? 'casual' : 'competitive';
    
    // Add debugging for puzzle initialization
    console.log(`Initializing puzzle for ${modeString} mode (forced casual: ${forcedCasualMode})`);
    
    // Check if we have an existing puzzle stored
    const puzzleKey = initMode ? 'casualPuzzleLetters' : 'competitivePuzzleLetters';
    const encryptedStoredPuzzle = localStorage.getItem(puzzleKey);
    
    if (encryptedStoredPuzzle) {
      try {
        const decryptedPuzzle = decryptObject(encryptedStoredPuzzle);
        if (decryptedPuzzle && Array.isArray(decryptedPuzzle) && decryptedPuzzle.length > 0) {
          const puzzleWord = decryptedPuzzle.map(l => l.name).join('');
          console.log(`Using stored ${modeString} puzzle: ${puzzleWord}`);
          freshPuzzleLoadedRef.current = true;
          return decryptedPuzzle;
        }
      } catch (e) {
        console.error(`Error decrypting stored ${modeString} puzzle:`, e);
      }
    }
    
    // If we don't have a valid stored puzzle, get a new one
    // DO NOT pass a timestamp here to avoid generating new puzzles on refresh
    const newPuzzle = getPuzzle(modeString);
    const puzzleWord = newPuzzle.map(l => l.name).join('');
    
    console.log(`Created new puzzle for ${modeString} mode:`, puzzleWord, `(${puzzleWord.length} letters)`);
    freshPuzzleLoadedRef.current = true;
    
    return newPuzzle;
  });
  
  // Use mode-specific localStorage
  const [gameStateCurrent, setGameStateCurrent] = useState(() => 
    getLocalStorageGameState(effectiveMode)
  );
  
  const [localStats, setLocalStats] = useState({ 
    gamesPlayed: 0,
    gamesWon: 0,
    averageBudgetRemaining: 0, 
    winningPercentage: 0,
    commonLetters: []
  });
  
  const [finalChosenLetters, setfinalChosenLetters] = useState(() => 
    getLocalStorageFinalChosenLetters(effectiveMode)
  );
  
  const [letters, setLetters] = useState(() => 
    getLocalStorageLetters(effectiveMode)
  );
  
  const [usedLetters, setUsedLetters] = useState(() => 
    getLocalStorageUsedLetters(effectiveMode)
  );
  
  const [preselected, setPreselected] = useState(() =>
    getLocalStoragePreselected()
  );
  
  const [hasUpdatedStats, setHasUpdatedStats] = useState(false);

  // Function to load user stats without updating the database
  const loadUserStats = async () => {
    // Skip if in casual mode or using casual_player username
    if (effectiveMode || username === 'casual_player') {
      console.log('Skipping stats loading for casual mode or casual player');
      return;
    }
    
    // Don't fetch again if we already have stats
    if (localStats && (localStats.gamesPlayed > 0 || localStats.gamesWon > 0)) {
      console.log('Already have user stats loaded:', localStats);
      return;
    }
    
    console.log(`Loading stats for user: ${username}`);
    
    try {
      // Fetch user stats without updating them
      const stats = await getUserStats(username);
      
      if (stats) {
        console.log('Successfully loaded user stats:', stats);
        setLocalStats({
          gamesPlayed: stats.gamesPlayed || 0,
          gamesWon: stats.gamesWon || 0,
          winningPercentage: stats.winningPercentage || 0,
          averageBudgetRemaining: stats.averageBudgetRemaining || 0,
          commonLetters: stats.commonLetters || []
        });
        
        // We've now loaded stats, but not updated them
        setHasUpdatedStats(false);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Function to reset the game and start a new one with proper puzzle refresh
  const resetAndStartNewGame = () => {
    console.log("Starting a new game with complete puzzle refresh...");
    
    // First, reset localStorage for the current mode without page reload
    ResetGame(mode, false);
    
    // Force a new puzzle to be generated by directly resetting in puzzle.js
    resetPuzzleWord(mode);
    
    // Generate a unique timestamp to ensure a fresh puzzle
    const timestamp = Date.now() + Math.floor(Math.random() * 1000); 
    
    // Get a fresh puzzle for the current mode with cache-busting
    const newPuzzle = getPuzzle(mode, timestamp);
    const puzzleWord = newPuzzle.map(l => l.name).join('');
    console.log(`New puzzle generated for ${mode} mode:`, puzzleWord, `(${puzzleWord.length} letters)`);
    
    // Store the new puzzle word to ensure AnswerLetters component can access it
    const wordKey = effectiveMode ? 'casualPuzzleWord' : 'competitivePuzzleWord';
    const letterKey = effectiveMode ? 'casualPuzzleLetters' : 'competitivePuzzleLetters';
    
    // Make sure puzzleLetters in localStorage is updated with the new puzzle
    localStorage.setItem(letterKey, encryptObject(newPuzzle));
    
    // Reset all component state to start a new game
    setPuzzle(newPuzzle);
    setGameStateCurrent({...gamestate}); // Use spread to create a new object
    setfinalChosenLetters([]);
    
    // Create a fresh copy of the letters data
    const freshLetters = JSON.parse(JSON.stringify(data));
    console.log(`Reset letter data: ${freshLetters.length} letters available`);
    setLetters(freshLetters);
    
    // Clear used letters
    setUsedLetters([]);
    
    // Reset preselected state
    setPreselected({ value: '', status: false, key: '' });
    
    // Reset stats update flag
    setHasUpdatedStats(false);
    
    // Force local re-render by incrementing a counter
    setPuzzleVersion(prev => prev + 1);
    
    console.log("Game state reset complete with new puzzle:", puzzleWord);
  };
  
  // Function to verify game state consistency
  const verifyGameStateConsistency = () => {
    // Log the current puzzle and state for debugging
    const currentPuzzleWord = puzzle.map(l => l.name).join('');
    console.log(`Verification for ${mode} mode:`);
    console.log(`- Current puzzle word: ${currentPuzzleWord} (${currentPuzzleWord.length} letters)`);
    console.log(`- Current game state: ${gameStateCurrent.status}`);
    console.log(`- Used letters: ${usedLetters.join(', ')}`);
    
    // Check if we're in a victory state
    if (gameStateCurrent.status === 'victory') {
      // Verify that all puzzle letters have been found
      const foundLetters = puzzle.filter(l => usedLetters.includes(l.name));
      console.log(`- Found ${foundLetters.length}/${puzzle.length} letters in puzzle`);
      
      if (foundLetters.length !== puzzle.length) {
        console.error("STATE INCONSISTENCY: Victory state but not all puzzle letters found!");
        console.log("Resetting game state to fix inconsistency...");
        
        // Force reset everything to a fresh state
        resetAndStartNewGame();
        return false;
      }
    }
    
    // Check if we're in a defeat state
    if (gameStateCurrent.status === 'defeat') {
      // Make sure the score actually exceeds the budget
      if (gameStateCurrent.score < gameStateCurrent.maxBudget) {
        console.error("STATE INCONSISTENCY: Defeat state but score is below max budget!");
        console.log("Resetting game state to fix inconsistency...");
        
        // Force reset everything to a fresh state
        resetAndStartNewGame();
        return false;
      }
    }
    
    // Check if we're in solving state but have actually won
    if (gameStateCurrent.status === 'solving') {
      const foundLetters = puzzle.filter(l => usedLetters.includes(l.name));
      if (foundLetters.length === puzzle.length) {
        console.error("STATE INCONSISTENCY: All letters found but not in victory state!");
        console.log("Updating state to victory...");
        
        // Update to victory state
        setfinalChosenLetters(usedLetters);
        setGameStateCurrent({ ...gameStateCurrent, status: 'victory' });
        return false;
      }
    }
    
    // Everything checks out
    return true;
  };

  // Debug check for "playing" vs "viewing" state
  useEffect(() => {
    if (gameStateCurrent.status !== 'solving') {
      console.log(`Game is currently in ${gameStateCurrent.status} state for ${mode} mode`);
      console.log(`Game is displaying puzzle: ${puzzle.map(l => l.name).join('')}`);
      console.log(`Used letters: ${usedLetters.join(', ')}`);
    } else {
      console.log(`Game is in solving state for ${mode} mode`);
      console.log(`Current puzzle: ${puzzle.map(l => l.name).join('')}`);
      console.log(`Progress: ${usedLetters.filter(l => puzzle.some(pl => pl.name === l)).length}/${puzzle.length} letters found`);
    }
  }, [gameStateCurrent.status, mode, puzzle, usedLetters]);

  // Verify game state consistency after component mounts
  useEffect(() => {
    setTimeout(() => {
      verifyGameStateConsistency();
    }, 500); // Small delay to ensure state is fully loaded
  }, []);

  // Effect to handle force new puzzle flag
  useEffect(() => {
    // This effect is now only needed as a backup mechanism
    // Most mode changes will be handled directly in the mode change effect above
    if (forceNewPuzzleFlag && !freshPuzzleLoadedRef.current) {
      console.log(`Force loading a new puzzle for ${mode} mode through flag mechanism`);
      
      // Get a completely fresh puzzle
      const newPuzzle = getPuzzle(mode);
      const puzzleWord = newPuzzle.map(l => l.name).join('');
      console.log(`Backup mechanism loaded puzzle for ${mode}:`, puzzleWord, `(${puzzleWord.length} letters)`);
      
      // Update the puzzle state
      setPuzzle(newPuzzle);
      
      // Reset the flag
      setForceNewPuzzleFlag(false);
      
      // Mark that we've loaded a fresh puzzle
      freshPuzzleLoadedRef.current = true;
    }
  }, [forceNewPuzzleFlag, mode]);

  // Critical: Update state when mode changes with improved reliability
  useEffect(() => {
    console.log(`Mode effect triggered: ${mode}`);
    
    // Skip if we've already loaded a fresh puzzle this render
    if (freshPuzzleLoadedRef.current) {
      console.log(`Skipping mode effect because fresh puzzle already loaded`);
      return;
    }
    
    // Always force a fresh puzzle when changing modes
    const timestamp = Date.now();
    const newPuzzle = getPuzzle(mode, timestamp);
    const puzzleWord = newPuzzle.map(l => l.name).join('');
    console.log(`New puzzle for ${mode}:`, puzzleWord, `(${puzzleWord.length} letters)`);
    
    // Reset other state - be careful about order
    const newGameState = getLocalStorageGameState(effectiveMode);
    console.log(`Game state for ${mode}:`, newGameState.status);
    
    // If there's any inconsistency, force everything to a fresh state
    if (newGameState.status !== 'solving') {
      // Check if the puzzle word matches the expected state
      const storedLetters = getLocalStorageUsedLetters(effectiveMode);
      const foundLetterCount = storedLetters.filter(l => 
        newPuzzle.some(pl => pl.name === l)
      ).length;
      
      if (foundLetterCount !== newPuzzle.length && newGameState.status === 'victory') {
        console.warn("State inconsistency detected: victory state doesn't match puzzle word");
        console.log("Forcing game state reset to solving");
        
        // Force reset everything
        resetPuzzleWord(mode);
        const freshPuzzle = getPuzzle(mode, Date.now() + 1000);
        setPuzzle(freshPuzzle);
        setGameStateCurrent({...gamestate});
        setfinalChosenLetters([]);
        setLetters(JSON.parse(JSON.stringify(data)));
        setUsedLetters([]);
        setPreselected({ value: '', status: false, key: '' });
        setHasUpdatedStats(false);
        
        // Skip the rest of this effect
        return;
      }
    }
    
    // Update state normally if no inconsistency detected
    setPuzzle(newPuzzle);
    setGameStateCurrent(newGameState);
    setfinalChosenLetters(getLocalStorageFinalChosenLetters(effectiveMode));
    setLetters(getLocalStorageLetters(effectiveMode));
    setUsedLetters(getLocalStorageUsedLetters(effectiveMode));
    setHasUpdatedStats(false);
    
    // Mark that we've loaded a fresh puzzle
    freshPuzzleLoadedRef.current = true;
  }, [effectiveMode, mode]);

  // Effect to load user stats for completed games
  useEffect(() => {
    // Only run for competitive mode and completed games
    if (!effectiveMode && 
        username !== 'casual_player' && 
        (gameStateCurrent.status === 'victory' || gameStateCurrent.status === 'defeat')) {
      
      // Load stats if we don't have them yet or if they're empty
      if (localStats.gamesPlayed === 0 && localStats.gamesWon === 0) {
        console.log("Stats are empty, loading from database...");
        loadUserStats();
      }
    }
  }, [gameStateCurrent.status, effectiveMode, username, localStats]);

  // Function to write game results to the database
  async function writeToDatabase(gameResult) {
    // Skip if in casual mode or using casual_player username
    if (effectiveMode || username === 'casual_player') {
      console.log('Skipping database update for casual mode or casual player');
      return;
    }
    
    // Check if this game result has already been logged
    if (hasGameResultBeenLogged(effectiveMode)) {
      console.log(`Game result already logged to database for this ${effectiveMode ? 'casual' : 'competitive'} game. Skipping update but loading stats.`);
      
      // Even if we don't update, make sure we load stats for display
      loadUserStats();
      return;
    }
    
    console.log(`Writing game result to database: ${gameResult} for user: ${username}`);
    
    try {
      // Calculate remaining budget
      const remainingBudget = gameStateCurrent.maxBudget - gameStateCurrent.score;
      
      // Update user stats with game result
      const updatedStats = await updateUserStats(
        username, 
        gameResult === 'victory', 
        remainingBudget,
        puzzle.length,
        usedLetters
      );
      
      // Update local state with new stats
      if (updatedStats) {
        setLocalStats({
          gamesPlayed: updatedStats.gamesPlayed || 0,
          gamesWon: updatedStats.gamesWon || 0,
          winningPercentage: updatedStats.winningPercentage || 0,
          averageBudgetRemaining: updatedStats.averageBudgetRemaining || 0,
          commonLetters: updatedStats.commonLetters || []
        });
        
        // Mark as updated to prevent multiple updates
        setHasUpdatedStats(true);
        
        // Mark this game result as logged to database
        markGameResultAsLogged(effectiveMode);
        
        console.log('Successfully updated user stats:', updatedStats);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Game completion tracking effect - this handles database updates
  useEffect(() => {
    // Only run for competitive mode and when status changes to victory or defeat
    if (!effectiveMode && username !== 'casual_player' && 
        (gameStateCurrent.status === 'victory' || gameStateCurrent.status === 'defeat')) {
      
      console.log(`Game completed with status: ${gameStateCurrent.status}`);
      
      // Call writeToDatabase with the appropriate result
      writeToDatabase(gameStateCurrent.status);
    }
  }, [gameStateCurrent.status, effectiveMode, username]);

  // Save letters to mode-specific localStorage
  useEffect(() => {
    if (letters) {
      const modeKey = effectiveMode ? 'casualLetters' : 'competitiveLetters';
      localStorage.setItem(modeKey, encryptObject(letters));
    }
  }, [letters, effectiveMode]);
  
  // Victory/defeat detection and localStorage saving
  useEffect(() => {
    // Save state to localStorage using mode-specific keys
    if (finalChosenLetters && usedLetters && gameStateCurrent) {
      const finalChosenKey = effectiveMode ? 'casualFinalChosenLetters' : 'competitiveFinalChosenLetters';
      const usedLettersKey = effectiveMode ? 'casualUsedLetters' : 'competitiveUsedLetters';
      const gameStateKey = effectiveMode ? 'casualGameStateCurrent' : 'competitiveGameStateCurrent';
      
      localStorage.setItem(finalChosenKey, encryptObject(finalChosenLetters));
      localStorage.setItem('preselected', encryptObject(preselected));
      localStorage.setItem(usedLettersKey, encryptObject(usedLetters));
      localStorage.setItem(gameStateKey, encryptObject(gameStateCurrent));
    }
    
    // Check for defeat
    if (gameStateCurrent.status === 'solving' && gameStateCurrent.score >= gameStateCurrent.maxBudget) {
      console.log("DEFEAT CONDITION MET");
      setfinalChosenLetters(usedLetters);
      setGameStateCurrent({ ...gameStateCurrent, status: 'defeat' });
      // Database write happens in the separate effect
      setUsedLetters([
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      ]);
    }
    
    // Check for victory - enhanced with debug logging
    if (gameStateCurrent.status === 'solving' && puzzle && puzzle.length > 0) {
      let victoryTracker = 0;
      let missingLetters = [];
      
      // Count correctly guessed letters and track missing ones
      puzzle.forEach((l) => {
        if (usedLetters.indexOf(l.name) > -1) {
          victoryTracker += 1;
        } else {
          missingLetters.push(l.name);
        }
      });

      // Debug what's happening with victory detection
      console.log(`Victory check: ${victoryTracker}/${puzzle.length} letters found`);
      if (missingLetters.length > 0) {
        console.log(`Missing letters: ${missingLetters.join(', ')}`);
      }

      // Check if all letters have been found
      if (victoryTracker === puzzle.length) {
        console.log("VICTORY CONDITION MET!");
        setfinalChosenLetters(usedLetters);
        setGameStateCurrent({ ...gameStateCurrent, status: 'victory' });
        // Database write happens in the separate effect
      }
    }
  }, [gameStateCurrent, usedLetters, preselected, finalChosenLetters, puzzle, effectiveMode]);

  const scoreChange = (i) => {
    scoreInc = 0;
    let isCorrectGuess = false;
    
    // DEBUG: Check which puzzle word we're using
    const currentPuzzleWord = puzzle.map(l => l.name).join('');
    console.log(`Scoring against puzzle word: ${currentPuzzleWord} in ${effectiveMode ? 'casual' : 'competitive'} mode`);
    
    // Check if the letter is in the puzzle
    puzzle.forEach((puzLetter) => {
      if (puzLetter.name === letters[i].name) {
        isCorrectGuess = true;
        console.log(`Letter ${letters[i].name} found in puzzle word`);
      }
    });
    
    // If not a correct guess, add the letter's cost to the score
    if (!isCorrectGuess) {
      scoreInc = letters[i].cost;
      console.log(`Letter ${letters[i].name} not found in puzzle. Adding cost: ${scoreInc}`);
    } else {
      console.log(`Letter ${letters[i].name} is correct! No cost added.`);
    }
    
    var s = gameStateCurrent.score + scoreInc;
    setGameStateCurrent({ ...gameStateCurrent, score: s });
  }

  const changeUsed = (index) => {
    scoreChange(index);

    const newArray = [...letters];
    setUsedLetters([...usedLetters, newArray[index].name]);
    newArray[index].isUsed = true;
    newArray[index].isHovered = false;
    setPreselected({ value: '', status: false, key: '' });
    setLetters(newArray);
  }
  
  const changeHover = (index) => {
    // Make a copy of the letters array
    const newArray = [...letters];
    
    // Add debug logging
    console.log(`changeHover called with index: ${index}`);
    
    if (index >= 0 && index < newArray.length) {
      console.log(`Letter at index ${index}: ${newArray[index].name} (id: ${newArray[index].id})`);
    }
    
    // Reset any previously hovered letter
    newArray.forEach(letter => {
      if (letter.isHovered) {
        console.log(`Resetting hover on letter: ${letter.name} (id: ${letter.id})`);
        letter.isHovered = false;
      }
    });
    
    // Set the new hovered letter if index is valid
    if (index >= 0 && index < newArray.length && !newArray[index].isUsed) {
      const letter = newArray[index];
      console.log(`Setting hover on letter: ${letter.name} (id: ${letter.id})`);
      
      letter.isHovered = true;
      setPreselected({ 
        value: letter.name, 
        status: true, 
        key: index 
      });
    } else {
      if (index >= 0) {
        console.log(`Cannot hover letter at index ${index}. ${
          index >= newArray.length 
            ? `Index out of bounds (max: ${newArray.length - 1})` 
            : newArray[index].isUsed 
              ? `Letter is already used`
              : `Unknown reason`
        }`);
      }
      
      setPreselected({ value: '', status: false, key: '' });
    }
    
    setLetters(newArray);
  }
  
  // Helper function to check if a letter is in the puzzle
  const isLetterInPuzzle = (letter) => {
    return puzzle.some(puzzleLetter => puzzleLetter.name === letter);
  }

  // Render game based on current status
  if (gameStateCurrent.status === 'solving') {
    return (
      <section className="game-container">
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} casualMode={effectiveMode} />
        
        <BatMeter 
          currentSpent={gameStateCurrent.score} 
          maxBudget={gameStateCurrent.maxBudget}
          gameStatus={gameStateCurrent.status} 
        />        
        
        <LetterCarousel 
          letters={letters}
          usedLetters={usedLetters}
          onLetterSelect={changeHover}
          onLetterConfirm={changeUsed}
          preselected={preselected}
          casualMode={effectiveMode}
        />
      </section>
    )
  } 
  else if (gameStateCurrent.status === 'victory') {
    return (
      <section className="game-container">
        <AnswerLetters 
          s={gameStateCurrent.status} 
          u={usedLetters} 
          casualMode={effectiveMode} 
          key={`puzzle-${puzzleVersion}`} // Add key with version to force re-render
        />
        <BatMeter 
          currentSpent={gameStateCurrent.score} 
          maxBudget={gameStateCurrent.maxBudget} 
          gameStatus={gameStateCurrent.status}
        />
        
        <div className="victory-message">
          <h3>The Hollow is Friendly to Those Who Win</h3>
          
          {!effectiveMode && (
            <div className="stats-summary">
              <p>Games won: {localStats.gamesWon} ({localStats.winningPercentage}%)</p>
              <p>Avg. budget remaining: {localStats.averageBudgetRemaining}</p>
              {localStats.commonLetters && localStats.commonLetters.length > 0 && (
                <p>Your favorite letters: {localStats.commonLetters.join(', ')}</p>
              )}
            </div>
          )}
        </div>
        
        <button
          className='play-again-btn-victory'
          onClick={() => {
            // Completely reset localStorage first
            localStorage.removeItem(`${mode}PuzzleWord`);
            localStorage.removeItem(`${mode}PuzzleLetters`);
            localStorage.removeItem(`${mode}GameStateCurrent`);
            localStorage.removeItem(`${mode}FinalChosenLetters`);
            localStorage.removeItem(`${mode}UsedLetters`);
            localStorage.removeItem(`${mode}Letters`);
            localStorage.removeItem(`${mode}GameLogged`);
            
            // Use force reset function from puzzle.js with cache busting timestamp
            const resetTimestamp = Date.now() + Math.floor(Math.random() * 10000);
            forceNewPuzzle(mode);
            
            // Call our enhanced reset function
            resetAndStartNewGame();
            
            // Add debugging
            console.log("Play Again clicked in victory state");
          }}
        >
          Play Again
        </button>
        
        <div>
          <h3>Your Guesses In Order:</h3>
        </div>
        <div className="used-letters-grid">
          {finalChosenLetters.map((letter, index) => {
            const isCorrect = isLetterInPuzzle(letter);
            const letterClass = isCorrect ? "used-letter hit" : "used-letter";
            
            return (
              <div key={index} className={letterClass}>
                {letter}
              </div>
            );
          })}
        </div>
      </section>
    )
  }
  else { // Defeat state
    return (
      <section className="game-container">
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} casualMode={effectiveMode} />
        
        <BatMeter 
          currentSpent={gameStateCurrent.score} 
          maxBudget={gameStateCurrent.maxBudget}
          gameStatus={gameStateCurrent.status}  
        />
        
        <div className="defeat-message">
          <h3>The Hollow Has Claimed Another Victim</h3>
          {!effectiveMode && (
            <div className="stats-summary">
              <p>Games played: {localStats.gamesPlayed}</p>
              <p>Win rate: {localStats.winningPercentage}%</p>
              {localStats.commonLetters && localStats.commonLetters.length > 0 && (
                <p>Your favorite letters: {localStats.commonLetters.join(', ')}</p>
              )}
            </div>
          )}
        </div>
        
        <button
          className='play-again-btn'
          onClick={() => {
            // Generate unique timestamp for cache busting
            const timestamp = Date.now() + Math.floor(Math.random() * 10000);
            
            // Completely reset localStorage first
            localStorage.removeItem(`${mode}PuzzleWord`);
            localStorage.removeItem(`${mode}PuzzleLetters`);
            localStorage.removeItem(`${mode}GameStateCurrent`);
            localStorage.removeItem(`${mode}FinalChosenLetters`);
            localStorage.removeItem(`${mode}UsedLetters`);
            localStorage.removeItem(`${mode}Letters`);
            localStorage.removeItem(`${mode}GameLogged`);
            
            // Force a completely new puzzle by calling forceNewPuzzle with timestamp
            const newPuzzle = forceNewPuzzle(mode);
            console.log("Forced new puzzle word:", newPuzzle.map(l => l.name).join(''));
            
            // Apply the new puzzle to state immediately
            setPuzzle(newPuzzle);
            
            // Reset game state
            setGameStateCurrent({...gamestate});
            setfinalChosenLetters([]);
            setLetters(JSON.parse(JSON.stringify(data)));
            setUsedLetters([]);
            setPreselected({ value: '', status: false, key: '' });
            
            // Force AnswerLetters component to re-render with a new key
            setPuzzleVersion(prev => prev + 1);
            
            // Add debugging
            console.log("Play Again clicked in defeat state");
          }}
        >
          Play Again
        </button>
        
        <div>
          <h3>Your Guesses In Order:</h3>
        </div>
        <div className="used-letters-grid">
          {finalChosenLetters.map((letter, index) => {
            const isCorrect = isLetterInPuzzle(letter);
            const letterClass = isCorrect ? "used-letter hit" : "used-letter";
            
            return (
              <div key={index} className={letterClass}>
                {letter}
              </div>
            );
          })}
        </div>
      </section>
    )
  }
}
export default Letters