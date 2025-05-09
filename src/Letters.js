// src/Letters.js
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
import { updateUserStats } from './userManagement'


// Updated ResetGame function
const ResetGame = (mode = 'both') => {
  // Reset the appropriate localStorage items
  if (mode === 'competitive' || mode === 'both') {
    localStorage.removeItem('competitiveGameStateCurrent');
    localStorage.removeItem('competitivePuzzleLetters');
    localStorage.removeItem('competitiveFinalChosenLetters');
    localStorage.removeItem('competitiveUsedLetters');
    localStorage.removeItem('competitiveLetters');
  }
  
  if (mode === 'casual' || mode === 'both') {
    localStorage.removeItem('casualGameStateCurrent');
    localStorage.removeItem('casualPuzzleLetters');
    localStorage.removeItem('casualFinalChosenLetters');
    localStorage.removeItem('casualUsedLetters');
    localStorage.removeItem('casualLetters');
  }
  
  // Always reset these shared state items
  localStorage.removeItem('letters');
  localStorage.removeItem('preselected');
  
  // Reset the puzzle word(s)
  resetPuzzleWord(mode);
  
  // Reload the page to start fresh
  window.location.reload(false);
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
  return gamestate;
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
  const [puzzle, setPuzzle] = useState(() => getPuzzle(mode));
  
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

  // Critical: Update state when mode changes
  useEffect(() => {
    console.log(`Mode changed to: ${casualMode ? 'casual' : 'competitive'}`);
    setPuzzle(getPuzzle(mode));
    setGameStateCurrent(getLocalStorageGameState(casualMode));
    setfinalChosenLetters(getLocalStorageFinalChosenLetters(casualMode));
    setLetters(getLocalStorageLetters(casualMode));
    setUsedLetters(getLocalStorageUsedLetters(casualMode));
    setHasUpdatedStats(false); // Reset this when mode changes
  }, [casualMode, mode]);

  // Function to write game results to the database
  async function writeToDatabase(gameResult) {
    // Skip if in casual mode or using casual_player username
    if (casualMode || username === 'casual_player') {
      console.log('Skipping database update for casual mode or casual player');
      return;
    }
    
    console.log(`Writing game result to database: ${gameResult} for user: ${username}`);
    
    try {
      // Only update if we haven't already updated stats for this game
      if (!hasUpdatedStats) {
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
          
          console.log('Successfully updated user stats:', updatedStats);
        }
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
      setfinalChosenLetters(usedLetters);
      setGameStateCurrent({ ...gameStateCurrent, status: 'defeat' });
      // Database write happens in the separate effect
      setUsedLetters([
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      ]);
    }
    
    // Check for victory
    if (gameStateCurrent.status === 'solving' && puzzle && puzzle.length > 0) {
      let victoryTracker = 0;
      puzzle.forEach((l) => {
        if (usedLetters.indexOf(l.name) > -1) {
          victoryTracker += 1;
        }
      });

      if (victoryTracker === puzzle.length) {
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
    
    // Reset any previously hovered letter
    newArray.forEach(letter => {
      letter.isHovered = false;
    });
    
    // Set the new hovered letter if index is valid
    if (index >= 0 && index < newArray.length && !newArray[index].isUsed) {
      newArray[index].isHovered = true;
      setPreselected({ 
        value: newArray[index].name, 
        status: true, 
        key: index 
      });
    } else {
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
          
          {!casualMode && localStats && (
            <div className="stats-summary">
              <p>Games Won: {localStats.gamesWon} ({localStats.winningPercentage}%)</p>
              <p>Avg. Budget Remaining: {localStats.averageBudgetRemaining}</p>
              {localStats.commonLetters && localStats.commonLetters.length > 0 && (
                <p>Your Favorite Letters: {localStats.commonLetters.join(', ')}</p>
              )}
            </div>
          )}
        </div>
        
        <button
          className='play-again-btn-victory'
          onClick={() => {
            ResetGame(mode) // Only reset the current mode
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
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} casualMode={casualMode} />
        
        <BatMeter 
          currentSpent={gameStateCurrent.score} 
          maxBudget={gameStateCurrent.maxBudget}
          gameStatus={gameStateCurrent.status}  
        />
        
        <div className="defeat-message">
          <h3>The Hollow Has Claimed Another Victim</h3>
          {!casualMode && localStats && (
            <div className="stats-summary">
              <p>Games Won: {localStats.gamesWon} ({localStats.winningPercentage}%)</p>
              <p>Avg. Budget Remaining: {localStats.averageBudgetRemaining}</p>
              {localStats.commonLetters && localStats.commonLetters.length > 0 && (
                <p>Your Favorite Letters: {localStats.commonLetters.join(', ')}</p>
              )}
            </div>
          )}
        </div>
        
        <button
          className='play-again-btn'
          onClick={() => {
            ResetGame(mode) // Only reset the current mode
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