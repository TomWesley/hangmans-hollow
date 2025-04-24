import React, { useState, useRef, useEffect } from 'react';
import Letter from './Letter';

const LetterCarousel = ({ letters, usedLetters, onLetterSelect, onLetterConfirm, preselected }) => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Filter out used letters from the carousel
  const availableLetters = letters.filter(letter => 
    !usedLetters.includes(letter.name) && !letter.isUsed
  );
  
  // Calculate visible letters (show 5 at a time)
  const getVisibleLetters = () => {
    if (availableLetters.length <= 5) {
      return availableLetters;
    }
    
    let visibleLetters = [];
    for (let i = 0; i < 5; i++) {
      // Get letter with wraparound
      const index = (currentIndex + i) % availableLetters.length;
      visibleLetters.push(availableLetters[index]);
    }
    
    return visibleLetters;
  };
  
  // Move to the next letter
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % availableLetters.length
    );
  };
  
  // Move to the previous letter
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + availableLetters.length) % availableLetters.length
    );
  };
  
  // Handle manual drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || startX === null) return;
    
    const deltaX = e.clientX - startX;
    
    // Only change index if dragged far enough to consider it intentional
    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
      
      // Reset drag after handling
      setIsDragging(false);
      setStartX(null);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setStartX(null);
  };
  
  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging || startX === null) return;
    
    const deltaX = e.touches[0].clientX - startX;
    
    // Only change index if dragged far enough to consider it intentional
    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
      
      // Reset drag after handling
      setIsDragging(false);
      setStartX(null);
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    setStartX(null);
  };
  
  // Clear any event listeners when component unmounts
  useEffect(() => {
    const handleMouseLeave = () => {
      setIsDragging(false);
      setStartX(null);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return (
    <div className="letter-carousel-container">
      <div className="carousel-nav-container">
        <button 
          className="carousel-nav-button left-arrow" 
          onClick={handlePrev}
          aria-label="Previous letter"
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
          {getVisibleLetters().map((letter) => (
            <div 
              key={letter.id} 
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
        
        <button 
          className="carousel-nav-button right-arrow" 
          onClick={handleNext}
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