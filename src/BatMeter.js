// src/BatMeter.js
import React from 'react';
import batOutline from './bat-outline.png'; // Make sure this image is in your src folder

const BatMeter = ({ currentSpent, maxBudget }) => {
  // Calculate fill percentage
  const fillPercentage = (currentSpent / maxBudget) * 100;
  
  // Determine color based on percentage (gets more red as budget depletes)
  const getColor = () => {
    if (fillPercentage < 30) return 'rgb(130, 255, 130)'; // Green
    if (fillPercentage < 60) return 'rgb(255, 255, 130)'; // Yellow
    if (fillPercentage < 80) return 'rgb(255, 200, 100)'; // Orange
    return 'rgb(255, 130, 130)'; // Red
  };
  
  // Add danger class when budget is getting low
  const dangerClass = fillPercentage > 70 ? 'danger' : '';
  
  return (
    <div className="bat-meter-container">
      <div className={`bat-wrapper ${dangerClass}`}>
        {/* The visual fill of the bat */}
        <div 
          className="bat-image" 
          style={{ 
            backgroundImage: `url(${batOutline})`,
            clipPath: `inset(${100-fillPercentage}% 0 0 0)`, // Clip from top
            // backgroundColor: getColor()
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
          <span className="current-spent">{currentSpent}</span>
          <span className="budget-separator">/</span>
          <span className="max-budget">{maxBudget}</span>
        </div>
        <div className="budget-label">Budget Consumed</div>
      </div>
    </div>
  );
};

export default BatMeter;