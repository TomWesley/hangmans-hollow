import React, { useState, useEffect } from 'react';
import { GiArrowDunk } from 'react-icons/gi';
import { getLeaderboard } from './userManagement';

// Helper function to truncate text with ellipsis
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
};

const LeaderboardPage = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch leaderboard data when component mounts
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await getLeaderboard(10);
        // Process data to enforce character limits
        const processedData = data.map(player => ({
          ...player,
          name: truncateText(player.name, 10), // Limit username to 10 characters
          commonLetters: player.commonLetters ? player.commonLetters.slice(0, 5) : [] // Limit to 3 favorite letters
        }));
        setLeaderboard(processedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <button 
          className="back-button menuButton" 
          onClick={onBack}
          aria-label="Back"
        >
          <GiArrowDunk />
        </button>
        <h1>Global Leaderboard</h1>
      </div>

      {isLoading ? (
        <div className="leaderboard-loading">
          <h2>Loading leaderboard data...</h2>
        </div>
      ) : (
        <>
          <div className='lBoard'>
            {/* Add divider elements - they use ::before and ::after for the first two dividers */}
            <div className="vertical-divider-1"></div>
            <div className="vertical-divider-2"></div>
            
            <div className='columnHeaders'>
              <span className="header-cell">Rank</span>
              <span className="header-cell">Username</span>
              <span className="header-cell">Win %</span>
              <span className="header-cell">Avg Budget</span>
              <span className="header-cell">Favorite Letters</span>
            </div>
            
            {leaderboard.length > 0 ? (
              // Display real leaderboard data
              leaderboard.map((player, index) => (
                <div key={index} className='leaderboard'>
                  <span className="data-cell">#{index + 1}</span>
                  <span className="data-cell">{player.name}</span>
                  <span className="data-cell">{player.winningPercentage}%</span>
                  <span className="data-cell">{player.averageScore}</span>
                  <span className="data-cell">{player.commonLetters ? player.commonLetters.join(', ') : 'N/A'}</span>
                </div>
              ))
            ) : (
              // Display placeholder rows when there's no data
              Array.from({ length: 10 }, (_, index) => (
                <div key={index} className='leaderboard empty-row'>
                  <span className="data-cell">#{index + 1}</span>
                  <span className="data-cell">--</span>
                  <span className="data-cell">--</span>
                  <span className="data-cell">--</span>
                  <span className="data-cell">--</span>
                </div>
              ))
            )}
            
            {leaderboard.length > 0 && leaderboard.length < 10 && (
              // Fill remaining slots if we have some data but less than 10 players
              Array.from({ length: 10 - leaderboard.length }, (_, index) => (
                <div key={`empty-${index}`} className='leaderboard empty-row'>
                  <span className="data-cell">#{leaderboard.length + index + 1}</span>
                  <span className="data-cell">--</span>
                  <span className="data-cell">--</span>
                  <span className="data-cell">--</span>
                  <span className="data-cell">--</span>
                </div>
              ))
            )}
          </div>
          
          {/* <div className="leaderboard-note">
            {leaderboard.length === 0 ? (
              <p>No players have completed any games yet. Be the first to make the leaderboard!</p>
            ) : leaderboard.length < 10 ? (
              <p>Only {leaderboard.length} players have played so far. Keep playing to stay on the board!</p>
            ) : (
              <p>These are our top players based on winning percentage. Keep playing to climb the ranks!</p>
            )}
          </div> */}
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;