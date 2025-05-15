// Updated AnswerLetters.js with synchronization fix for refresh
import React, { useState, useEffect, useRef } from 'react'
import AnswerLetter from './AnswerLetter'
import { getPuzzle, verifyPuzzleMatchesWord } from './puzzle'
import { encryptObject, decryptObject } from './encryption'

// Add timestamp parameter for cache busting
const getLocalStoragePuzzleLetters = (casualMode, forceRefresh = false) => {
  // Use mode-specific key
  const key = casualMode ? 'casualPuzzleLetters' : 'competitivePuzzleLetters';
  const wordKey = casualMode ? 'casualPuzzleWord' : 'competitivePuzzleWord';
  const modeString = casualMode ? 'casual' : 'competitive';
  
  // First check for casual player state
  const encryptedCasualState = localStorage.getItem('casualPlayerState');
  let enforcedCasualMode = casualMode;
  
  // If there's a mismatch between mode and casualPlayerState, use casualPlayerState
  if (encryptedCasualState) {
    try {
      const isCasual = decryptObject(encryptedCasualState);
      if (isCasual === true && !casualMode) {
        console.log("Enforcing casual mode from casualPlayerState");
        enforcedCasualMode = true;
        const casualKey = 'casualPuzzleLetters';
        
        // Get puzzle from the correct mode
        const encryptedCasualPuzzle = localStorage.getItem(casualKey);
        if (encryptedCasualPuzzle) {
          try {
            const decryptedCasual = decryptObject(encryptedCasualPuzzle);
            if (decryptedCasual && Array.isArray(decryptedCasual) && decryptedCasual.length > 0) {
              console.log("Using casual puzzle letters from localStorage due to casualPlayerState");
              return decryptedCasual;
            }
          } catch (e) {
            console.error("Error decrypting casual puzzle letters:", e);
          }
        }
      }
    } catch (e) {
      console.error("Error checking casualPlayerState:", e);
    }
  }
  
  // If force refresh is true, skip localStorage and get a new puzzle
  // This should ONLY be true when Play Again is clicked
  if (forceRefresh) {
    console.log(`Forcing fresh puzzle for ${modeString} mode`);
    // Use timestamp as cache buster to force new puzzle
    const timestamp = Date.now() + Math.floor(Math.random() * 1000);
    return getPuzzle(modeString, timestamp);
  }
  
  const encryptedPuzzleLetters = localStorage.getItem(key);
  
  if (encryptedPuzzleLetters) {
    try {
      // Decrypt the puzzle letters from localStorage
      const decrypted = decryptObject(encryptedPuzzleLetters);
      
      if (decrypted && Array.isArray(decrypted) && decrypted.length > 0) {
        // Verify this puzzle matches the stored word
        const isValid = verifyPuzzleMatchesWord(modeString);
        
        if (isValid) {
          console.log(`Using valid stored puzzle for ${modeString} mode:`, 
                      decrypted.map(l => l.name).join(''));
          return decrypted;
        } else {
          console.warn(`Stored puzzle doesn't match word for ${modeString} mode, generating new one`);
        }
      } else {
        console.warn("Decrypted puzzle is invalid:", decrypted);
      }
    } catch (e) {
      console.error("Error decrypting puzzle letters:", e);
    }
  }
  
  // If nothing found or invalid, return a new puzzle for the mode - WITHOUT TIMESTAMP
  // to avoid generating new puzzles on refresh
  console.log(`Getting new puzzle for ${modeString} mode`);
  return getPuzzle(modeString); 
};

const AnswerLetters = (props) => {
  const u = props.u;
  const fa = props.s === 'victory';
  
  // Ensure we're using the correct mode - check casualPlayerState
  const casualMode = (() => {
    if (props.casualMode) return true; // If props say casual, use casual
    
    // Otherwise check localStorage
    const encryptedCasualState = localStorage.getItem('casualPlayerState');
    if (encryptedCasualState) {
      try {
        const isCasual = decryptObject(encryptedCasualState);
        if (isCasual === true) {
          console.log("AnswerLetters: Using casual mode from casualPlayerState");
          return true;
        }
      } catch (e) {
        console.error("Error checking casualPlayerState in AnswerLetters:", e);
      }
    }
    return props.casualMode || false; // Default to prop value
  })();
  
  // Add last render time ref to detect component remounts
  const lastRenderTimeRef = useRef(Date.now());
  
  // Track if we've loaded fresh puzzle letters this render
  const [freshPuzzleLoaded, setFreshPuzzleLoaded] = useState(false);
  
  // Use the mode to get the right puzzle
  const [puzzleLetters, setPuzzleLetters] = useState(() => {
    console.log("AnswerLetters initial state load with casualMode:", casualMode);
    
    // Try to get existing puzzle letters from localStorage first
    const key = casualMode ? 'casualPuzzleLetters' : 'competitivePuzzleLetters';
    const encryptedPuzzleLetters = localStorage.getItem(key);
    
    if (encryptedPuzzleLetters) {
      try {
        const decrypted = decryptObject(encryptedPuzzleLetters);
        if (decrypted && Array.isArray(decrypted) && decrypted.length > 0) {
          const puzzleWord = decrypted.map(l => l.name).join('');
          console.log(`AnswerLetters: Using stored ${casualMode ? 'casual' : 'competitive'} puzzle: ${puzzleWord}`);
          setFreshPuzzleLoaded(true);
          return decrypted;
        }
      } catch (e) {
        console.error("Error decrypting stored puzzle letters:", e);
      }
    }
    
    // If no valid stored puzzle, get a new one
    const letters = getLocalStoragePuzzleLetters(casualMode);
    const puzzleWord = letters.map(l => l.name).join('');
    console.log(`AnswerLetters: Created new ${casualMode ? 'casual' : 'competitive'} puzzle: ${puzzleWord}`);
    setFreshPuzzleLoaded(true);
    return letters;
  });

  // Force refresh when component is remounted with a new key
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    // If this is a fast remount (less than 100ms), it's likely due to a key change
    if (timeSinceLastRender < 100) {
      console.log("AnswerLetters detected force remount, refreshing puzzle");
      const newPuzzleLetters = getLocalStoragePuzzleLetters(casualMode, true);
      setPuzzleLetters(newPuzzleLetters);
    }
    
    // Update last render time
    lastRenderTimeRef.current = now;
  }, []);

  // Re-fetch puzzle when mode changes
  useEffect(() => {
    console.log(`AnswerLetters: Mode changed to ${casualMode ? 'casual' : 'competitive'}`);
    
    // Only load new puzzle if we haven't already loaded one this render
    if (!freshPuzzleLoaded) {
      const newPuzzleLetters = getLocalStoragePuzzleLetters(casualMode);
      console.log(`Loaded puzzle for ${casualMode ? 'casual' : 'competitive'} mode:`, 
                  newPuzzleLetters.map(l => l.name).join(''));
      setPuzzleLetters(newPuzzleLetters);
      setFreshPuzzleLoaded(true);
    } else {
      console.log("Skipping puzzle reload as fresh puzzle was already loaded");
      setFreshPuzzleLoaded(false); // Reset for next mode change
    }
  }, [casualMode]);

  // Save encrypted puzzle letters to mode-specific localStorage key
  useEffect(() => {
    if (puzzleLetters && puzzleLetters.length > 0) {
      const key = casualMode ? 'casualPuzzleLetters' : 'competitivePuzzleLetters';
      
      // Add debugging
      console.log(`Saving puzzle letters for ${casualMode ? 'casual' : 'competitive'} mode:`, 
                  puzzleLetters.map(l => l.name).join(''));
      
      const encrypted = encryptObject(puzzleLetters);
      localStorage.setItem(key, encrypted);
    }
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
            <div key={`letter-${answerLetter.id}-${index}`} className="answer-letter-wrapper">
              <AnswerLetter
                st={props.s}
                key={`answer-${answerLetter.id}-${index}`}
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