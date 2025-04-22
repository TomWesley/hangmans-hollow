import React, { useState, useRef, useEffect } from 'react';
import Letter from './Letter';

const LetterCarousel = ({ letters, usedLetters, onLetterSelect, onLetterConfirm, preselected }) => {
  const carouselRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState([]);

  // Filter out used letters from the carousel
  const availableLetters = letters.filter(letter => 
    !usedLetters.includes(letter.name) && !letter.isUsed
  );

  // Update visible letters on scroll - with proper dependency array
  useEffect(() => {
    const updateVisibleLetters = () => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.offsetWidth;
        const letterWidth = 80; // Approximate width of each letter button
        const scrollPosition = carouselRef.current.scrollLeft;
        
        // Calculate which letters are visible based on scroll position
        const startIndex = Math.floor(scrollPosition / letterWidth);
        const visibleCount = Math.ceil(containerWidth / letterWidth);
        
        const visible = availableLetters.slice(startIndex, startIndex + visibleCount);
        setVisibleLetters(visible);
      }
    };

    // Initial update
    updateVisibleLetters();
    
    // Add scroll event listener to update visible letters
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateVisibleLetters);
    }
    
    return () => {
      if (carousel) {
        carousel.removeEventListener('scroll', updateVisibleLetters);
      }
    };
  }, [availableLetters.length]); // Only re-run when availableLetters length changes

  // Touch handlers for swiping
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const distance = x - startX;
    carouselRef.current.scrollLeft = scrollLeft - distance;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="letter-carousel-container">
      <div 
        className="letter-carousel" 
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {availableLetters.map((letter, index) => (
          <div key={letter.id} className="carousel-item">
            <button
              className={`carousel-letter-btn ${letter.isHovered ? 'hovered' : ''}`}
              onClick={() => onLetterSelect(letter.id - 1)} // Using actual letter id
            >
              <Letter {...letter} />
            </button>
          </div>
        ))}
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