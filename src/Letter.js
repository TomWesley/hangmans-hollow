
// src/Letter.js
import React from 'react'

const Letter = ({ id, name, cost, isUsed, isHovered }) => {
  return (
    <article className="letter-container">
      <h2>{name}</h2>
      <span className="letter-cost">{cost}</span>
    </article>
  )
}

export default Letter