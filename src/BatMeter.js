// src/BatMeter.js
import React from 'react';
import batOutline from './bat-outline.png'; // Make sure this is in your src/images folder

const BatMeter = ({ currentSpent, maxBudget }) => {
  // Calculate fill percentage
  const fillPercentage =  (currentSpent / maxBudget) * 100;
  
  return (
    <div className="bat-meter-container">
      <div className="bat-wrapper">
        {/* The visible bat image with clip-path applied */}
        <div 
          className="bat-image" 
          style={{ 
            backgroundImage: `url(${batOutline})`,
            clipPath: `inset(${100-fillPercentage}% 0 0 0)` // Clip from top
          }}
        ></div>
        
        {/* The outline of the bat that's always visible */}
        <div 
          className="bat-outline"
          style={{ backgroundImage: `url(${batOutline})` }}
        ></div>
      </div>
      <div className="budget-text">
        {currentSpent}/{maxBudget} Consumed
      </div>
    </div>
  );
};

export default BatMeter;