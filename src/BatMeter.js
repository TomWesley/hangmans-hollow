// src/BatMeter.js
import React from 'react';
import batOutline from './bat-outline.png'; // Make sure this is in your src/images folder

const BatMeter = ({ score, maxScore }) => {
  // Calculate fill percentage (inverted so it fills up as score decreases)
  // At score = maxScore (full health), we want 0% filled
  // At score = 0 (game over), we want 100% filled
  const fillPercentage = 20+((maxScore - score) / maxScore) * 80;
  
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
      <div className="misses-text">
        Misses Remaining: {score}
      </div>
    </div>
  );
};

export default BatMeter;