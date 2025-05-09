/**
 * Touch utility functions for improved mobile experience
 */

// Removes 300ms delay on iOS devices for better touch responsiveness
export const removeTouchDelay = () => {
  // Fast click solution for iOS
  document.addEventListener('touchstart', function() {}, { passive: true });
};

// Prevent elastic scrolling/bounce effect on iOS

// Add active touch state for buttons to provide visual feedback
export const addActiveTouchState = () => {
  document.body.addEventListener('touchstart', function(e) {
    const target = e.target.closest('button');
    if (target && !target.classList.contains('carousel-letter-btn') && !target.classList.contains('carousel-nav-button')) {
      target.classList.add('touch-active');
    }
  }, { passive: true });
  
  document.body.addEventListener('touchend', function(e) {
    const buttons = document.querySelectorAll('.touch-active');
    buttons.forEach(button => button.classList.remove('touch-active'));
  }, { passive: true });
};

// Handle carousel wraparound scrolling
export const handleCarouselWraparound = () => {
  document.addEventListener('DOMContentLoaded', () => {
    // Find all carousel containers
    const carousels = document.querySelectorAll('.letter-carousel');
    
    carousels.forEach(carousel => {
      // Handle scroll end to ensure proper wraparound
      carousel.addEventListener('scroll', () => {
        // Debounce the scroll event
        clearTimeout(carousel.scrollTimeout);
        
        carousel.scrollTimeout = setTimeout(() => {
          const scrollWidth = carousel.scrollWidth;
          const containerWidth = carousel.clientWidth;
          const scrollPosition = carousel.scrollLeft;
          
          // If we've scrolled past the first repetition, reset to the middle repetition
          if (scrollPosition > (2 * scrollWidth / 3)) {
            carousel.scrollTo({
              left: scrollPosition - (scrollWidth / 3),
              behavior: 'auto'
            });
          } else if (scrollPosition < (scrollWidth / 3)) {
            carousel.scrollTo({
              left: scrollPosition + (scrollWidth / 3),
              behavior: 'auto'
            });
          }
        }, 100);
      });
    });
  });
};

// Provide haptic feedback if supported (requires secure context)
export const vibrate = (duration = 20) => {
  if (window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(duration);
    } catch (e) {
      // Silently fail if vibration is not supported or permissions not granted
    }
  }
};

// Initialize all touch utilities
export const initTouchUtils = () => {
  removeTouchDelay();
  
  addActiveTouchState();
  handleCarouselWraparound();
  
  // Add CSS for touch feedback
  const style = document.createElement('style');
  style.textContent = `
    .touch-active {
      transform: scale(0.95);
      opacity: 0.9;
    }
    
    /* Remove tap highlight on iOS */
    * {
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);
};

export default {
  removeTouchDelay,
  
  addActiveTouchState,
  vibrate,
  handleCarouselWraparound,
  initTouchUtils
};