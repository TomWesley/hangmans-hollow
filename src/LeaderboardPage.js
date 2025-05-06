import React, { useState, useEffect } from 'react';
import { GiArrowDunk } from 'react-icons/gi';
import { getLeaderboard } from './userManagement';

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
        setLeaderboard(data);
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
            <div className='columnHeaders'>
              <span>Rank</span>
              <span>Username</span>
              <span>Win %</span>
              <span>Average Remaining Budget</span>
              <span>Favorite Letters</span>
            </div>
            
            {leaderboard.length > 0 ? (
              // Display real leaderboard data
              leaderboard.map((player, index) => (
                <div key={index} className='leaderboard'>
                  <span>#{index + 1}</span>
                  <span>{player.name}</span>
                  <span>{player.winningPercentage}%</span>
                  <span>{player.averageScore}</span>
                  <span>{player.commonLetters ? player.commonLetters.slice(0, 5).join(', ') : 'N/A'}</span>
                </div>
              ))
            ) : (
              // Display placeholder rows when there's no data
              Array.from({ length: 10 }, (_, index) => (
                <div key={index} className='leaderboard empty-row'>
                  <span>#{index + 1}</span>
                  <span>--</span>
                  <span>--</span>
                  <span>--</span>
                  <span>--</span>
                </div>
              ))
            )}
            
            {leaderboard.length > 0 && leaderboard.length < 10 && (
              // Fill remaining slots if we have some data but less than 10 players
              Array.from({ length: 10 - leaderboard.length }, (_, index) => (
                <div key={`empty-${index}`} className='leaderboard empty-row'>
                  <span>#{leaderboard.length + index + 1}</span>
                  <span>--</span>
                  <span>--</span>
                  <span>--</span>
                  <span>--</span>
                </div>
              ))
            )}
          </div>
          
          <div className="leaderboard-note">
            {leaderboard.length === 0 ? (
              <p>No players have completed any games yet. Be the first to make the leaderboard!</p>
            ) : leaderboard.length < 10 ? (
              <p>Only {leaderboard.length} players have played so far. Keep playing to stay on the board!</p>
            ) : (
              <p>These are our top players based on winning percentage. Keep playing to climb the ranks!</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;