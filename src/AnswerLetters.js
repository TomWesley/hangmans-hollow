// Updated AnswerLetters.js with forced refresh capability
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
  
  // If force refresh is true, skip localStorage and get a new puzzle
  if (forceRefresh) {
    console.log(`Forcing fresh puzzle for ${modeString} mode`);
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
  
  // If nothing found or invalid, return a new puzzle for the mode
  console.log(`Generating new puzzle for ${modeString} mode`);
  // Use timestamp to ensure fresh puzzle
  const timestamp = Date.now() + Math.floor(Math.random() * 1000);
  return getPuzzle(modeString, timestamp); 
};

const AnswerLetters = (props) => {
  const u = props.u;
  const fa = props.s === 'victory';
  const casualMode = props.casualMode || false;
  
  // Add last render time ref to detect component remounts
  const lastRenderTimeRef = useRef(Date.now());
  
  // Track if we've loaded fresh puzzle letters this render
  const [freshPuzzleLoaded, setFreshPuzzleLoaded] = useState(false);
  
  // Use the mode to get the right puzzle
  const [puzzleLetters, setPuzzleLetters] = useState(() => {
    console.log("AnswerLetters initial state load");
    const letters = getLocalStoragePuzzleLetters(casualMode);
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