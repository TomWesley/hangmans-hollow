import React, { useState, useRef, useEffect } from 'react';
import Letter from './Letter';

const LetterCarousel = ({ letters, usedLetters, onLetterSelect, onLetterConfirm, preselected }) => {
  const carouselRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out used letters from the carousel
  const availableLetters = letters.filter(letter => 
    !usedLetters.includes(letter.name) && !letter.isUsed
  );

  // Calculate the number of visible letters based on container width
  const calculateVisibleCount = () => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth;
      const letterWidth = 60; // Approximate width of each letter button with margin
      return Math.floor(containerWidth / letterWidth);
    }
    return 5; // Default number of visible letters
  };

  // Update visible letters on scroll - with proper dependency array
  useEffect(() => {
    const updateVisibleLetters = () => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.offsetWidth;
        const letterWidth = 60; // Approximate width of each letter button with margin
        const scrollPosition = carouselRef.current.scrollLeft;
        
        // Calculate which letters are visible based on scroll position
        const startIndex = Math.floor(scrollPosition / letterWidth);
        const visibleCount = Math.ceil(containerWidth / letterWidth);
        
        setCurrentIndex(startIndex % availableLetters.length);
        
        // Handle wraparound for visible letters
        let visible = [];
        for (let i = 0; i < visibleCount; i++) {
          const index = (startIndex + i) % availableLetters.length;
          visible.push(availableLetters[index]);
        }
        
        setVisibleLetters(visible);
      }
    };

    // Initial update
    updateVisibleLetters();
    
    // Add scroll event listener to update visible letters
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateVisibleLetters);
      // Initial scroll position to center the carousel
      if (availableLetters.length > 0) {
        const visibleCount = calculateVisibleCount();
        const letterWidth = 60;
        carousel.scrollLeft = (availableLetters.length * letterWidth) / 2 - (visibleCount * letterWidth) / 2;
      }
    }
    
    return () => {
      if (carousel) {
        carousel.removeEventListener('scroll', updateVisibleLetters);
      }
    };
  }, [availableLetters.length]);

  // Scroll to specific letter index
  const scrollToIndex = (index) => {
    if (carouselRef.current && availableLetters.length > 0) {
      const letterWidth = 60;
      const normalizedIndex = ((index % availableLetters.length) + availableLetters.length) % availableLetters.length;
      
      // Create a "virtual" scroll position that wraps around
      const targetScrollLeft = normalizedIndex * letterWidth;
      carouselRef.current.scrollLeft = targetScrollLeft;
    }
  };

  // Scroll one letter left
  const scrollPrev = () => {
    scrollToIndex(currentIndex - 1);
  };

  // Scroll one letter right
  const scrollNext = () => {
    scrollToIndex(currentIndex + 1);
  };

  // Touch handlers for swiping
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollPosition(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const distance = x - startX;
    carouselRef.current.scrollLeft = scrollPosition - distance;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Create a duplicated array to simulate wrapping
  // By repeating the available letters multiple times, we create the illusion of a circular carousel
  const createCarouselItems = () => {
    // How many times to duplicate the letters for a smooth wrap effect
    const repetitions = 3;
    let items = [];
    
    for (let rep = 0; rep < repetitions; rep++) {
      availableLetters.forEach((letter, index) => {
        items.push(
          <div 
            key={`${letter.id}-${rep}`} 
            className="carousel-item"
            data-index={index}
          >
            <button
              className={`carousel-letter-btn ${letter.isHovered ? 'hovered' : ''}`}
              onClick={() => onLetterSelect(letter.id - 1)} // Using actual letter id
            >
              <Letter {...letter} />
            </button>
          </div>
        );
      });
    }
    
    return items;
  };

  return (
    <div className="letter-carousel-container">
      <div className="carousel-nav-container">
        <button 
          className="carousel-nav-button left-arrow" 
          onClick={scrollPrev}
          aria-label="Scroll left"
        >
          <span>&lsaquo;</span>
        </button>
        
        <div 
          className="letter-carousel" 
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {createCarouselItems()}
        </div>
        
        <button 
          className="carousel-nav-button right-arrow" 
          onClick={scrollNext}
          aria-label="Scroll right"
        >
          <span>&rsaquo;</span>
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