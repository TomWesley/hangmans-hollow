// src/ResetButton.js
import React from 'react';
import { resetPuzzleWord } from './puzzle';

const ResetButton = () => {
  const resetGame = () => {
    // Clear all game-related localStorage items
    localStorage.removeItem('gameStateCurrent');
    localStorage.removeItem('puzzleLetters');
    localStorage.removeItem('finalChosenLetters');
    localStorage.removeItem('usedLetters');
    localStorage.removeItem('letters');
    localStorage.removeItem('preselected');
    
    // Reset the puzzle word
    resetPuzzleWord();
    
    // Reload the page
    window.location.reload(false);
  };

  return (
    <button 
      className="dev-reset-button"
      onClick={resetGame}
      title="Developer Reset Button"
    >
      Reset
    </button>
  );
};

export default ResetButton;