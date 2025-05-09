import React, { useState, useRef, useEffect } from 'react';
import Letter from './Letter';
import { getPuzzle } from './puzzle';

const LetterCarousel = ({ letters, usedLetters, onLetterSelect, onLetterConfirm, preselected, casualMode }) => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(null);
  const [lastX, setLastX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState([]);
  
  // Get the current puzzle when the component mounts or when the mode changes
  useEffect(() => {
    const puzzle = getPuzzle(casualMode ? 'casual' : 'competitive');
    setCurrentPuzzle(puzzle);
  }, [casualMode]);
  
  // Filter out used letters from the carousel
  const availableLetters = letters.filter(letter => 
    !usedLetters.includes(letter.name) && !letter.isUsed
  );
  
  // Create a map of letter costs for quick lookup
  const letterCosts = {};
  letters.forEach(letter => {
    letterCosts[letter.name] = letter.cost;
  });
  
  // Calculate visible letters (show 5 at a time)
  const getVisibleLetters = () => {
    if (availableLetters.length <= 5) {
      return availableLetters;
    }
    
    let visibleLetters = [];
    const offset = 2; // Show 2 letters before and 2 after current (total of 5)
    
    for (let i = -offset; i <= offset; i++) {
      // Get letter with wraparound
      const index = ((currentIndex + i) % availableLetters.length + availableLetters.length) % availableLetters.length;
      visibleLetters.push(availableLetters[index]);
    }
    
    return visibleLetters;
  };
  
  // Helper function to check if a letter is in the puzzle
  const isLetterInPuzzle = (letter) => {
    if (currentPuzzle && currentPuzzle.length > 0) {
      return currentPuzzle.some(puzzleLetter => puzzleLetter.name === letter);
    }
    return false;
  };
  
  // Move in a direction (positive = right, negative = left)
  const moveDirection = (direction) => {
    if (availableLetters.length === 0) return;
    
    const step = direction > 0 ? 1 : -1;
    
    setCurrentIndex(prevIndex => {
      const newIndex = (prevIndex + step + availableLetters.length) % availableLetters.length;
      return newIndex;
    });
  };
  
  // Handle touch/mouse events
  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    setLastX(clientX);
  };
  
  const handleMove = (clientX) => {
    if (!isDragging || startX === null) return;
    
    // Only detect direction changes, not exact position
    if (lastX !== null) {
      const movementX = clientX - lastX;
      
      // If moved enough in one direction, move by one letter
      if (Math.abs(movementX) > 15) { // 15px threshold to avoid accidental movements
        const direction = movementX > 0 ? -1 : 1; // Right to left = positive index
        moveDirection(direction);
        setLastX(clientX); // Update last position after moving
      }
    }
  };
  
  const handleEnd = () => {
    setIsDragging(false);
    setStartX(null);
    setLastX(null);
  };
  
  // Mouse event handlers
  const handleMouseDown = (e) => handleStart(e.clientX);
  const handleMouseMove = (e) => handleMove(e.clientX);
  const handleMouseUp = () => handleEnd();
  
  // Touch event handlers
  const handleTouchStart = (e) => handleStart(e.touches[0].clientX);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleEnd();
  
  // Clear any event listeners when component unmounts
  useEffect(() => {
    const handleMouseLeave = () => {
      if (isDragging) {
        handleEnd();
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDragging]);
  
  // Reset current index when available letters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [availableLetters.length]);
  
  return (
    <div className="letter-carousel-container">
      <div className="carousel-nav-container">
        <button 
          className="carousel-nav-button left-arrow" 
          onClick={() => moveDirection(-1)}
          aria-label="Previous letter"
          disabled={availableLetters.length <= 5}
        >
          <span className="arrow-icon">&lsaquo;</span>
        </button>
        
        <div 
          className="letter-carousel"
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="carousel-track">
            {getVisibleLetters().map((letter, index) => (
              <div 
                key={`visible-${index}`} 
                className="carousel-item"
              >
                <button
                  className={`carousel-letter-btn ${letter.isHovered ? 'hovered' : ''}`}
                  onClick={() => onLetterSelect(letter.id - 1)}
                >
                  <Letter {...letter} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="carousel-nav-button right-arrow" 
          onClick={() => moveDirection(1)}
          aria-label="Next letter"
          disabled={availableLetters.length <= 5}
        >
          <span className="arrow-icon">&rsaquo;</span>
        </button>
      </div>
      
      <button
        className={`confirm ${preselected.status ? 'active' : 'inactive'}`}
        onClick={() => preselected.status && onLetterConfirm(preselected.key)}
      >
        {preselected.status ? `Confirm Guess: ${preselected.value}` : 'Select a Letter'}
      </button>
      
      <div className="used-letters-section">
        <h3>Used Letters</h3>
        <div className="used-letters-grid">
          {usedLetters.length > 0 ? (
            usedLetters.map((letter, index) => {
              // Check if the letter is in the puzzle to determine the class
              const isCorrect = isLetterInPuzzle(letter);
              const letterClass = isCorrect ? "used-letter hit" : "used-letter";
              
              return (
                <div key={index} className={letterClass}>
                  {letter}
                  <span className="letter-cost-indicator">{letterCosts[letter]}</span>
                </div>
              );
            })
          ) : (
            <div className="no-letters-used">No letters used yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterCarousel;