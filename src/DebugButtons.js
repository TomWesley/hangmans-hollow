// src/DebugButtons.js
import React from 'react';
import { encrypt, decrypt, encryptObject, decryptObject } from './encryption';
import puzzle from './puzzle';

const DebugButtons = () => {
  // Function to trigger victory screen
  const triggerVictory = () => {
    try {
      // Get current game state
      const gameStateCurrent = decryptObject(localStorage.getItem('gameStateCurrent'));
      if (!gameStateCurrent) return;
      
      // Get all puzzle letters from the imported puzzle
      const allPuzzleLetters = puzzle.map(letter => letter.name);
      
      // Save used letters to localStorage using your encryption
      localStorage.setItem('usedLetters', encryptObject(allPuzzleLetters));
      
      // Set game state to victory
      gameStateCurrent.status = 'victory';
      localStorage.setItem('gameStateCurrent', encryptObject(gameStateCurrent));
      
      // Set final chosen letters
      localStorage.setItem('finalChosenLetters', encryptObject(allPuzzleLetters));
      
      // Reload page to show victory screen
      window.location.reload(false);
    } catch (error) {
      console.error('Error triggering victory:', error);
    }
  };
  
  // Function to trigger defeat screen
  const triggerDefeat = () => {
    try {
      // Get current game state
      const gameStateCurrent = decryptObject(localStorage.getItem('gameStateCurrent'));
      if (!gameStateCurrent) return;
      
      // Get current used letters
      const usedLetters = decryptObject(localStorage.getItem('usedLetters')) || [];
      
      // Set game state to defeat and max out the score
      gameStateCurrent.status = 'defeat';
      gameStateCurrent.score = gameStateCurrent.maxBudget; // Set score to max budget
      localStorage.setItem('gameStateCurrent', encryptObject(gameStateCurrent));
      
      // Save final chosen letters
      localStorage.setItem('finalChosenLetters', encryptObject(usedLetters));
      
      // Reload page to show defeat screen
      window.location.reload(false);
    } catch (error) {
      console.error('Error triggering defeat:', error);
    }
  };

  return (
    <div className="debug-buttons">
      <button 
        className="debug-btn victory-debug"
        onClick={triggerVictory}
        title="Debug Victory Screen"
      >
        Victory
      </button>
      <button 
        className="debug-btn defeat-debug"
        onClick={triggerDefeat}
        title="Debug Defeat Screen"
      >
        Defeat
      </button>
    </div>
  );
};

export default DebugButtons;