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
  }
  
  if (mode === 'casual' || mode === 'both') {
    localStorage.removeItem('casualGameStateCurrent');
    localStorage.removeItem('casualPuzzleLetters');
    localStorage.removeItem('casualFinalChosenLetters');
    localStorage.removeItem('casualUsedLetters');
  }
  
  // Always reset these
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
    return decryptObject(encryptedUsedLetters) || [];
  } else {
    return [];
  }
};


const getLocalStorageGameState = (casualMode) => {
  const key = casualMode ? 'casualGameStateCurrent' : 'competitiveGameStateCurrent';
  const encryptedGameState = localStorage.getItem(key);
  if (encryptedGameState) {
    return decryptObject(encryptedGameState) || gamestate;
  } else {
    return gamestate;
  }
};

const getLocalStorageFinalChosenLetters = (casualMode) => {
  const key = casualMode ? 'casualFinalChosenLetters' : 'competitiveFinalChosenLetters';
  const encryptedFinalLetters = localStorage.getItem(key);
  if (encryptedFinalLetters) {
    return decryptObject(encryptedFinalLetters) || [];
  } else {
    return [];
  }
};

const getLocalStorageLetters = () => {
  const encryptedLetters = localStorage.getItem('letters')
  if (encryptedLetters) {
    return decryptObject(encryptedLetters) || data
  } else {
    return data
  }
}

const getLocalStoragePreselected = () => {
  const encryptedPreselected = localStorage.getItem('preselected')
  if (encryptedPreselected) {
    return decryptObject(encryptedPreselected) || {
      status: false,
      value: '',
      key: '',
    }
  } else {
    return {
      status: false,
      value: '',
      key: '',
    }
  }
}

var scoreInc = 0

const Letters = ({ casualMode = false, username = '' }) => {
  // Get the mode as a string for easier referencing
  const mode = casualMode ? 'casual' : 'competitive';
  
  // Initialize puzzle for this mode (replace static import with dynamic function)
  const [puzzle, setPuzzle] = useState(() => getPuzzle(mode));
  
  // Use mode-specific localStorage
  const [gameStateCurrent, setGameStateCurrent] = useState(
    getLocalStorageGameState(casualMode)
  );
  const [localStats, setLocalStats] = useState({ averageBudgetRemaining: 0, winningPercentage: 0 });
  const [finalChosenLetters, setfinalChosenLetters] = useState(
    getLocalStorageFinalChosenLetters(casualMode)
  );
  const [letters, setLetters] = useState(getLocalStorageLetters());
  const [usedLetters, setUsedLetters] = useState(getLocalStorageUsedLetters(casualMode));
  const [preselected, setPreselected] = useState(getLocalStoragePreselected());
  const [hasUpdatedStats, setHasUpdatedStats] = useState(false);

  // Save state to localStorage with mode-specific keys
  useEffect(() => {
    localStorage.setItem('letters', encryptObject(letters));
  }, [letters]);
  
  useEffect(() => {
    // Save state to localStorage using mode-specific keys
    const finalChosenKey = casualMode ? 'casualFinalChosenLetters' : 'competitiveFinalChosenLetters';
    const usedLettersKey = casualMode ? 'casualUsedLetters' : 'competitiveUsedLetters';
    const gameStateKey = casualMode ? 'casualGameStateCurrent' : 'competitiveGameStateCurrent';
    
    localStorage.setItem(finalChosenKey, encryptObject(finalChosenLetters));
    localStorage.setItem('preselected', encryptObject(preselected));
    localStorage.setItem(usedLettersKey, encryptObject(usedLetters));
    localStorage.setItem(gameStateKey, encryptObject(gameStateCurrent));
    
    // Check for defeat
    if (gameStateCurrent.status === 'solving' && gameStateCurrent.score >= gameStateCurrent.maxBudget) {
      setfinalChosenLetters(usedLetters);
      setGameStateCurrent({ ...gameStateCurrent, status: 'defeat' });
      writeToDatabase('defeat');
      setUsedLetters([
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      ]);
    }
    
    // Check for victory
    if (gameStateCurrent.status === 'solving') {
      let victoryTracker = 0;
      puzzle.forEach((l) => {
        if (usedLetters.indexOf(l.name) > -1) {
          victoryTracker += 1;
        }
      });

      if (victoryTracker === puzzle.length) {
        setfinalChosenLetters(usedLetters);
        setGameStateCurrent({ ...gameStateCurrent, status: 'victory' });
        writeToDatabase('victory');
      }
    }
  }, [gameStateCurrent, usedLetters, preselected, finalChosenLetters, puzzle, casualMode]);
  
  // Function to write game results to the database
  async function writeToDatabase(gameResult) {
    // Game status is handled by the updateStats effect
    if (casualMode || username === 'casual_player') {
      return; // Don't update database for casual play
    }
  }

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

  function handleClick() {
    // Placeholder for any click handling
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
  casualMode={casualMode} // Add this prop
/>
      </section>
    )
  } 
  else if (gameStateCurrent.status === 'victory') {
    return (
      <section className="game-container">
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        
        <BatMeter 
          currentSpent={gameStateCurrent.score} 
          maxBudget={gameStateCurrent.maxBudget} 
          gameStatus={gameStateCurrent.status}
        />
        
        <div className="victory-message">
          <h3>The Hollow is Friendly to Those Who Win</h3>
          
          {!casualMode && localStats && (
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
            ResetGame()
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
  else {
    return (
      <section className="game-container">
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        
        <BatMeter 
          currentSpent={gameStateCurrent.score} 
          maxBudget={gameStateCurrent.maxBudget}
          gameStatus={gameStateCurrent.status}  
        />
        
        <div className="defeat-message">
          <h3>The Hollow Has Claimed Another Victim</h3>
          {!casualMode && localStats && (
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
            ResetGame()
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