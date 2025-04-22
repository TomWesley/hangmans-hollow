/**
 * Touch utility functions for improved mobile experience
 */

// Removes 300ms delay on iOS devices for better touch responsiveness
export const removeTouchDelay = () => {
    // Fast click solution for iOS
    document.addEventListener('touchstart', function() {}, { passive: true });
  };
  
  // Prevent elastic scrolling/bounce effect on iOS
  export const preventElasticScroll = () => {
    document.body.addEventListener('touchmove', function(e) {
      if (e.target.closest('.letter-carousel')) {
        // Allow scrolling within the carousel
        return;
      }
      // Prevent scrolling outside of carousels
      e.preventDefault();
    }, { passive: false });
  };
  
  // Add active touch state for buttons to provide visual feedback
  export const addActiveTouchState = () => {
    document.body.addEventListener('touchstart', function(e) {
      const target = e.target.closest('button');
      if (target && !target.classList.contains('carousel-letter-btn')) {
        target.classList.add('touch-active');
      }
    }, { passive: true });
    
    document.body.addEventListener('touchend', function(e) {
      const buttons = document.querySelectorAll('.touch-active');
      buttons.forEach(button => button.classList.remove('touch-active'));
    }, { passive: true });
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
    preventElasticScroll();
    addActiveTouchState();
    
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
    preventElasticScroll,
    addActiveTouchState,
    vibrate,
    initTouchUtils
  };