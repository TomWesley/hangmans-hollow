// src/Letters.js
import React from 'react'
import Letter from './Letter'
import { useState, useEffect } from 'react'
import data from './data'
import AnswerLetters from './AnswerLetters'
import puz from './puzzle'
import gamestate from './gamestate'
import BatMeter from './BatMeter'
import LetterCarousel from './LetterCarousel'
import { resetPuzzleWord } from './puzzle'
import { encrypt, decrypt, encryptObject, decryptObject } from './encryption'
import { updateUserStats } from './userManagement'


// Updated ResetGame function
const ResetGame = () => {
  localStorage.removeItem('gameStateCurrent')
  localStorage.removeItem('puzzleLetters')
  localStorage.removeItem('finalChosenLetters')
  localStorage.removeItem('usedLetters')
  localStorage.removeItem('letters')
  localStorage.removeItem('preselected')
  
  // Reset the puzzle word
  resetPuzzleWord();
  
  // Reload the page to start fresh
  window.location.reload(false)
}

// Local storage helper functions
const getLocalStorageUsedLetters = () => {
  const encryptedUsedLetters = localStorage.getItem('usedLetters')
  if (encryptedUsedLetters) {
    return decryptObject(encryptedUsedLetters) || []
  } else {
    return []
  }
}

const getLocalStorageGameState = () => {
  const encryptedGameState = localStorage.getItem('gameStateCurrent')
  if (encryptedGameState) {
    return decryptObject(encryptedGameState) || gamestate
  } else {
    return gamestate
  }
}

const getLocalStorageFinalChosenLetters = () => {
  const encryptedFinalLetters = localStorage.getItem('finalChosenLetters')
  if (encryptedFinalLetters) {
    return decryptObject(encryptedFinalLetters) || []
  } else {
    return []
  }
}

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
  const [gameStateCurrent, setGameStateCurrent] = useState(
    getLocalStorageGameState()
  )
  const [localStats, setLocalStats] = useState({ 
    averageBudgetRemaining: 0, 
    winningPercentage: 0 
  })
  const [finalChosenLetters, setfinalChosenLetters] = useState(
    getLocalStorageFinalChosenLetters
  )
  const [letters, setLetters] = useState(getLocalStorageLetters())
  const [usedLetters, setUsedLetters] = useState(getLocalStorageUsedLetters())
  const [preselected, setPreselected] = useState(getLocalStoragePreselected())
  const [gameEnded, setGameEnded] = useState(false) // Track if game has ended for stats update
  const [hasUpdatedStats, setHasUpdatedStats] = useState(false) // Prevent multiple stat updates

  useEffect(() => {
    localStorage.setItem('letters', encryptObject(letters))
  }, [letters])
  
  useEffect(() => {
    // Save current game state to localStorage
    localStorage.setItem('finalChosenLetters', encryptObject(finalChosenLetters))
    localStorage.setItem('preselected', encryptObject(preselected))
    localStorage.setItem('usedLetters', encryptObject(usedLetters))
    localStorage.setItem('gameStateCurrent', encryptObject(gameStateCurrent))
    
    // Check for defeat
    if (gameStateCurrent.status === 'solving' && gameStateCurrent.score >= gameStateCurrent.maxBudget) {
      setfinalChosenLetters(usedLetters)
      setGameStateCurrent({ ...gameStateCurrent, status: 'defeat' })
      writeToDatabase('defeat')
      setUsedLetters([
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      ])
    }
    
    // Check for victory
    if (gameStateCurrent.status === 'solving') {
      let victoryTracker = 0;
      puz.forEach((l) => {
        if (usedLetters.indexOf(l.name) > -1) {
          victoryTracker += 1;
        }
      });

      if (victoryTracker === puz.length) {
        setfinalChosenLetters(usedLetters);
        setGameStateCurrent({ ...gameStateCurrent, status: 'victory' });
        writeToDatabase('victory');
      }
    }
  }, [gameStateCurrent, usedLetters, preselected, finalChosenLetters]);
  
  // Effect to update stats when game ends
  useEffect(() => {
    const updateStats = async () => {
      // Only update stats once per game and only in competitive mode
      if (hasUpdatedStats || casualMode || username === 'casual_player') {
        return;
      }
      
      // Check if game has ended (victory or defeat)
      if (gameStateCurrent.status === 'victory' || gameStateCurrent.status === 'defeat') {
        try {
          // Calculate budget remaining
          const budgetRemaining = gameStateCurrent.maxBudget - gameStateCurrent.score;
          
          // Get puzzle length
          const puzzleLength = puz.length;
          
          // Update user stats
          const updatedStats = await updateUserStats(
            username,
            gameStateCurrent.status === 'victory',
            budgetRemaining,
            puzzleLength,
            usedLetters
          );
          
          if (updatedStats) {
            setLocalStats(updatedStats);
          }
          
          // Mark stats as updated
          setHasUpdatedStats(true);
        } catch (error) {
          console.error('Error updating stats:', error);
        }
      }
    };
    
    updateStats();
  }, [gameStateCurrent.status, casualMode, username, gameStateCurrent.score, 
      gameStateCurrent.maxBudget, usedLetters, hasUpdatedStats]);
  
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
    puz.forEach((puzLetter) => {
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
    return puz.some(puzzleLetter => puzzleLetter.name === letter);
  }

  // Render game based on current status
  if (gameStateCurrent.status === 'solving') {
    return (
      <section className="game-container">
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        <BatMeter currentSpent={gameStateCurrent.score} maxBudget={gameStateCurrent.maxBudget} />
        
        <LetterCarousel 
          letters={letters}
          usedLetters={usedLetters}
          onLetterSelect={changeHover}
          onLetterConfirm={changeUsed}
          preselected={preselected}
        />
      </section>
    )
  } 
  else if (gameStateCurrent.status === 'victory') {
    return (
      <section className="game-container">
        <div>
          <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        </div>
        
        {/* Important: Structure this exactly like in the solving state */}
        <BatMeter 
          currentSpent={gameStateCurrent.score} 
          maxBudget={gameStateCurrent.maxBudget} 
        />
        
        {/* New victory message replacing the letter carousel */}
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
        
        {/* Play Again button replacing the confirm button */}
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
            // Check if the letter is in the puzzle to determine the class
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
        <div className='defeat'>
          <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        </div>
        <div className='bat-meter-container'>
          <BatMeter currentSpent={gameStateCurrent.score} maxBudget={gameStateCurrent.maxBudget} />
        </div>
        
        {/* New defeat message replacing the letter carousel */}
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
        
        {/* Play Again button replacing the confirm button */}
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
            // Check if the letter is in the puzzle to determine the class
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