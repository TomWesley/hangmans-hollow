// src/Letter.js
import React from 'react'

const Letter = ({ id, name, cost, isUsed, isHovered }) => {
  return (
    <article className={`letter-container ${isHovered ? 'hovered' : ''}`}>
      <div className="letter-character">{name}</div>
      <span className="letter-cost">{cost}</span>
    </article>
  )
}

export default Letter