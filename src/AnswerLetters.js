// Update these parts in your AnswerLetters.js file

import React from 'react'
import AnswerLetter from './AnswerLetter'
import { useState, useEffect } from 'react'
import { getPuzzle } from './puzzle' // Import the function instead of the default
import { encryptObject, decryptObject } from './encryption'

// Update to use mode-specific keys
const getLocalStoragePuzzleLetters = (casualMode) => {
  const key = casualMode ? 'casualPuzzleLetters' : 'competitivePuzzleLetters';
  const encryptedPuzzleLetters = localStorage.getItem(key);
  
  if (encryptedPuzzleLetters) {
    // Decrypt the puzzle letters from localStorage
    const decrypted = decryptObject(encryptedPuzzleLetters);
    if (decrypted) {
      return decrypted;
    }
  }
  
  // If nothing found, return a new puzzle for the mode
  return getPuzzle(casualMode ? 'casual' : 'competitive');
};

const AnswerLetters = (props) => {
  const u = props.u;
  const fa = props.s === 'victory';
  const casualMode = props.casualMode || false;
  
  // Use the mode to get the right puzzle
  const [puzzleLetters, setPuzzleLetters] = useState(() => 
    getLocalStoragePuzzleLetters(casualMode)
  );

  // Save encrypted puzzle letters to mode-specific localStorage key
  useEffect(() => {
    const key = casualMode ? 'casualPuzzleLetters' : 'competitivePuzzleLetters';
    const encrypted = encryptObject(puzzleLetters);
    localStorage.setItem(key, encrypted);
  }, [puzzleLetters, casualMode]);

  // Calculate the number of letters to determine responsive layout
  const letterCount = puzzleLetters.length;
  
  // Create a dynamic class name based on the number of letters
  const puzzleClass = `puzzle puzzle-${letterCount} ${fa ? 'victory' : ''}`;

  return (
    <div className="answer-letters-container">
      <div className={puzzleClass}>
        {puzzleLetters.map((answerLetter, index) => {
          // Update isHidden based on used letters
          const letterIsUsed = u.indexOf(answerLetter.name) > -1;
          
          // Return the letter component
          return (
            <div key={answerLetter.id} className="answer-letter-wrapper">
              <AnswerLetter
                st={props.s}
                key={answerLetter.id}
                id={answerLetter.id}
                name={answerLetter.name}
                isHidden={!letterIsUsed}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AnswerLetters