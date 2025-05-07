// src/BatMeter.js
import React from 'react';
import batOutline from './bat-outline.png';

const BatMeter = ({ currentSpent, maxBudget, gameStatus }) => {
  // Calculate fill percentage
  const fillPercentage = (currentSpent / maxBudget) * 100;
  
  // Determine color based on percentage and game status
  const getFilter = () => {
    if (gameStatus === 'victory') {
      // Dark green filter for victory
      return 'brightness(0) saturate(100%) invert(27%) sepia(88%) saturate(1011%) hue-rotate(100deg) brightness(95%) contrast(101%)';
    } else {
      // Original red/black filter for normal/defeat
      return 'brightness(0) saturate(100%) invert(17%) sepia(91%) saturate(5910%) hue-rotate(0deg) brightness(55%) contrast(124%)';
    }
  };
  
  // Add game status class and danger class when budget is getting low
  const wrapperClass = `bat-wrapper ${gameStatus || ''} ${fillPercentage > 70 ? 'danger' : ''}`;
  
  return (
    <div className={`bat-meter-container ${gameStatus || ''}`}>
      <div className={wrapperClass}>
        {/* The visual fill of the bat */}
        <div 
          className="bat-image" 
          style={{ 
            backgroundImage: `url(${batOutline})`,
            clipPath: `inset(${100-fillPercentage}% 0 0 0)`, // Clip from top
            filter: getFilter()
          }}
        ></div>
        
        {/* The outline of the bat */}
        <div 
          className="bat-outline"
          style={{ backgroundImage: `url(${batOutline})` }}
        ></div>
      </div>
      
      <div className="budget-indicator">
        <div className="budget-text">
          <span className={`current-spent ${gameStatus || ''}`}>{currentSpent}</span>
          <span className="budget-separator">/</span>
          <span className="max-budget">{maxBudget}</span>
        </div>
      </div>
    </div>
  );
};

export default BatMeter;