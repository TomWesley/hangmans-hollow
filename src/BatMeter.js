// src/BatMeter.js
import React from 'react';
import batOutline from './images/bat-outline.png'; // We'll add this to your src/images folder

const BatMeter = ({ score, maxScore }) => {
  // Calculate fill percentage (inverted so it fills up as score decreases)
  const fillPercentage = ((maxScore - score) / maxScore) * 100;
  
  return (
    <div className="bat-meter-container">
      <div className="bat-wrapper">
        <div className="bat-outline" style={{ backgroundImage: `url(${batOutline})` }}>
          <div 
            className="bat-fill" 
            style={{ 
              height: `${fillPercentage}%`,
              WebkitMaskImage: `url(${batOutline})`,
              maskImage: `url(${batOutline})`
            }}
          ></div>
        </div>
      </div>
      <div className="misses-text">
        Misses Remaining: {score}
      </div>
    </div>
  );
};

export default BatMeter;