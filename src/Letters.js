// src/Letters.js - With fix for stats display on completed games
import React from 'react'
import Letter from './Letter'
import { useState, useEffect } from 'react'
import data from './data'
import AnswerLetters from './AnswerLetters'
import { getPuzzle, resetPuzzleWord } from './puzzle';
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
    localStorage.removeItem('casualGameLogged'); // Clear the game logged flag
  }
  
  // Always reset these shared state items
  localStorage.removeItem('preselected');
  localStorage.removeItem('letters'); // Clear the legacy letters item too
  
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

var scoreInc = 0

const Letters = ({ casualMode = false, username = '' }) => {
  console.log(`Rendering Letters component with casualMode: ${casualMode}, username: ${username}`);
  
  // Get the mode as a string for easier referencing
  const mode = casualMode ? 'casual' : 'competitive';
  
  // Initialize puzzle for this mode
  const [puzzle, setPuzzle] = useState(() => {
    const newPuzzle = getPuzzle(mode);
    console.log(`Initial puzzle for ${mode}:`, newPuzzle.map(l => l.name).join(''));
    return newPuzzle;
  });
  
  // Use mode-specific localStorage
  const [gameStateCurrent, setGameStateCurrent] = useState(() => 
    getLocalStorageGameState(casualMode)
  );
  
  const [localStats, setLocalStats] = useState({ 
    gamesPlayed: 0,
    gamesWon: 0,
    averageBudgetRemaining: 0, 
    winningPercentage: 0,
    commonLetters: []
  });
  
  const [finalChosenLetters, setfinalChosenLetters] = useState(() => 
    getLocalStorageFinalChosenLetters(casualMode)
  );
  
  const [letters, setLetters] = useState(() => 
    getLocalStorageLetters(casualMode)
  );
  
  const [usedLetters, setUsedLetters] = useState(() => 
    getLocalStorageUsedLetters(casualMode)
  );
  
  const [preselected, setPreselected] = useState(() =>
    getLocalStoragePreselected()
  );
  
  const [hasUpdatedStats, setHasUpdatedStats] = useState(false);

  // Function to load user stats without updating the database
  const loadUserStats = async () => {
    // Skip if in casual mode or using casual_player username
    if (casualMode || username === 'casual_player') {
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

  // Function to reset the game and start a new one
  const resetAndStartNewGame = () => {
    console.log("Starting a new game...");
    
    // Reset localStorage for the current mode without page reload
    ResetGame(mode, false);
    
    // Get a fresh puzzle for the current mode
    const newPuzzle = getPuzzle(mode);
    console.log(`New puzzle generated for ${mode} mode:`, 
                newPuzzle.map(l => l.name).join(''));
    
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
    
    console.log("Game state reset complete");
  };

  // Critical: Update state when mode changes
  useEffect(() => {
    console.log(`Mode changed to: ${casualMode ? 'casual' : 'competitive'}`);
    
    // Get a new puzzle for this mode
    const newPuzzle = getPuzzle(mode);
    console.log(`New puzzle for ${mode}:`, newPuzzle.map(l => l.name).join(''));
    setPuzzle(newPuzzle);
    
    // Reset other state
    setGameStateCurrent(getLocalStorageGameState(casualMode));
    setfinalChosenLetters(getLocalStorageFinalChosenLetters(casualMode));
    setLetters(getLocalStorageLetters(casualMode));
    setUsedLetters(getLocalStorageUsedLetters(casualMode));
    setHasUpdatedStats(false); // Reset this when mode changes
  }, [casualMode, mode]);

  // Effect to load user stats for completed games
  useEffect(() => {
    // Only run for competitive mode and completed games
    if (!casualMode && 
        username !== 'casual_player' && 
        (gameStateCurrent.status === 'victory' || gameStateCurrent.status === 'defeat')) {
      
      // Load stats if we don't have them yet or if they're empty
      if (localStats.gamesPlayed === 0 && localStats.gamesWon === 0) {
        console.log("Stats are empty, loading from database...");
        loadUserStats();
      }
    }
  }, [gameStateCurrent.status, casualMode, username, localStats]);

  // Function to write game results to the database
  async function writeToDatabase(gameResult) {
    // Skip if in casual mode or using casual_player username
    if (casualMode || username === 'casual_player') {
      console.log('Skipping database update for casual mode or casual player');
      return;
    }
    
    // Check if this game result has already been logged
    if (hasGameResultBeenLogged(casualMode)) {
      console.log(`Game result already logged to database for this ${casualMode ? 'casual' : 'competitive'} game. Skipping update but loading stats.`);
      
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
        markGameResultAsLogged(casualMode);
        
        console.log('Successfully updated user stats:', updatedStats);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Game completion tracking effect - this handles database updates
  useEffect(() => {
    // Only run for competitive mode and when status changes to victory or defeat
    if (!casualMode && username !== 'casual_player' && 
        (gameStateCurrent.status === 'victory' || gameStateCurrent.status === 'defeat')) {
      
      console.log(`Game completed with status: ${gameStateCurrent.status}`);
      
      // Call writeToDatabase with the appropriate result
      writeToDatabase(gameStateCurrent.status);
    }
  }, [gameStateCurrent.status, casualMode, username]);

  // Save letters to mode-specific localStorage
  useEffect(() => {
    if (letters) {
      const modeKey = casualMode ? 'casualLetters' : 'competitiveLetters';
      localStorage.setItem(modeKey, encryptObject(letters));
    }
  }, [letters, casualMode]);
  
  // Victory/defeat detection and localStorage saving
  useEffect(() => {
    // Save state to localStorage using mode-specific keys
    if (finalChosenLetters && usedLetters && gameStateCurrent) {
      const finalChosenKey = casualMode ? 'casualFinalChosenLetters' : 'competitiveFinalChosenLetters';
      const usedLettersKey = casualMode ? 'casualUsedLetters' : 'competitiveUsedLetters';
      const gameStateKey = casualMode ? 'casualGameStateCurrent' : 'competitiveGameStateCurrent';
      
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
  }, [gameStateCurrent, usedLetters, preselected, finalChosenLetters, puzzle, casualMode]);

  const scoreChange = (i) => {
    scoreInc = 0;
    let isCorrectGuess = false;
    
    // Check if the letter is in the puzzle
    puzzle.forEach((puzLetter) => {
      if (puzLetter.name === letters[i].name) {
        isCorrectGuess = true;
      }
    });
    
    // If not a correct guess, add the letter's cost to the score
    if (!isCorrectGuess) {
      scoreInc = letters[i].cost;
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
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} casualMode={casualMode} />
        
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
          casualMode={casualMode}
        />
      </section>
    )
  } 
  else if (gameStateCurrent.status === 'victory') {
    return (
      <section className="game-container">
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} casualMode={casualMode} />
        
        <BatMeter 
          currentSpent={gameStateCurrent.score} 
          maxBudget={gameStateCurrent.maxBudget} 
          gameStatus={gameStateCurrent.status}
        />
        
        <div className="victory-message">
          <h3>The Hollow is Friendly to Those Who Win</h3>
          
          {!casualMode && (
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
          onClick={resetAndStartNewGame}
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
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} casualMode={casualMode} />
        
        <BatMeter 
          currentSpent={gameStateCurrent.score} 
          maxBudget={gameStateCurrent.maxBudget}
          gameStatus={gameStateCurrent.status}  
        />
        
        <div className="defeat-message">
          <h3>The Hollow Has Claimed Another Victim</h3>
          {!casualMode && (
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
          onClick={resetAndStartNewGame}
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