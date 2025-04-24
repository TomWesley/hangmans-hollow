import React, { useState, useRef, useEffect } from 'react';
import Letter from './Letter';

const LetterCarousel = ({ letters, usedLetters, onLetterSelect, onLetterConfirm, preselected }) => {
  const carouselRef = useRef(null);
  const [position, setPosition] = useState(0);
  const [startX, setStartX] = useState(null);
  const [currentDelta, setCurrentDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Filter out used letters from the carousel
  const availableLetters = letters.filter(letter => 
    !usedLetters.includes(letter.name) && !letter.isUsed
  );
  
  const letterWidth = 45; // Width of each letter item
  
  // Create a circular array that repeats the available letters multiple times for smooth scrolling
  const getCircularLetters = () => {
    // Create a buffer of letters on each side for smooth scrolling
    return [...availableLetters, ...availableLetters, ...availableLetters];
  };

  // Get the display offset based on current position
  const getDisplayStyle = () => {
    const totalWidth = availableLetters.length * letterWidth;
    
    // Ensure position stays within bounds for the middle set
    const adjustedPosition = ((position % totalWidth) + totalWidth) % totalWidth;
    
    // Add offset for the first set of letters to center the view
    const offset = -adjustedPosition + totalWidth;
    
    return {
      transform: `translateX(${offset + currentDelta}px)`,
      transition: isAnimating ? 'transform 0.3s ease-out' : 'none'
    };
  };
  
  // Move to next/prev letter with arrow buttons
  const moveBy = (steps) => {
    if (isAnimating || availableLetters.length === 0) return;
    
    setIsAnimating(true);
    setPosition(prev => prev + (steps * letterWidth));
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };
  
  // Snap to nearest letter on release
  const snapToNearestLetter = () => {
    if (availableLetters.length === 0) return;
    
    setIsAnimating(true);
    
    const totalPosition = position + currentDelta;
    const newPosition = Math.round(totalPosition / letterWidth) * letterWidth;
    
    setPosition(newPosition);
    setCurrentDelta(0);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };
  
  // Handle touch/mouse events for smooth dragging
  const handleStart = (clientX) => {
    if (isAnimating) return;
    
    setIsDragging(true);
    setStartX(clientX);
  };
  
  const handleMove = (clientX) => {
    if (!isDragging || startX === null || isAnimating) return;
    
    const delta = clientX - startX;
    setCurrentDelta(delta);
  };
  
  const handleEnd = () => {
    if (!isDragging || isAnimating) {
      setIsDragging(false);
      setStartX(null);
      return;
    }
    
    snapToNearestLetter();
    setIsDragging(false);
    setStartX(null);
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
  }, [isDragging, isAnimating]);
  
  return (
    <div className="letter-carousel-container">
      <div className="carousel-nav-container">
        <button 
          className="carousel-nav-button left-arrow" 
          onClick={() => moveBy(-1)}
          aria-label="Previous letter"
        >
          <span className="arrow-icon">&lsaquo;</span>
        </button>
        
        <div 
          className="letter-carousel"
          ref={carouselRef}
        >
          <div 
            className="carousel-track"
            style={getDisplayStyle()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {getCircularLetters().map((letter, index) => (
              <div 
                key={`${letter.id}-${Math.floor(index / availableLetters.length)}`} 
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
          onClick={() => moveBy(1)}
          aria-label="Next letter"
        >
          <span className="arrow-icon">&rsaquo;</span>
        </button>
      </div>
      
      {preselected.status && (
        <button
          className="confirm"
          onClick={() => onLetterConfirm(preselected.key)}
        >
          Confirm Guess: {preselected.value}
        </button>
      )}
      
      <div className="used-letters-container">
        <h3>Used Letters:</h3>
        <div className="used-letters-grid">
          {usedLetters.map((letter, index) => (
            <div key={index} className="used-letter">
              {letter}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LetterCarousel;