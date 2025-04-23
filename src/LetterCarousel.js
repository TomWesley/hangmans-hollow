import React, { useState, useRef, useEffect } from 'react';
import Letter from './Letter';

const LetterCarousel = ({ letters, usedLetters, onLetterSelect, onLetterConfirm, preselected }) => {
  const carouselRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManualScroll, setIsManualScroll] = useState(false);

  // Filter out used letters from the carousel
  const availableLetters = letters.filter(letter => 
    !usedLetters.includes(letter.name) && !letter.isUsed
  );

  // Set up the circular array
  // Duplicate letters at beginning and end to create wraparound effect
  const getCircularArray = () => {
    // Need at least 3 sets for proper wraparound
    const fullArray = [...availableLetters, ...availableLetters, ...availableLetters];
    return fullArray;
  };

  const circularLetters = getCircularArray();

  // Calculate the offset to center the first set of letters
  useEffect(() => {
    if (carouselRef.current && availableLetters.length > 0) {
      const letterWidth = 60; // Width of each letter element
      const middleOffset = availableLetters.length * letterWidth;
      
      // Offset to the middle of the three sets of letters
      // This ensures we can scroll in both directions with wraparound
      carouselRef.current.scrollLeft = middleOffset;
    }
  }, [availableLetters.length]);

  // Handle wraparound scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current || isManualScroll) return;

      const container = carouselRef.current;
      const letterWidth = 60;
      const totalSetWidth = availableLetters.length * letterWidth;
      
      // Check if we've scrolled past the middle set
      if (container.scrollLeft < totalSetWidth / 2) {
        // Jumped to first set, reposition to middle set
        container.scrollLeft += totalSetWidth;
      } else if (container.scrollLeft > totalSetWidth * 2.5) {
        // Jumped to third set, reposition to middle set
        container.scrollLeft -= totalSetWidth;
      }
      
      // Update current index based on scroll position
      const relativePosition = container.scrollLeft % totalSetWidth;
      const newIndex = Math.round(relativePosition / letterWidth);
      setCurrentIndex(newIndex % availableLetters.length);
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (carousel) {
        carousel.removeEventListener('scroll', handleScroll);
      }
    };
  }, [availableLetters.length, isManualScroll]);

  // Scroll to prev/next letter with arrow buttons
  const scrollToLetter = (direction) => {
    if (!carouselRef.current) return;
    
    setIsManualScroll(true);
    
    const letterWidth = 60;
    const targetScroll = carouselRef.current.scrollLeft + (direction * letterWidth);
    
    carouselRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    
    // Reset manual scroll flag after animation
    setTimeout(() => {
      setIsManualScroll(false);
    }, 300);
  };

  const scrollPrev = () => scrollToLetter(-1);
  const scrollNext = () => scrollToLetter(1);

  // Touch handlers for swiping
  const handleTouchStart = (e) => {
    setIsManualScroll(true);
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollPosition(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const distance = x - startX;
    
    // Only scroll by direct finger movement
    carouselRef.current.scrollLeft = scrollPosition - distance;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Snap to nearest letter
    if (carouselRef.current) {
      const letterWidth = 60;
      const currentScroll = carouselRef.current.scrollLeft;
      const targetIndex = Math.round(currentScroll / letterWidth);
      
      carouselRef.current.scrollTo({
        left: targetIndex * letterWidth,
        behavior: 'smooth'
      });
      
      // Reset manual scroll flag after snap animation completes
      setTimeout(() => {
        setIsManualScroll(false);
      }, 300);
    }
  };

  return (
    <div className="letter-carousel-container">
      <div className="carousel-nav-container">
        <button 
          className="carousel-nav-button left-arrow" 
          onClick={scrollPrev}
          aria-label="Scroll left"
        >
          <span className="arrow-icon">&lsaquo;</span>
        </button>
        
        <div 
          className="letter-carousel" 
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {circularLetters.map((letter, index) => (
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
        
        <button 
          className="carousel-nav-button right-arrow" 
          onClick={scrollNext}
          aria-label="Scroll right"
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