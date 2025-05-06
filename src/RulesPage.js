import React, { useEffect } from 'react';
import { GiArrowDunk } from 'react-icons/gi';

const RulesPage = ({ onBack }) => {
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
    <div className="rules-page">
      <div className="rules-header">
        <button 
          className="back-button menuButton" 
          onClick={onBack}
          aria-label="Back"
        >
          <GiArrowDunk />
        </button>
        <h1>Game Rules</h1>
      </div>
      
      <div className="rules-content">
        <div className="rule-section">
          <h2>How to Play</h2>
          <p>Hangman's Hollow is a word-guessing game with a twist: each letter has a different cost to play!</p>
        </div>
        
        <div className="rule-section">
          <h2>Budget System</h2>
          <p>You have 100 budget points to spend on guessing letters. Common letters like E and A cost less, while rare letters like Z and X cost more.</p>
          <p>The bat meter shows how much of your budget you've spent. When it's full, you lose!</p>
        </div>
        
        <div className="rule-section">
          <h2>Letter Selection</h2>
          <p>Swipe through the carousel to see available letters. Select a letter and then confirm your guess.</p>
          <p>If your letter is in the word, it's revealed at no cost. If not, you lose budget points equal to the letter's cost.</p>
        </div>
        
        <div className="rule-section">
          <h2>Winning & Losing</h2>
          <p>Win by revealing all letters in the word before running out of budget.</p>
          <p>Lose by exceeding your budget before completing the word.</p>
        </div>
        
        <div className="rule-section">
          <h2>Competitive Mode</h2>
          <p>In competitive mode, your performance is tracked on the global leaderboard.</p>
          <p>Players are ranked by their winning percentage and average number of missed guesses.</p>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;