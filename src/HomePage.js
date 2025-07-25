import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="arcade-container">
        <div className="arcade-header">
          <h1 className="arcade-title">WESLEY ARCADE</h1>
          <div className="arcade-subtitle">Entertainment Zone</div>
        </div>
        
        <div className="games-grid">
          <div className="game-card">
            <div className="game-icon">🎯</div>
            <h3 className="game-title">Hangman's Hollow</h3>
            <p className="game-description">Test your word skills in this classic hangman game with a dark twist</p>
            <a href="/HangmansHollow" className="play-button">
              PLAY NOW
            </a>
          </div>
          
          <div className="game-card">
            <div className="game-icon">🌌</div>
            <h3 className="game-title">The Void</h3>
            <p className="game-description">Explore the mysterious void in this atmospheric adventure</p>
            <a href="/void" className="play-button">
              PLAY NOW
            </a>
          </div>
          
          <div className="game-card coming-soon">
            <div className="game-icon">🎮</div>
            <h3 className="game-title">More Games</h3>
            <p className="game-description">New games coming soon...</p>
            <div className="play-button disabled">
              COMING SOON
            </div>
          </div>
        </div>
        
        <div className="arcade-footer">
          <div className="neon-text">Welcome to the Arcade</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 