import React, { useEffect } from 'react';
import { GiArrowDunk } from 'react-icons/gi';

const PrizesPage = ({ onBack }) => {
  // Enable scrolling when this component mounts
  useEffect(() => {
    // Reference to the page container element
    const pageElement = document.querySelector('.rules-page') || 
                        document.querySelector('.prizes-page') || 
                        document.querySelector('.leaderboard-page');
    
    if (!pageElement) return;
    
    // Handle touch start
    const handleTouchStart = (e) => {
      // Allow default touch behavior on these pages
      // This is crucial for scrolling to work
    };
    
    // Handle touch move
    const handleTouchMove = (e) => {
      // Allow default touch behavior for scrolling
      // Do not call preventDefault() here
    };
    
    // Add event listeners with passive: true
    // This tells the browser we won't call preventDefault()
    pageElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    pageElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Clean up
    return () => {
      pageElement.removeEventListener('touchstart', handleTouchStart);
      pageElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  useEffect(() => {
    // Enable scrolling on the page
    document.documentElement.classList.add('special-page-active');
    document.body.classList.add('special-page-active');
    
    // Clean up when unmounting
    return () => {
      document.documentElement.classList.remove('special-page-active');
      document.body.classList.remove('special-page-active');
    };
  }, []);
  
  return (
    <div className="prizes-page">
      <div className="prizes-header">
        <button 
          className="back-button menuButton" 
          onClick={onBack}
          aria-label="Back"
        >
          <GiArrowDunk />
        </button>
        <h1>Prizes</h1>
      </div>
      
      <div className="prizes-content">
        <div className="prize-section">
          <h2>Monthly Competitions</h2>
          <p>Each month, the top three players on our leaderboard will receive special recognition and digital badges for their profile.</p>
        </div>
        
        <div className="prize-section">
          <h2>Perfect Score Rewards</h2>
          <p>Complete a word with more than 50 budget points remaining to earn a "Word Master" badge. Collect these badges to unlock special game themes.</p>
        </div>
        
        <div className="prize-section">
          <h2>Upcoming Tournaments</h2>
          <p>Stay tuned for our seasonal tournaments where players compete for exclusive in-game content and real-world prizes!</p>
        </div>
        
        <div className="prize-section bonus-section">
          <h2>Coming Soon!</h2>
          <p>We're working on adding more exciting prizes and rewards to Hangman's Hollow. Check back regularly for updates!</p>
        </div>
      </div>
    </div>
  );
};

export default PrizesPage;