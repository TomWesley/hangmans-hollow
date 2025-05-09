// src/Letter.js
import React from 'react';

const Letter = ({ id, name, cost, isHovered, isUsed }) => {
  // For debugging - log letter data
  React.useEffect(() => {
    if (name === 'I' || name === 'J' || name === 'L') {
      console.log(`Rendering Letter: ${name} (id: ${id}, isHovered: ${isHovered}, isUsed: ${isUsed})`);
    }
  }, [name, id, isHovered, isUsed]);

  return (
    <div className="letter-container" data-letter-id={id} data-letter-name={name}>
      <span className="letter-character">{name}</span>
      <span className="letter-cost">{cost}</span>
    </div>
  );
};

export default Letter;