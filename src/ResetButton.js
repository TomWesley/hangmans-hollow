// src/ResetButton.js
import React, { useState, useEffect } from 'react';

const ResetButton = () => {
  // Get the current mode from URL or defaulting to competitive
  const [currentMode, setCurrentMode] = useState('both');
  
  // Determine current mode from context
  useEffect(() => {
    // Check if we're on the game screen with a particular mode
    const isCasualMode = document.body.classList.contains('casual-mode') || 
                         window.location.pathname.includes('casual');
                         
    const isCompetitiveMode = document.body.classList.contains('competitive-mode') || 
                             window.location.pathname.includes('competitive');
    
    if (isCasualMode) {
      setCurrentMode('casual');
    } else if (isCompetitiveMode) {
      setCurrentMode('competitive');
    } else {
      setCurrentMode('both'); // Default to resetting both modes
    }
  }, []);
  
  // Function to reset the game
  const handleReset = () => {
    if (window.confirm('This will reset your game progress. Continue?')) {
      // Reset appropriate localStorage items based on mode
      if (currentMode === 'competitive' || currentMode === 'both') {
        localStorage.removeItem('competitiveGameStateCurrent');
        localStorage.removeItem('competitivePuzzleLetters');
        localStorage.removeItem('competitiveFinalChosenLetters');
        localStorage.removeItem('competitiveUsedLetters');
        localStorage.removeItem('competitivePuzzleWord');
        localStorage.removeItem('competitiveLetters');
      }
      
      if (currentMode === 'casual' || currentMode === 'both') {
        localStorage.removeItem('casualGameStateCurrent');
        localStorage.removeItem('casualPuzzleLetters');
        localStorage.removeItem('casualFinalChosenLetters');
        localStorage.removeItem('casualUsedLetters');
        localStorage.removeItem('casualPuzzleWord');
        localStorage.removeItem('casualLetters');
      }
      
      // Always reset these shared state items
      localStorage.removeItem('letters');
      localStorage.removeItem('preselected');
      
      // Reload the page to start fresh
      window.location.reload(false);
    }
  };
  
  return (
    <button className="dev-reset-button" onClick={handleReset}>
      Reset Game
    </button>
  );
};

export default ResetButton;